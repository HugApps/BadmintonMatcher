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
    TouchableOpacity, ActivityIndicator, FlatList,Button
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

        <View style={{ flex: 5, margin: 10, flexDirection: 'row', alignItems: 'flex-start', maxHeight: 50 }}>
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
                        onClick={() => { props.onSelect(index); setActiveIndex(index) }}

                    />
                )
            })}
        </View>
    )

}


function TabItem(props) {

    const [active, setActive] = useState(props.active ? props.active : false);
    const [label, setLabel] = useState(props.label)



    useEffect(() => {
        setActive(props.active);

    }, [props.active]);

    return (
        <TouchableOpacity style={{ flex: 1 }} onPress={() => { props.onClick() }}>
            <View style={{ flex: 1, borderBottomWidth: 3, borderBottomColor: active ? props.activeTint : props.inActiveTint, height: 50, backgroundColor: "#EAEBEA", textAlign: 'center' }}>
                <Text style={{ padding: 15, fontSize: 16, color: active ? props.activeTint : props.inActiveTint, textAlign: 'center' }}>{props.label}</Text>
            </View>
        </TouchableOpacity>

    )
}

//<a href="https://www.vecteezy.com/free-vector/sport">Sport Vectors by Vecteezy</a>

export default function MatchesScreen(props) {
    const [user, setUser] = useState(auth().currentUser);
    const [matches, setMatches] = useState([]);
    const [match_status, setSearchMatchStatus] = useState('queued');
    const [match_status_options, setOptions] = useState(['queued', 'pending', 'scheduled', 'complete'])


    const rejectMatch = (match_id)=>{
        console.log('will remove match',match_id);
    }


    const confirmMatch = (match_id)=>{
        console.log('will remove match',match_id);
    }

    useEffect(() => {

        database().ref('/clients/' + user.uid + '/matches').orderByChild('status').equalTo(match_status).once('value').then((snapShot) => {
            if (snapShot.val()) {
                let new_matches = snapShot.val();
                setMatches(Object.keys(new_matches).map((match_key) => {
                    return new_matches[match_key]

                }));

                console.log(matches);

            } else {
                setMatches([]);
            }

        })
    }, [match_status]);

    let listItem = ({ item, index }) => {
        if (item.opponent) 
            return (

                <View style={{ flex: 1, backgroundColor:'#f6f6f6',margin:10,alignItems:'center',justifyContent: 'space-evenly', flexDirection: 'row' }}>
                    <View style={{ flex: 1,margin:10 }}>
                        <Text style={{fontSize:18,padding:5}}>{item.opponent.display_name}</Text>
                        <Text style={{padding:5}}>MMR: {item.opponent.mmr}</Text>
                    </View>
                    <View style={{flex:1,margin:10}}>
                        <Button onPress={()=>{confirmMatch(item.match_id)}} style={{padding:5}}title={"Accept"}/>
                        <Button onPress={()=>{rejectMatch(item.match_id)}} style={{padding:5}} title={'Reject'}/>
                    </View>
                </View>
            )
        }
    }

    return (
        <View style={{ flex: 1, backgroundColor: 'white', justifyContents: 'space-evenly' }}>
            <Text style={{ margin: 10, fontSize: 18, fontWeight: 'bold', textAlign: 'center' }}>My Matches</Text>

            <MatchTabs
                onSelect={(index) => { console.log('index selected', index); setSearchMatchStatus(match_status_options[index]) }}
                activeTint={'#AF26D9'}
                inActiveTint={'black'}
                labels={["New!", "Pending", "Active", "History"]}
            />

            <FlatList
                numColumns={1}
                data={matches}
                renderItem={listItem}
            />

        </View>
    )




}