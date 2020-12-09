import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import database from '@react-native-firebase/database';



import {
    SafeAreaView,
    StyleSheet,
    ScrollView,
    View,
    Text,
    StatusBar,
    Image,
    TextInput,
    TouchableOpacity, ActivityIndicator
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
import Icon from 'react-native-vector-icons/Ionicons';



/// @refresh reset 


function SearchButton(props) {
    return (<TouchableOpacity style={{ flex: 1, maxWidth: '70%', maxHeight: 250, borderRadius: 10, backgroundColor: 'orange', padding: 30 }} onPress={() => { props.onPress() }}>
        <Text style={{ color: 'white', textAlign: 'center' }}>SEARCH</Text>
    </TouchableOpacity>)

}

function CancelButton(props) {
    return (<TouchableOpacity style={{ flex: 1, maxWidth: '70%', maxHeight: 250, borderRadius: 10, backgroundColor: 'red', padding: 30 }} onPress={() => { props.onPress() }}>
        <Text style={{ color: 'white', textAlign: 'center' }}>CANCEL</Text>
    </TouchableOpacity>)

}

function MatchFound(props) {
    return (<TouchableOpacity style={{ flex: 1, maxWidth: '70%', maxHeight: 250, borderRadius: 10, backgroundColor: 'green', padding: 30 }} onPress={() => { props.onPress() }}>
        <Text style={{ color: 'white', textAlign: 'center' }}>VIEW MATCH</Text>
    </TouchableOpacity>)

}



function MatchInfo(props) {
    /*const [team_one, setTeamOne] = useState(props.match.team_1)
    const [team_two, setTeamOne] = useState(props.match.team_2)
    const [day, setDay] = useState(null)
    const [time, setDay] = useState(null)
    const [status, setStatus] = useState(props.match.status)*/

    return (
        <View style={{ padding: 10, flex: 0.5, flexDirection: 'row', width: '100%' }}>
            <TouchableOpacity style={{ flex: 0.5, height: 50, justifyContent: 'center', backgroundColor: '#304BCF', alignItems: 'center', borderWidth: 0.5, borderRadius: 5, borderColor: '#5A8DD8' }}>
                <Text>INFO</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ flex: 0.5, height: 50, justifyContent: 'center', alignItems: 'center', backgroundColor: '#304BCF', borderWidth: 0.5, borderRadius: 5, borderColor: '#5A8DD8' }}>
                <Text>STATS</Text>
            </TouchableOpacity>
        </View>
    )

}

function MatchSummary(props) {
    if (props.match == null || props.match == '') { return null; }
    let matchData = Object.keys(props.match).map((v,index)=>{
        return {id:v,...props.match[v]}
    })
    const[opponent,setOpponent] =useState(props.match.opponent);
    const[myData,setMyData] = useState({});
    //temporary way of getting your own data!, neeed redux to share profile data globally
    useEffect(()=>{
        const user = auth().currentUser
        database().ref('/clients/' + user.uid).once('value').then(snapShot => {
            const userDetails = snapShot.val();
            const userProfile = {
                display_pic: userDetails.profilePicUrL,
                display_name: userDetails.display_name,
                mmr: userDetails.mmr,
            }
            setMyData(userProfile);
        })



    },[ ])

    //Need easy way to fetch personal account data to display here
    return (
        <View style={{ flex: 3, backgroundColor: 'orange', margin: 20, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}>
            <View style={{ flex: 3, alignItems: 'center', justifyContent: 'space-between', margin: 10 }}>
                <Text style={{ margin: 10, fontSize: 20 }}>{opponent.display_name}</Text>
                <Image style={{ backgroundColor: 'white', width: 100, height: 100, borderRadius: 80 / 2 }} source={{ uri: opponent.display_pic }}></Image>
                <Text style={{ margin: 10, fontSize: 20 }}>MMR:{opponent.mmr}</Text>
            </View>
            <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 30, textAlign: 'center', color: 'red' }}>VS</Text>
            </View>
            
            <View style={{ flex: 3, alignItems: 'center', justifyContent: 'space-between', margin: 10 }}>
                <Text style={{ margin: 10, fontSize: 20 }}>{myData.display_name} </Text>
                <Image style={{ backgroundColor: 'white', width: 100, height: 100, borderRadius: 80 / 2 }} source={{ uri:myData.display_pic }}></Image>
                <Text style={{ margin: 10, fontSize: 20 }}>MMR:{myData.mmr}</Text>
            </View>
        </View>
    )
}




