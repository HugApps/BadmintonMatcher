/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */
import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';

import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  Button,
  Alert 
} from 'react-native';

import {
  Header,
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { LoginScreen, RegisterForm } from './Screens/AuthScreens';
import auth from '@react-native-firebase/auth';
import DashBoard from './Screens/Dashboard';
import AuthScreens from './Screens/AuthScreens';


// const authSubscribe = auth().onAuthStateChanged(onAuthStateChanged);
//import auth from '@react-native-firebase/auth';
console.disableYellowBox = true; 
export default function App() {

  const MainStack = createStackNavigator();
  //when firebase or back end validates credentials 
  const [loggedIn, setLoggedIn] = useState(false)
  //token you get from store device
  const [user, setUser] = useState(false);
  //loading assets or authenticating state
  const [loading, setLoading] = useState(true);



  const logout =() =>{
    auth().signOut().then((result)=>{console.log('signed out'); setUser(null); setLoading(false);
    setLoggedIn(false);}).catch((error)=>{console.log(error)})
  //props.route.params
  }
  const onSignUp = (email, password,displayName) => {

    auth().createUserWithEmailAndPassword(email, password).then((result) => {
       if(result){
        console.log('Sign up successful');
        auth().currentUser.updateProfile({displayName:displayName}).then((result)=>{
          setUser(result);
          setLoading(false);
          setLoggedIn(true);

        }).catch((error)=>{
          Alert.alert('Sign up error', error.message);
        });
       }
     
    }).catch((error) => {
            Alert.alert('Sign up error', error.message);
    });

}


const onSignIn = (email, password) => {
  auth().signInWithEmailAndPassword(email, password).then((result) => {
        if (result) {
            setUser(result);
            console.log('USER PROPERTIES',result);
            setLoading(false);
            setLoggedIn(true);
            
        }
    }).catch((error) => {

        console.log(error);
        Alert.alert('Login error', error.message);
        return error;
    });
}
  


// @refresh reset
  const setAuthToken = (token) => {
    console.log('state changed right?',token)
    if (token != null) {
      setUser(token);
      setLoading(false);
      return;

    }

  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(setAuthToken);
    return subscriber; // unsubscribe on unmount
  }, [user]);


  //@refresh reset
  //get authentication first, either from device or firebase
  

  //if (!user) {

    return (
      <NavigationContainer>
        <MainStack.Navigator>
          {!user ? (
            <MainStack.Screen 
              name ="AuthStack"  
              initialParams={{login:onSignIn,register:onSignUp} } component = {AuthScreens}/>) : ( <MainStack.Screen name ="DashBoard"  initialParams={{logout:logout} } component = {DashBoard}/>)}         
        </MainStack.Navigator>
      </NavigationContainer>
    );

}

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  engine: {
    position: 'absolute',
    right: 0,
  },
  body: {
    backgroundColor: Colors.white,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
  },
  highlight: {
    fontWeight: '700',
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
  },
});


