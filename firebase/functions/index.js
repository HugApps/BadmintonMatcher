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

/*exports.processQueue = functions.database.ref('/match_queue')
    .onCreate((snapshot, context) => {
      // Grab the current value of what was written to the Realtime Database.
      const original = snapshot.val();


      const apiUrl = 'https://badmintonmatcher-4f217.firebaseio.com/match_queue.json?orderBy=;

      var currentQueue = axios.get(apiUrl)
      const priority= original.priority;
      // You must return a Promise when performing asynchronous tasks inside a Functions such as
      // writing to the Firebase Realtime Database.
      // Setting an "uppercase" sibling in the Realtime Database returns a Promise.
      return snapshot.ref.parent.child('uppercase').set(uppercase);
    });
*/


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

async function createMatchBaseOnMMR() {
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

}



exports.clearMatchedQueue = functions.database.ref('matches/{id}').onCreate(async (snapShot, context) => {
    //Delete queue referenced in match object
    let match = snapShot.val();
    console.log('team 1 id', match['team_1']);
    console.log('team 2 id', match['team_2']);
    return db.ref('match_queue/' + match['team_1']).remove()
        .then((ra) => { return db.ref('match_queue/' + match['team_2']).remove() })
        .then((rb) => { return snapShot.ref.set(snapShot.val()) })
        .catch((err) => { console.log('failed to delete'); return snapShot.ref.set(snapShot.val()) }

        )

})




exports.createMatches = functions.database.ref('/match_queue/{id}')
    .onCreate(async (snapShot, context) => {
        //default range to +/- 500 mmr points
        let defaultRange = 500;
        let minDiff = 90000;
        let updatedData = snapShot.val();
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

            console.log('update hashmap', needRangeAdjust);

            return currentQueues.update(needRangeAdjust).then((success) => {

                if (bestMatch == null) {
                    updatedData['range'] = updatedData['range'] + 100;
                    return snapShot.ref.set(updatedData);
                } else {
                    return db.ref('matches').push({
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