//<a href="https://www.vecteezy.com/free-vector/sport">Sport Vectors by Vecteezy</a>

export default function MatchSearchScreen(props) {



    const [user, setUser] = useState(auth().currentUser);
    const [currentQueue, setQueue] = useState(null);
    const [matches, setMatch] = useState(null);
    const [onLoad, setOnLoad] = useState(true);
    const [searching, setSearching] = useState(false);

    const getSearchStatus = () => {
        let callable = functions().httpsCallable('getSearchStatus');
        return callable();
    }

    const cancelSearch = () => {

        let callable = functions().httpsCallable('cancelQueue');
        return callable();


    }

    const renderButton = () => {
        if (searching) {
            return <CancelButton onPress={() => { cancelSearch(); setMatch(null), setSearching(null) }} />
        }

        if (matches) {
            return <MatchFound onPress={() => { setMatch(null), setSearching(null) }} />
        } else {
            return <SearchButton onPress={() => testCreateQueue()} />
        }


    }

    // listen to match making queue
    const pollQueue = () => {
        let callable = functions().httpsCallable('pollMatchQueue');
        return callable()
    }



    const checkMatches = (callback) => {
        database().ref('/clients/' + user.uid + '/matches').limitToLast(1).on('child_added', (snapShot) => {
            let newMatch = snapShot.val();
            console.log('DEBUG NEW MATCH RESULTS',newMatch);
            callback(newMatch);
        })
    }

    const testCreateQueue = () => {
        let callable = functions().httpsCallable('addToMatchMakingQueue');
        callable({user:'test'})
            .then((res) => {
                setSearching(true)
            })
            .catch((error) => { console.log('queue failed', error) })
    }




    useEffect(() => {
        let interval = null;
        getSearchStatus().then((res) => {
            if (res) {
                if (res.data.data == user.uid) {
                    setQueue(res.data.data);
                    setSearching(true);
                }

            } else {
                setSearching(false);
            }

        }).catch((error) => { console.log('queue failed', error) });


        checkMatches((result) => {
                // have to get a way to hide old matches from reappearing
                setSearching(false)
                setMatch(result);

        });


    }, []);




    useEffect(() => {


        const interval = setInterval(() => {
            if (searching) {
                pollQueue().then((result) => {
                    if (result.data.data == "No queue with id found") {
                        setSearching(false);
                        clearInterval(interval);
                    }
                    if (result.data.data == 'searching') {
                        console.log('searching');
                    }

                    if (result.data.data == 'match found') {
                        setOnLoad(false);
                        setSearching(false);
                        clearInterval(interval);
                    }
                })
                    .catch((error) => { console.log('poll queue error', error) })
            } else {
                clearInterval(interval);
            }

        }, 5000)

        return () => { clearInterval(interval) }
    }, [searching]);



    return (
        <View style={{ flex: 5, margin: 10, backgroundColor: 'white', alignItems: 'center', justifyContents: 'space-evenly' }}>

            <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 30, fontWeight: 'bold' }}>Find Opponent</Text>
            </View>
            <Image style={{ flex: 3, opacity: 1, margin: 10, resizeMode: 'contain', height: 400, width: 400 }} source={require('./assets/badminton_badge.png')} />
            <ActivityIndicator animating={searching} size="large" color="#0000ff" />
            {searching ? null : (<MatchSummary match={matches} />)}
            <View style={{ flex: 3, flexDirection: 'row', alignItems: 'center' }}>
                {renderButton()}
            </View>

        </View >
    )

}