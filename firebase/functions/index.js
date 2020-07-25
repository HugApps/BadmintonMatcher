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
exports.createNewUser = functions.auth.user().onCreate((user) => {

    const dbUrl = 'https://badmintonmatcher-4f217.firebaseio.com/clients/' + user.uid + '.json';
    const profileUrl = "https://badmintonmatcher-4f217.firebaseio.com/profiles/" + user.uid + ".json";

    console.log(user);
    var createUser = axios.put(
        dbUrl,
        {
            user_id: user.uid,
            email: user.email,
            name: user.displayName,
            score: 1000,
            matches: {},
            profilePicUrL: user.photoURL
        }
    );

    var userProfile = {
        display_name: "",
        email: user.email,
        score: user.score,
        summary: "",
        phone: "",
        years_of_exp: "",
        sex: "",
        game_mode: ""
    }


    var createProfile = axios.put(profileUrl, userProfile);
    return Promise.all([createUser, createProfile]);
});



exports.pollMatchQueue = functions.https.onCall((data, context) => {
    let user_id = context.auth.uid;
    let match_queue_ref = db.ref('match_queue/' + user_id);
    console.log('user id used for polling', user_id);
    // find if queue with user exists, then use it to find a match, or update the range
    return match_queue_ref.once("value")
        .then((queue) => {
            //nothing was found
            if (queue.val() == null) {
                return { data: 'No queue with id found' }
            } else {

                let currentPlayerQueue = queue.val();
                let range = currentPlayerQueue["range"];
                let bestMatch = null;
                let needRangeAdjust = {};
                var currentQueues = db.ref('match_queue');
                let lowMMRBound = parseInt(currentPlayerQueue["mmr"]) - range;
                let highMMRBound = parseInt(currentPlayerQueue["mmr"]) + range;
                console.log('searching through other players')
                return currentQueues.orderByChild('mmr').startAt(lowMMRBound).endAt(highMMRBound).limitToFirst(5).once("value").then((results) => {
                    
                    let potentialMatches = [ ];
                    console.log('range find results',results.numChildren() ,potentialMatches.length);
                    // for each result find a player that is within range
                    results.forEach((player) => {
                    
                        if (player.key != queue.key) {
                            console.log(player.val());
                            let withinRange = false;
                            let opponentRangeHigh = player.val()["mmr"] + player.val()["range"];
                            let opponentRangeLow = player.val()["mmr"] - player.val()["range"];
                            let difference = Math.abs(player.val()["mmr"] - currentPlayerQueue["mmr"]);
                            console.log('range search',opponentRangeLow,player.val()["mmr"],opponentRangeHigh,difference);
                            if (currentPlayerQueue["mmr"] >= opponentRangeLow && currentPlayerQueue["mmr"] <= opponentRangeHigh) {
                                withinRange = true;
                            }

                            if(withinRange){
                                potentialMatches.push({ id: player.key, val: player.val() ,difference:difference});
                            }
                           
                        }

                    });

                    //If no matches, increase current player's range
                    if(potentialMatches.length == 0) {
                        console.log('no matches',potentialMatches.length);
                        return db.ref('match_queue/' + context.auth.uid + '/range').set(range + 100).then((result)=>{ console.log('updated range');return {data:result}})
                    } else {
                        console.log('some matches');
                        potentialMatches.sort((a,b)=>{
                            return a.difference - b.difference;
                        });

                        console.log('sorted some matches',potentialMatches.length,potentialMatches);
                        return db.ref('matches').push({
                            sets: {},
                            status: 'queued',
                            venue_id: 1,
                            time: null,
                            date: null,
                            team_1: currentPlayerQueue['user_id'],
                            team_2: potentialMatches[0].id,
                            team_1_mmr: currentPlayerQueue["mmr"],
                            team_2_mmr: currentPlayerQueue["mmr"]
                        }).then((result) => {
                            console.log('match created'); return {data:result};
                        });

                    }

                })
                .catch((error)=>{ console.log(error); return {error:error}})
            }
        })
        .catch((error) => { return { data: error } });
})




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

exports.clearMatchedQueue = functions.database.ref('matches/{id}').onCreate(async (snapShot, context) => {
    //Delete queue referenced in match object
    let match = snapShot.val();
    return db.ref('match_queue/' + match['team_1']).remove()
        // remove the players from the queue
        .then((ra) => { return db.ref('match_queue/' + match['team_2']).remove() })
        //add the match to each player's matches
        .then(
            () => {
                return db.ref('clients/' + match['team_1'] + '/matches').push(snapShot.key)
            })

        .then(
            () => {
                return db.ref('clients/' + match['team_2'] + '/matches').push(snapShot.key)
            })
        .then((rb) => { return snapShot.ref.set(snapShot.val()) })
        .catch((err) => { console.log('failed to delete'); return snapShot.ref.set(snapShot.val()) }

        )
})

