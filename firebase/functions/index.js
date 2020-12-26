const functions = require('firebase-functions');

const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const axios = require('axios');
const { query } = require('express');
const { user } = require('firebase-functions/lib/providers/auth');


admin.initializeApp();
const app = express();

app.use(cors({ origin: true }));


//client routes
//User express to handle custom routes
app.get('/', (req, res) => res.send('helloworld'));
app.post('/sign_up', (req, res) => res.send('helloworld'));
app.post('/', (req, res) => res.send('helloworld'));
const db = admin.database();


//Users
//Create : sign_up
exports.signUp = functions.https.onCall((data, context) => {

    let user_details = {
        email: data.email,
        emailVerified: true,
        password: data.password,
        displayName: data.displayName,
        photoURL: data.photoURL ? data.photoURL : null,
        disabled: false
    }

    return admin.auth().createUser(user_details).then((result) => {
        if (result) {
            return { data: 'success', result: result }
        }
    })
        .catch((error) => {
            return { data: "registration error" }
        })
});



exports.createNewUser = functions.auth.user().onCreate((user) => {

    const dbUrl = 'https://badmintonmatcher-4f217.firebaseio.com/clients/' + user.uid + '.json';
    const profileUrl = "https://badmintonmatcher-4f217.firebaseio.com/profiles/" + user.uid + ".json";


    var createUser = axios.put(
        dbUrl,
        {
            user_id: user.uid,
            email: user.email,
            name: user.displayName,
            mmr: 2000,
            display_name: user.displayName,
            profilePicUrL: user.photoURL
        }
    );

    var userProfile = {
        display_name: user.displayName,
        email: user.email,
        mmr: user.mmr,
    }


    var createProfile = axios.put(profileUrl, userProfile);
    return Promise.all([createUser, createProfile]);
});

exports.getSearchStatus = functions.https.onCall((data, context) => {
    let user_id = context.auth.uid;
    let match_queue_ref = db.ref('match_queue/' + user_id);
    return match_queue_ref.once("value")
        .then((queue) => {
            //nothing was found
            if (queue.val() == null) {
                return { data: null }
            } else {
                return { data: queue.key }
            }
        }).catch((error) => { return { data: 'something whent wrong' } })
});


exports.pollMatchQueue = functions.https.onCall((data, context) => {
    let user_id = context.auth.uid;
    let match_queue_ref = db.ref('match_queue/' + user_id);
    // find if queue with user exists, then use it to find a match, or update the range
    return match_queue_ref.once("value")
        .then((queue) => {
            //nothing was found
            if (queue.val() == null) {
                // could be case where a new match is already found, so when user is polling their queue is already gone.
                return { data: 'No queue with id found' }
            } else {

                let currentPlayerQueue = queue.val();
                let range = currentPlayerQueue["range"];
                var currentQueues = db.ref('match_queue');
                let lowMMRBound = parseInt(currentPlayerQueue["mmr"]) - range;
                let highMMRBound = parseInt(currentPlayerQueue["mmr"]) + range;

                return db.ref('clients/' + user_id + '/matches').orderByChild('opponent').once('value').then((snapShot) => {

                    let alreadyMatched = [];
                    snapShot.forEach((match) => {
                        let currentMatchStatus = match.val()['status'];

                        if (currentMatchStatus == 'queued' || currentMatchStatus == 'active') {
                            if (match.val()['opponent'] != null) {
                                alreadyMatched.push(match.val()['opponent']['id'])
                            }
                        }
                    })

                    if (alreadyMatched.length > 0) {
                        return { data: 'error' }
                    }

                    //Search for pther plays who are queued, within lowerMMRBOUND and highMMRBOUND
                    return currentQueues.orderByChild('mmr').startAt(lowMMRBound).endAt(highMMRBound).limitToFirst(5).once("value").then((results) => {
                        let potentialMatches = [];
                        // for each result find a player that is within range
                        results.forEach((player) => {
                            //prevent queing with yourself
                            if (player.key != queue.key) {
                                let withinRange = false;
                                let opponentRangeHigh = player.val()["mmr"] + player.val()["range"];
                                let opponentRangeLow = player.val()["mmr"] - player.val()["range"];
                                let difference = Math.abs(player.val()["mmr"] - currentPlayerQueue["mmr"]);
                                if (currentPlayerQueue["mmr"] >= opponentRangeLow && currentPlayerQueue["mmr"] <= opponentRangeHigh) {
                                    withinRange = true;
                                }

                                if (withinRange) {
                                    potentialMatches.push({ id: player.key, val: player.val()['user'], difference: difference });
                                }

                            }
                        });
                        //If no matches, increase current player's range
                        if (potentialMatches.length == 0) {
                            return db.ref('match_queue/' + context.auth.uid + '/range').set(range + 100).then((result) => { return { data: 'searching' } })
                        } else {
                            potentialMatches.sort((a, b) => {
                                return a.difference - b.difference;
                            });




                            //create a match object
                            return db.ref('matches').push({
                                sets: {},
                                status: 'queued',
                                venue_id: 1,
                                time: null,
                                date: null,
                                team_1: currentPlayerQueue['user_id'],
                                team_1_data: currentPlayerQueue['user'],
                                team_1_status:'pending',
                                team_2_data: potentialMatches[0].val,
                                team_2: potentialMatches[0].id,
                                team_1_mmr: currentPlayerQueue["mmr"],
                                team_2_mmr: potentialMatches[0].val["mmr"],
                                team_2_status:'pending',
                            }).then((result) => {
                                return { data: 'match found' };
                            });

                        }

                    }).catch((error) => { return { error: "error here???" } })

                }).catch((error) => { return { error: "error here???" } })

            }
        }).catch((error) => { return { data: 'error' } });
})





