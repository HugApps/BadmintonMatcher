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



function CustomDrawerContainer(props) {
  console.log('drawer props',props);
  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />
      <DrawerItem
        label="Help"
        onPress={() => Linking.openURL('https://mywebsite.com/help')}
      />
      <DrawerItem label="Logout" onPress={() => {auth.signOut()}} />
    </DrawerContentScrollView>
  )


}



const Drawer = createDrawerNavigator();

function DemoScreen(props) {

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>{props.route.params.title}</Text>
    </View>
  )
}

export default function DashBoard({ route, navigation }) {

  const { auth } = route.params;

  return (
      <Drawer.Navigator initialRouteName="Home" drawerContent={props => CustomDrawerContainer({ ...props })}>
        <Drawer.Screen name="Main" component={DemoScreen} initialParams={{ auth:auth, title:'main page' }} />
        <Drawer.Screen name="Profile" component={DemoScreen} initialParams={{auth:auth, title: 'profile page' }} />
        <Drawer.Screen name="Matches" component={DemoScreen} initialParams={{ auth:auth, title:'Match history page' }} />
        <Drawer.Screen name="Search" component={DemoScreen} nitialParams={{ auth:auth,title: 'Player search' }} />
      </Drawer.Navigator>
  );
}




