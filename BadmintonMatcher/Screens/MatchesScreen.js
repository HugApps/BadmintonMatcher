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




function MatchTabs(props) {

    /*
    accepted props
    onSelect : callbackfunction passing back the index clicked,
    labels: category labels in order to be displayed,
    style: style for the tab container,
    activeTint : color to use when tab is selected,
    inActiveTint: normal color when not selected,
    */
    const [labels, setLabels] = useState(props.labels ? props.labels : [])
    const [activeIndex, setActiveIndex] = useState(0)



    //TODO need to handle default active and clicking interactions, turn off 
    return (

        <View style={{ flex: 5, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', maxHeight: 50 }}>
            {labels.map((label, index) => {
                let isActive = false;
                if (index == activeIndex) {
                    isActive = true;
                }
                return (
                    <TabItem
                        active={isActive}
                        activeTint={props.activeTint}
                        inActiveTint={props.inActiveTint}
                        label={label}
                        onClick={()=>props.onSelect(index)}

                    />
                )
            })}
        </View>
    )

}


function TabItem(props) {

    const [active, setActive] = useState(props.active ? props.active : false);
    const [label, setLabel] = useState(props.label)


    return (
        <TouchableOpacity onPress={()=>{props.onClick()}}>
            <View style={{ borderBottomWidth: 3, borderBottomColor: active ? props.activeTint : props.inActiveTint, width: 100, height: 50, flex: 1, backgroundColor: "#EAEBEA", textAlign: 'center' }}>
                <Text style={{ padding: 15, fontSize: 16, color: active ? props.activeTint : props.inActiveTint, textAlign: 'center' }}>{props.label}</Text>
            </View>
        </TouchableOpacity>

    )
}




//<a href="https://www.vecteezy.com/free-vector/sport">Sport Vectors by Vecteezy</a>

export default function MatchesScreen(props) {
    const [user, setUser] = useState(auth().currentUser);
    const [matches, setMatches] = useState([]);


    useEffect(async () => {

        let new_matches = await database().ref('/clients/' + user.uid + '/matches').once('value').then((snapShot) => {
            console.log(snapShot.val())
            return snapShot.val();
        })



        setMatches(Object.keys(new_matches).map((match_key) => {
            return new_matches[match_key]

        }));

        console.log(matches);


    }, []);



    const listItem = ({ item, index }) => {
        if (item.opponent) {

            return (

                <View style={{ flex: 1, justifyContent: 'space-evenly', flexDirection: 'row' }}>
                    <View>
                        <Text>{item.opponent.display_name}</Text>
                        <Text>{item.opponent.mmr}</Text>
                    </View>
                    <View>


                    </View>

                    <Text>{item.status}</Text>
                </View>

            )

        }



    }


    return (
        <View style={{ flex: 5, margin: 10, backgroundColor: 'white', alignItems: 'center', justifyContents: 'space-evenly' }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', textAlign: 'center' }}>My Matches</Text>

            <MatchTabs
                onSelect={(index) => { console.log('index selected', index) }}
                activeTint={'#AF26D9'}
                inActiveTint={'black'}
                labels={["New!", "Active", "History"]}
            />

            <FlatList
                numColumns={1}
                data={matches}
                renderItem={listItem}
            />




        </View>
    )




}