exports.cancelQueue = functions.https.onCall((data, context) => {
    db.ref('match_queue/' + context.auth.uid).remove().then((result) => { return { status: 'removed', result: result } }).catch((error) => {
        return { status: 'error removing' }
    })
});



//for testing orderBy
exports.getQueues = functions.https.onCall((data, context) => {

    var results = { "smallest": [], "largest": [] }
    var dbRef = db.ref('match_queue')
    return dbRef.orderByChild('mmr').limitToFirst(2).once("value")
        .then((snapshotSmall) => {
            snapshotSmall.forEach((s) => {
                results["smallest"].push({ id: s.key, value: s.val() });
            })
            return dbRef.orderByChild('mmr').limitToLast(2).once("value");
        })
        .then((large) => {
            large.forEach((s) => {
                results["largest"].push({ id: s.key, value: s.val() });
            });
            var upperBoundDiff = results["largest"][1]["value"]["mmr"] - results["largest"][0]["value"]["mmr"];
            if (upperBoundDiff < 10000) {
                db.ref('matches').push({
                    team_1: results["largest"][1].id,
                    team_2: results["largest"][0].id,
                    team_1_mmr: results["largest"][1]["value"]["mmr"],
                    team_2_mmr: results["largest"][0]["value"]["mmr"]
                });
                //create new match object with their ids
            }

            var lowerBountDiff = results["smallest"][1]["value"]["mmr"] - results["smallest"][0]["value"]["mmr"];
            if (upperBoundDiff < 10000) {
                db.ref('matches').push({
                    team_1: results["smallest"][1].id,
                    team_2: results["smallest"][0].id,
                    team_1_mmr: results["smallest"][1]["value"]["mmr"],
                    team_2_mmr: results["smallest"][0]["value"]["mmr"]
                });
                //create new match object with their ids

            }
            return { lowerDiff: lowerBountDiff, upperDiff: upperBoundDiff }
        });

    // const apiUrl = 'https://badmintonmatcher-4f217.firebaseio.com/match_queue.json?orderBy="time_stamp&startAt="'+ new Date() +'"';
    // return axios.get(apiUrl).then((result)=>{return result.data}).catch((error)=>{return error})
});

exports.createMatches = functions.database.ref('matches/{id}')
    .onCreate(async (snapShot, context) => {
        //Delete queue referenced in match object
        let match = snapShot.val();
        return db.ref('match_queue/' + match['team_1']).remove()
            // remove the players from the queue
            .then((ra) => { return db.ref('match_queue/' + match['team_2']).remove() })
            //add the match to each player's matches
            .then(
                () => {
                    return db.ref('clients/' + match['team_1'] + '/matches').child(snapShot.key).set({

                        status: 'queued',
                        opponent: match['team_2'],
                        opponent_details: match['team_2_data']

                    })
                    /*return db.ref('clients/' + match['team_1'] + '/matches').push(
                        {
                            match_detail_id: snapShot.key,
                            status: 'queued',
                            opponent: match['team_2']
                        })
                    */
                })

            .then(
                () => {
                    return db.ref('clients/' + match['team_2'] + '/matches').child(snapShot.key).set({
                        status: 'queued',
                        opponent: match['team_1'],
                        opponent_details: match['team_1_data']
                    })
                    /*return db.ref('clients/' + match['team_2'] + '/matches').push({
                        match_detail_id: snapShot.key,
                        opponent: match['team_1'],
                        status: 'queued'
                    })
                    */
                })
            .then((rb) => { return snapShot.ref.set(snapShot.val()) })
            .catch((err) => { return snapShot.ref.set(snapShot.val()) }

            )
    });


exports.deleteMatches = functions.database.ref('matches/{id}').onDelete(async (snapShot, context) => {
    let deletedMatch = snapShot.val();
    let playerOne = deletedMatch['team_1'];
    let playerTwo = deletedMatch['team_2'];
    let playerOneRemoved = await db.ref('/clients/' + playerOne + '/matches/' + snapShot.key).remove();
    let playerTwoRemoved = await db.ref('/clients/' + playerTwo + '/matches/' + snapShot.key).remove();
    if (playerOneRemoved && playerTwoRemoved) {
        return { status: 'Match deleted' }
    }

})
/*.onDelete(async(snapShot,context)=>{
    const match = snapShot.val();
    let teamOne = match['team_1'];
    let teamTwo = match['team_2'];


})
*/


