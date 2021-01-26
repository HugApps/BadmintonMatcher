import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import database from '@react-native-firebase/database';
import functions from '@react-native-firebase/functions';

const reference = database().ref('/users/123');

import {
    View,
    Text,
    TouchableOpacity, FlatList, Button
} from 'react-native';

import auth from '@react-native-firebase/auth';




function MatchFound(props) {
    return (<TouchableOpacity style={{ flex: 1, maxWidth: '70%', maxHeight: 250, borderRadius: 10, backgroundColor: 'green', padding: 30 }} onPress={() => { props.onPress() }}>
        <Text style={{ color: 'white', textAlign: 'center' }}>VIEW MATCH</Text>
    </TouchableOpacity>)

}
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
    const [loading,setLoading] = useState(true);
  
    const rejectMatch = async (match_id) => {
        let callable = functions().httpsCallable('updatePlayerMatchStatus');
        return callable({ match_id: match_id, status_index: 1 })
     
    }

    //moves match status from queued to pending
    const confirmMatch = async (match) => {
        let call_result = await functions().httpsCallable('updateMatchStatus')({ match: match })
        props.navigation.navigate('MatchEdit',{match_id:match});
    }

    const fetchMatches = async () => {

        database().ref('/clients/' + user.uid + '/matches').orderByChild('status').equalTo(match_status).once('value').then((snapShot) => {
            if (snapShot.val()) {
                let new_matches = snapShot.val();
                let keys = Object.keys(snapShot.val());
                let oldMatches = [...matches];
                keys.forEach((v) => {

                    oldMatches.push(
                        { id: v, ...new_matches[v] }

                    )
                })
                setMatches(oldMatches);
            } else {
                setMatches([]);
            }

        })


    }

    useEffect(() => {
        const unsubscribe = props.navigation.addListener('focus', () => {

            fetchMatches();
            // do something
        });

        return unsubscribe;
    }, [props.navigation]);


    useEffect(() => {
        fetchMatches();
    }, [match_status,loading]);



    let listItem = ({ item, index }) => {
        if (item.opponent) {
            return (

                <View style={{ flex: 1, backgroundColor: '#f6f6f6', margin: 10, alignItems: 'center', justifyContent: 'space-evenly', flexDirection: 'row' }}>
                    <View style={{ flex: 1, margin: 10 }}>
                        <Text style={{ fontSize: 18, padding: 5 }}>{item.opponent_details.display_name}</Text>
                        <Text style={{ padding: 5 }}>MMR: {item.opponent_details.mmr}</Text>
                    </View>
                    <View style={{ flex: 1, margin: 10 }}>
                        <Button onPress={() => { confirmMatch(item.id) }} style={{ padding: 5 }} title={"EDIT"} />
                        <Button onPress={() => { rejectMatch(item.id).then((res)=>{if(res) setLoading(!loading);}) }} style={{ padding: 5 }} title={'Reject'} />
                    </View>
                </View>
            )
        }
    }

    return (
        <View style={{ flex: 1, backgroundColor: 'white', justifyContents: 'space-evenly' }}>
            <Text style={{ margin: 10, fontSize: 18, fontWeight: 'bold', textAlign: 'center' }}>My Matches</Text>

            <MatchTabs
                onSelect={(index) => { setSearchMatchStatus(match_status_options[index]) }}
                activeTint={'#AF26D9'}
                inActiveTint={'black'}
                labels={["Active", "History"]}
            />

            <FlatList
                numColumns={1}
                data={matches}
                renderItem={listItem}
            />

        </View>
    )




}