// INSTead of updating range on initial QUEUE entry, do it during poll check, use players search range as default
//Poll every 1 to 5 mins to create a match, if no match increase the search range ( player search range + some factor)



exports.createMatches = functions.database.ref('/match_queue/{id}')
    .onCreate(async (snapShot, context) => {
        //default range to +/- 500 mmr points

        let defaultRange = 500;
        let updatedData = snapShot.val();
        if (updatedData['range']) {
            defaultRange = updatedData['range']
        } else {
            updatedData['range'] = defaultRange;
        }

        console.log('query with range', defaultRange);
        let minDiff = 90000;
        let bestMatch = null;
        let needRangeAdjust = {};
        var currentQueues = db.ref('match_queue');
        let lowMMRBound = parseInt(updatedData["mmr"]) - defaultRange;
        let highMMRBound = parseInt(updatedData["mmr"]) + defaultRange;
        currentQueues.orderByChild('mmr').startAt(lowMMRBound).endAt(highMMRBound).limitToFirst(10).once("value").then((results) => {
            let potentialMatches = [];

            results.forEach((s) => {
                if (s.key != snapShot.key) {
                    potentialMatches.push({ id: s.key, val: s.val() })
                }

            })

            console.log(potentialMatches);

            //find one perfect match for this player
            potentialMatches.forEach((player) => {
                //is other player's range conditions satisfied?
                let withinRange = false;
                let opponentRangeHigh = player.val["mmr"] + player.val["range"];
                let opponentRangeLow = player.val["mmr"] - player.val["range"];
                if (updatedData["mmr"] >= opponentRangeLow && updatedData["mmr"] <= opponentRangeHigh) {
                    withinRange = true;
                }

                let diff = Math.abs(updatedData["mmr"] - player.val["mmr"]);

                if (diff <= minDiff && withinRange) {
                    minDiff = diff;
                    bestMatch = player;
                } else {
                    let queryKey = player.id + '/range';
                    needRangeAdjust[queryKey] = player.val["range"] + 100;
                    //not a valid match reduce their mmr
                }
            })

            // current player cannot find best match, reduce their range


            return currentQueues.update(needRangeAdjust).then((success) => {

                if (bestMatch == null) {
                    updatedData['range'] = updatedData['range'] + 100;
                    return snapShot.ref.set(updatedData);
                } else {
                    return db.ref('matches').push({
                        sets: {},
                        status: 'queued',
                        venue_id: 1,
                        time: null,
                        date: null,
                        team_1: updatedData['user_id'],
                        team_2: bestMatch.id,
                        team_1_mmr: updatedData["mmr"],
                        team_2_mmr: bestMatch.val["mmr"]
                    }).then((result) => {
                        return snapShot.ref.set(updatedData);
                    });

                }

            })
        })
    })



exports.addToMatchMakingQueue = functions.https.onCall((data, context) => {
    //keep match making simple for now, only check if its within a certain range of mmr
    const apiUrl = "https://badmintonmatcher-4f217.firebaseio.com/match_queue/" + context.auth.uid + ".json";
    const userUrl = "https://badmintonmatcher-4f217.firebaseio.com/clients/" + context.auth.uid + "/score.json";


    axios.get(userUrl).then((result) => {

        var new_queue = {
            user_id: context.auth.uid,
            match_type: 0,
            range: 500,
            mmr: result.data,
            priority: 0,
            time_stamp: new Date()
        }


        return axios.put(apiUrl, new_queue)
    }).then((result) => { return result.data })

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

// load profile 

app.get('/my_profile', (req, res) => {

    //Check if token is present 
    //check token is verified and valid using admin sdk 
    //using admin-sdk retrieve user profile based on uid, and email
    //return json of profile or error out 
});







//need a cloud function to create a buisnness logic rep of the client 



//view_public_profile
//update_profile
//find_users_based_on_mmr 



//Matches
// scheudle a match  (create a match)
//get_match_history
//finish_match
//abandon_match

//Teams
// make a team 
// find_a_team
// join_a_team
// leave_team
//

//Venues
//create_venue
//view_venue




//Addresses
//create_address
//read_address
//delete_address


//





//future admin routes

//Exposes custom routes  cloud function to firebase
exports.client_api = functions.https.onRequest(app);