exports.teamOneStatusUpdated = functions.database.ref('matches/{match_id}/{match_field}').onUpdate(async (update, context) => {
    const updatedValue = update.after.val();
    const params = context.params;
    const match_id = params.match_id;
    const field = params.match_field
    db.ref('/matches/'+ match_id).on('value',(snapShot) =>{

        let {team_1,team_2,team_1_status,team_2_status ,team_1_data,team_2_data} = snapShot.val();
        
        console.log('debug snapshot data',team_1,team_2)

        if(field == 'team_1_status' || field == 'team_2_status') {
          
            if(updatedValue == 'decline') {
               //if status is not the same, notify the one who is true
               if(team_1_status != team_2_status){

                   let sender = field == "team_1_status" ? team_1_data['display_name'] : team_2_data['display_name'];

                   let notify_target = (sender == team_1_data['display_name']) ? team_2 : team_1;
                  
                   let message = {
                       title: 'Match cancelled',
                       message:'Match with ' + sender + ' is cancelled'
                   }
                   db.ref('/clients/'+ notify_target+'/messages').push(message);
                   db.ref('/matches/'+ match_id).remove();
               }
    
            }
    
    
    
        }
    
    })

    return {status:'ok'}
})







exports.addToMatchMakingQueue = functions.https.onCall((data, context) => {
    //keep match making simple for now, only check if its within a certain range of mmr
    const apiUrl = "https://badmintonmatcher-4f217.firebaseio.com/match_queue/" + context.auth.uid + ".json";
    const userUrl = "https://badmintonmatcher-4f217.firebaseio.com/clients/" + context.auth.uid + "/score.json";
    let new_queue = {};
    db.ref('clients/' + context.auth.uid).once('value').then((snapShot) => {

        let currentUser = snapShot.val()
        new_queue = {
            user_id: context.auth.uid,
            created_at: new Date(),
            match_type: 0,
            range: 500,
            mmr: currentUser.mmr,
            user: {
                email: currentUser.email,
                mmr: currentUser.mmr,
                display_name: currentUser.display_name,
                display_pic: currentUser.profilePicUrL,
                id: currentUser.user_id
            },
            time_stamp: new Date()
        }
        return axios.put(apiUrl, new_queue)
    }).then((result) => { return { result: new_queue } })
        .catch((error) => { return { status: 'error' } });
});


exports.loadUserProfile = functions.https.onCall((data, context) => {
    const apiUrl = "https://badmintonmatcher-4f217.firebaseio.com/profiles/" + context.auth.uid + ".json";

    return axios.get(apiUrl).then((result) => {
        return result.data;
    }).catch((error) => {
        return {
            status: context.auth.uid,
        }
    });
    // Authentication / user information is automatically added to the request.
});

exports.updateUserProfile = functions.https.onCall((data, context) => {
    const apiUrl = "https://badmintonmatcher-4f217.firebaseio.com/profiles/" + context.auth.uid + ".json";
    const text = data.text;
    return axios.patch(apiUrl, data).then((result) => {
        return result.data;
    }).catch((error) => { return error })
});

exports.getLatestMatch = functions.https.onCall((data, context) => {
    let user_id = context.auth.uid;
    db.ref('/clients/' + user_id + '/matches').orderByKey().once('child_added').then((result) => {
        if (result) {

            return db.ref('/matches/' + result.key).once('child_added').then((snapShot) => {
                return snapShot.val()
            })
                .catch((matchError) => { return { status: 'fail to get match details' } })
        }

    }).catch((error) => {
        return { status: error }
    })

})
exports.updateMatchStatus = functions.https.onCall((data, context) => {
    let match = data.match
    let valid_statusues = ['queued', 'pending', 'scheduled', 'complete']

    //* have to update both player's matches??? and match details
    db.ref('match_details/' + match.match_detail_id + '/status/').set(valid_statusues[1]).then((result) => {
        if (result) {
            return { success: true }
        } else {
            return { success: false }
        }
    })
})



exports.updatePlayerMatchStatus = functions.https.onCall((data, context) => {
    let match_id = data.match_id;
    let status_index = data.status_index;
    let userId = context.auth.uid;
    let valid_statusues = ['accept', 'decline', 'complete'];

    //get Match requested

    db.ref('/matches/' + match_id).once('value').then((snapShot) => {
        let matchRequested = snapShot.val();
        let user_team = null;
        // determine which team they are in this match object
        if (matchRequested['team_1'] == userId) {
            user_team = 'team_1_status'

        } else {
            user_team = 'team_2_status'
        }
        return db.ref('/matches/' + match_id + '/').child(user_team).set(valid_statusues[status_index]).then((result) => {
            if (result) {
                return { success: true }
            } else {
                return { success: false }
            }
        })
    })

})





exports.client_api = functions.https.onRequest(app);
