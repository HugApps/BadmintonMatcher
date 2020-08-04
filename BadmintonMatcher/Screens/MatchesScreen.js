import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import database from '@react-native-firebase/database';

const reference = database().ref('/users/123');

import {
    SafeAreaView,
    StyleSheet,
    ScrollView,
    View,
    Text,
    StatusBar,
    Image,
    TextInput,
    TouchableOpacity, ActivityIndicator, FlatList,
} from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import {
    DrawerContentScrollView,
    DrawerItemList,
    DrawerItem,
} from '@react-navigation/drawer';
import auth from '@react-native-firebase/auth';
import functions from '@react-native-firebase/functions';



/// @refresh reset 





//<a href="https://www.vecteezy.com/free-vector/sport">Sport Vectors by Vecteezy</a>

export default function MatchesScreen(props) {
    const [user, setUser] = useState(auth().currentUser);
    const [matches, setMatches] = useState([]);


    useEffect( async () => {
        let match_a = await database().ref('/matches').orderByChild('team_1').equalTo(user.uid).once('value');
    
        let match_b = await database().ref('/matches').orderByChild('team_2').equalTo(user.uid).once('value');
        let all_matches = [];
        console.log(match_a.val());
        Object.keys(match_a.val()).forEach((key)=>{
           // console.log(match_a[key])
            all_matches.push({id:key,...match_a.val()[key]})
        })

        Object.keys(match_b.val()).forEach((key)=>{
            all_matches.push({id:key,...match_b.val()[key]})
        })

        console.log(all_matches);
        setMatches(all_matches);
     
    
    }, []);



    const listItem = ({item,index})=>{
        return(

            <View>
                <Text>{item.status}</Text>
            </View>

        )


    }


    return (
        <View style={{ flex: 5, margin: 10, backgroundColor: 'white', alignItems: 'center', justifyContents: 'space-evenly' }}>
            <Text>Matches screen</Text>
            <FlatList
                numColumns={2}
                data={matches}
                renderItem={listItem}
            />
          



        </View>
    )




}