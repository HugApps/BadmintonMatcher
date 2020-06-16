const functions = require('firebase-functions');

const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const axios = require('axios');


admin.initializeApp(functions.config().firebase);
const app = express();

app.use(cors({origin:true}));


//client routes
//User express to handle custom routes
app.get('/',(req,res)=> res.send('helloworld'));
app.post('/sign_up',(req,res)=> res.send('helloworld'));
app.post('/',(req,res)=> res.send('helloworld'));


//Users
//Create : sign_up
exports.createNewUser = functions.auth.user().onCreate((user)=>{
     
    const dbUrl = 'https://badmintonmatcher-4f217.firebaseio.com/clients.json'

    console.log(user);
    axios.post(
        dbUrl,
        {   
            user_id: user.uid,
            email:user.email,
            name:user.displayName,
            score:1000,
            profilePicUrL:user.photoURL
           }
   );
});


exports.loadUserProfile = functions.https.onCall((data,context)=>{
    console.log('loadUserProfileCalled',context,data);
    return {data:"complete",context:context}
});

// load profile 

app.get('/my_profile',(req,res) => {

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
