import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';

import {
    SafeAreaView,
    StyleSheet,
    ScrollView,
    View,
    Text,
    StatusBar,
    Image,
    TextInput,
} from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import {
    DrawerContentScrollView,
    DrawerItemList,
    DrawerItem,
} from '@react-navigation/drawer';
import auth from '@react-native-firebase/auth';




/* takes in 
    callback to update state
    initial value for place holder,
    and label

*/
/// @refresh reset 
function InputRow(props) {


    return (
        <View style={{ flex: 1, flexDirection: 'row', padding: 20, justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 12, color: 'white' }}>{props.label}</Text>
            <TextInput
                style={{ padding: 10, borderWidth: 1, height: 50, borderRadius: 20, color: 'white', marginRight: '25%' }}
                placeholder={props.value}

                onChangeText={(text) => { props.onInput(text) }}
            />

        </View>
    )
}



function DisplayBanner(props) {
    const [user, setUser] = useState(auth().currentUser);
    return (
        <View style={{ flex: 1, margin:10,padding:10,alignItems: 'center', justifyContent: 'flex-start' }} >
            <Text style={{ color: 'white', fontSize: 16, margin: 10 }}>Personal Profile</Text>
            <Image style={{ backgroundColor: 'white', width: 100, height: 100, borderRadius: 100 / 2 }} source={require("./assets/logo.png")}></Image>
            <Text style={{ color: 'white', fontSize: 16, margin: 10 }}>{user.displayName ? user.displayName : user.email}</Text>
            <Text style={{ color: 'white', fontSize: 16, margin: 10 }}>{"MMR:6500"}</Text>
            <Text style={{ color: 'white', fontSize: 16, margin: 10 }}>{user.email}</Text>
        </View>
    )
}

function PreviewInfo(props) {
    return (

        <View style={{ flex: 2, backgroundColor: '#5A8DD8', width: '100%' }} >
            <View>
                <Text>General info:</Text>
                <Text>A small summary to illustrate your goals, contact information ,experience and goals</Text>
                <Text>Display Name:</Text>
                <Text>Sex:</Text>
                <Text>Contact Email:</Text>
                <Text>About you:</Text>
                <Text>Years of experience</Text>
                <Text>Phone</Text>


            </View>
            <View>
                <Text>Match Making details:</Text>
                <Text>These values help our system find the best opponents</Text>
                <Text>Preffered game:(Single,Mixed,Doubles)</Text>
                <Text>Contact Email:</Text>
                <Text>About you:</Text>
                <Text>Years of experience</Text>
                <Text>Phone</Text>
            </View>


            <Text>City</Text>
        </View>

    )
}



export default function ProfileScreen(props) {

    const [user, setUser] = useState(auth().currentUser);
    const [displayName, setDisplayName] = useState(user.displayName);
    const [preview, setPreview] = useState(true);

    return (
        <View style={{ flex: 1, alignItems: 'center', backgroundColor: '#3171CE', justifyContent: 'flex-start', flexDirection: 'column', }}>
            <DisplayBanner />
            <View style={{ margin:10, padding:10,flex: 0.5, flexDirection:'row', width: '100%' }}>
                <View style={{ flex: 0.5, height:50,justifyContent:'center',backgroundColor: '#304BCF', alignItems:'center', borderWidth: 0.5, borderRadius: 5, borderColor: '#5A8DD8' }}>
                    <Text>INFO</Text>
                </View>
                <View style={{ flex: 0.5,height:50,justifyContent:'center',alignItems:'center', backgroundColor: '#304BCF', borderWidth: 0.5, borderRadius: 5, borderColor: '#5A8DD8' }}>
                    <Text>STATS</Text>
                </View>
            </View>
            <ScrollView>
                <PreviewInfo />
            </ScrollView>



        </View >
    )

}