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

// const authSubscribe = auth().onAuthStateChanged(onAuthStateChanged);
//import auth from '@react-native-firebase/auth';




function setAuthToken(token){




}

export default function App() {

  const AuthStack = createStackNavigator();
  //when firebase or back end validates credentials 
  const authState = [loggedIn, setLoggedIn] = useState(false)
  //token you get from store device
  const userToken = [user, setUser] = useState(false);
  //loading assets or authenticating state
  const loadingState = [loading, setLoading] = useState(false);



// @refresh reset
  console.log(loggedIn)
  console.log(user);

  //get authentication first, either from device or firebase
  if (loading) {
    return (
      <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
        <Text>Loading</Text>
      </View>
    )
  }

  if (!user && !loggedIn) {

    return (
      <NavigationContainer>
        <AuthStack.Navigator>
          <AuthStack.Screen 
            name="LoginScreen"  
            component={LoginScreen}  
            initialParams ={
              {
                onLoginSuccess:(token)=>{
                 setUser(token);
                 setLoggedIn(true);
                }
              } }
              />
          <AuthStack.Screen name="RegisterScreen" component={RegisterForm} />
        </AuthStack.Navigator>
      </NavigationContainer>
    );


  } else {

    return (
      <View>
        <Text>Future drawer navigation dashboard page</Text>
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


