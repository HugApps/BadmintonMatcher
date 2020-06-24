const functions = require('firebase-functions');

const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const axios = require('axios');


admin.initializeApp(functions.config().firebase);
const app = express();

app.use(cors({ origin: true }));


//client routes
//User express to handle custom routes
app.get('/', (req, res) => res.send('helloworld'));
app.post('/sign_up', (req, res) => res.send('helloworld'));
app.post('/', (req, res) => res.send('helloworld'));


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
    return axios.patch(apiUrl,data).then((result) => {
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
