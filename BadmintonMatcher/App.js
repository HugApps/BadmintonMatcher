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
  Button
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


// const authSubscribe = auth().onAuthStateChanged(onAuthStateChanged);
//import auth from '@react-native-firebase/auth';
console.disableYellowBox = true; 
export default function App() {

  const AuthStack = createStackNavigator();
  //when firebase or back end validates credentials 
  const [loggedIn, setLoggedIn] = useState(false)
  //token you get from store device
  const [user, setUser] = useState(false);
  //loading assets or authenticating state
  const [loading, setLoading] = useState(true);
  const onSignUp = (email, password) => {
    if (email == null || password == null) {
      console.log('no email and password is provided');
    }
    if (email.length == 0 || password.length == 0) {
      console.log('Please provide a email and password to signup with');
    }
    auth().createUserWithEmailAndPassword(email, password).then((result) => {
      console.log('Sign up successful');
      return result;
    })
      .catch((error) => {
        console.log(email, password)
        if (error.code === 'auth/email-already-in-use') {
          console.log('That email address is already in use!');
        }

        if (error.code === 'auth/invalid-email') {
          console.log('That email address is invalid!');
        }

        console.error(error);
      });

  }


  const onSignIn = (email,password) =>{
    auth().signInWithEmailAndPassword(email,password).then((result)=>{
      if(result){
        console.log('log in successful',result);
        return result;
      }
    }).catch((error)=>{
      console.log(error);
      return error;
    });
  }


  const setAuthToken = (token) => {
    console.log('state changed right?')
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


  if (!user) {

    return (
      <NavigationContainer>
        <AuthStack.Navigator>
          <AuthStack.Screen
            name="LoginScreen"
            headerShown={false}
            component={LoginScreen}
            options={{ headerShown:false,title: null }}
            initialParams={
              {
                onLogin: (email,password) => {
                  onSignIn(email,password)
                }
              }}
          />
          <AuthStack.Screen
            name="RegisterScreen"
            initialParams={
              {
                onRegister: (email, password) => {
                  onSignUp(email, password)
                }
              }}
            component={RegisterForm} />
        </AuthStack.Navigator>
      </NavigationContainer>
    );


  } else {
  
    return (

      <View style={{ flex: 1,alignContent:"center",justifyContent:"center" }}>
        <Text>Future drawer navigation dashboard page</Text>
        <Text>{user.email}</Text>
        <Button 
            onPress={()=>{auth().signOut().then(()=>{setUser(false);})}}
            title={"Log out"}/>
      </View>

    )
  }




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


