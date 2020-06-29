const functions = require('firebase-functions');

const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const axios = require('axios');


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
                results["smallest"].push({id:s.key,...s.val()});
            })
            return dbRef.orderByChild('mmr').limitToLast(2).once("value");
        })
        .then((large) => {
            large.forEach((s) => {
                results["largest"].push({id:s.key, ...s.val()});
            })
            console.log(results["smallest"][0]["mmr"]);
            var upperBoundDiff = results["largest"][1]["mmr"] - results["largest"][0]["mmr"];
            var lowerBountDiff = results["smallest"][1]["mmr"] - results["smallest"][0]["mmr"];



            return { lowerDiff: lowerBountDiff, upperDiff: upperBoundDiff }
        });

    // const apiUrl = 'https://badmintonmatcher-4f217.firebaseio.com/match_queue.json?orderBy="time_stamp&startAt="'+ new Date() +'"';
    // return axios.get(apiUrl).then((result)=>{return result.data}).catch((error)=>{return error})
});




exports.addToMatchMakingQueue = functions.https.onCall((data, context) => {
    //keep match making simple for now, only check if its within a certain range of mmr
    const apiUrl = "https://badmintonmatcher-4f217.firebaseio.com/match_queue/" + context.auth.uid + ".json";
    const userUrl = "https://badmintonmatcher-4f217.firebaseio.com/clients/" + context.auth.uid + "/score.json";


    axios.get(userUrl).then((result) => {

        var new_queue = {
            user_id: context.auth.uid,
            match_type: 0,
            mmr: result.data,
            priority: 0,
            time_stamp: new Date()
        }

        axios.put(apiUrl, new_queue);
        return { status: 'ok' }
    }).catch((error) => { return { status: 'error' } });



});


exports.loadUserProfile = functions.https.onCall((data, context) => {
    const apiUrl = "https://badmintonmatcher-4f217.firebaseio.com/profiles/" + context.auth.uid + ".json";
    return axios.get(apiUrl).then((result) => {
        return result.data;
    }).catch((error) => { return error })
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
