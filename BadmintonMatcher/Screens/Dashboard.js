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

import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from '@react-navigation/drawer';
import auth from '@react-native-firebase/auth';
import ProfileScreen from './ProfileScreen';
import SearchScreen from './MatchSearchScreen';
import MatchesScreen from './MatchesScreen';
import MatchEdit from './MatchEdit';
//import console = require('console');


function CustomDrawerContainer(props) {

  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />
      <DrawerItem
        label="Help"
        onPress={() => Linking.openURL('https://mywebsite.com/help')}
      />
      <DrawerItem label="Logout" onPress={() => {props.logout()}} />
    </DrawerContentScrollView>
  )


}



const Drawer = createDrawerNavigator();

function DemoScreen(props) {
  const user =   auth().currentUser
  console.log('logged in user',user);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>{user.displayName}</Text>
      <Text>{user.email}</Text>
    </View>
  )
}

export default function DashBoard(props) {

  console.log('DashBoard',props.route.params.match_id)

  return (
      <Drawer.Navigator initialRouteName="Home" drawerContent={stuff => <CustomDrawerContainer logout={()=>{props.route.params.logout()}} {...stuff}/>}>
        <Drawer.Screen name="Main" component={DemoScreen} initialParams={{  title:'main page' }} />
        <Drawer.Screen name="Profile" component={ProfileScreen} initialParams={{title: 'profile page' }} />
        <Drawer.Screen name="Matches" component={MatchesScreen} initialParams={{  title:'Match history page' }} />
        <Drawer.Screen name="Search" component={SearchScreen} intialParams={{   title: 'Player search' }} />
        <Drawer.Screen name="MatchEdit" component={MatchEdit} nitialParams={{   title: 'Match Edit' }} />
      </Drawer.Navigator>
  );
}




