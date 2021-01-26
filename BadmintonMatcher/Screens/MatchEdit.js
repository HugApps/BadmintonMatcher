import 'react-native-gesture-handler';
import React, { useState, useEffect, useLayoutEffect } from 'react';
import database from '@react-native-firebase/database';
import CheckBox from '@react-native-community/checkbox';
import Icon from "react-native-vector-icons/MaterialIcons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"
import ImagePicker from "react-native-image-picker";
import storage from '@react-native-firebase/storage';
import { Picker } from '@react-native-picker/picker';
import DropDownPicker from 'react-native-dropdown-picker';
import {
    ScrollView,
    View,
    Text,
    Image,
    TextInput,
    Button,
    TouchableOpacity, ActivityIndicator
} from 'react-native';

/// @refresh reset 


/*TODO


SCHEDULE PICKER LOADS SCHEDULE INFO FROM LOCATIONS PROP ISNTEAD OF LOCATION, 
DEFAULT TO USER SAVED CONTENT --> DROP-IN 
POPULATE MATCH TYPE BASED ON AVAIBLE KEYS OF SELECTED LOCATION 



*/





import auth from '@react-native-firebase/auth';
//Search database for drop in , booking locations

// Displays drop down, lets players pick a venue
// takes in a callback, to pass back selected location to parent form component
function VenuePicker(props) {
    const [locations, setLocations] = useState([]);
    const [open, setOpen] = useState(false);
    const [selectedLocation, setSelected] = useState(null);
    const [team_1_data, updateTeamAData] = useState(props.team_1_data);
    const [team_2_data, updateTeamBData] = useState(props.team_2_data);
    const [currentPlayer, setCurrentPlayer] = useState('team_1_data');
    const [opponent, setOpponent] = useState('team_2_data');





    useEffect(() => {
        database().ref('/venues').once('value').then((snapShot) => {
            if (snapShot) {
                let locationArray = Object.keys(snapShot.val()).map((v, i) => {

                    return { key: v, label: snapShot.val()[v].name, value: snapShot.val()[v], selected: currentPlayer.venue_key == v }
                })

                setLocations(locationArray);

            }
        })

    }, [])

    //Check if user already selected a venue
    useEffect(() => {

        locations.forEach((l, index) => {
            if (l.key == currentPlayer.venue_key) {

                setSelected(l);
            }
        })

    }, [])

    useEffect(() => {
        console.log('venue picker props',props.team_2_data.day)
        if (props.team_1_data.id == auth().currentUser.uid) {
            setCurrentPlayer(props.team_1_data);
            setOpponent(props.team_2_data);
        } else {
            setCurrentPlayer(props.team_2_data);
            setOpponent(props.team_1_data);
        }

        updateTeamAData(props.team_1_data);
        updateTeamBData(props.team_2_data);
    },[props.team_1_data,props.team_2_data])


    const updateValue = (key, value) => {
        let currentTeam = props.team_1_data.id == auth().currentUser.uid ? 'team_1' : 'team_2';
        let newValue = {}
        newValue[key] = value
        database().ref("/matches/" + props.match_id + '/' + currentTeam + '_data/').update(newValue);
    }

    if (locations != null || locations.length > 0) {
        console.log(team_2_data.day)
        return (
            <View style={{ flex: 1, }}>
                <View style={{ flex: 1, margin: 10, backgroundColor: 'white' }}>
                    <Text style={{ flex: 1, fontSize: 16, fontWeight: 'bold', textAlign: 'center', margin: 10 }}>Match Location</Text>
                    <Text style={{ flex: 1, fontSize: 12, textAlign: "center" }}>Select a venue and location for your match</Text>
                    <View style={{ margin: 10, flex: 2, zIndex: 1000, flexDirection: 'row', maxHeight: locations.length * 50, justifyContent: 'space-around' }}>
                        <Text style={{ flex: 1, fontWeight: 'bold', margin: 10 }}>You:</Text>
                        <DropDownPicker
                            placeholder={currentPlayer.venue_key ? currentPlayer.venue_key : "Select an Location"}
                            items={locations}
                            containerStyle={{ zIndex: 1000, flex: 1, height: 40 }}
                            style={{ flex: 1, zIndex: 1000, backgroundColor: '#fafafa' }}
                            itemStyle={{
                                zIndex: 1000,
                                justifyContent: 'flex-start'
                            }}
                            dropDownStyle={{ opacity: 1, zIndex: 1000, backgroundColor: 'white' }}
                            onChangeItem={(item) => { updateValue('venue_key', item.key); setSelected(item.key) }}
                        />
                    </View>

                    <View style={{ margin: 10, flex: 1, justifyContent: 'flex-start', flexDirection: 'row', }}>
                        <Text style={{ flex: 1, fontWeight: 'bold', marginLeft: 10 }}>Opponent:</Text>
                        <Text style={{ flex: 1, zIndex: 0, color: '#808080', marginLeft: 10 }}>{opponent.venue_key ? opponent.venue_key : "Opponent has not set"}</Text>
                    </View>
                </View>

                <View>
                    {locations  ? <LocationSchedulePicker
                        team_1_data={team_1_data}
                        team_2_data={team_2_data}
                        location={selectedLocation}
                        locations={locations}
                        updateValue={(key, value) => { updateValue(key, value) }}
                    /> : null}


                </View>

            </View>

        )

    } else {
        return null;
    }

}

// props : onSelect callback,label,value,filter
function FilterBox(props) {
    const [value, setValue] = useState(null);
    const [filter, setFilter] = useState(false);
    useEffect(() => {
        //current value of the checkbox, or of the form
        setValue(props.value);
        //what is getting compared to 
        setFilter(props.filter);
    }, [props.value, props.filter])

    return (
        <View style={{ flex: 1 }}>
            <Text>{props.label}</Text>
            <CheckBox
                style={{ width: 20, height: 20 }}
                boxType={'square'}
                onCheckColor={'blue'}
                onTintColor={'black'}
                tinColor={'white'}
                disabled={false}
                value={value == filter ? true : false}
                onValueChange={(index) => { props.onSelect(filter) }} />
        </View>
    )

}


function LocationSchedulePicker(props) {
    const [locations, setLocations] = useState(props.locations);
    const [location, setLocation] = useState(null);
    const [days, setDays] = useState([])
    const [hours, setHours] = useState([])
    const [filter, setFilter] = useState('drop_in');
    const [selectedDay, setDay] = useState(null);
    const [selectedTime, setTime] = useState(null);
    const [currentPlayer, setCurrentPlayer] = useState(props.team_1_data);
    const [opponent, setOpponent] = useState(props.team_2_data);


    useEffect(() => {
        let locationMap = {};
        props.locations.forEach((l) => {
            locationMap[l.key] = l;
        })
        setLocations(locationMap);
        setLocation(Object.keys(locationMap)[0]);
    }, [props.locations])




    //Load existing data
    useEffect(() => {

        if (currentPlayer && currentPlayer.day && currentPlayer.time) {

            setDay(currentPlayer.day);
            setTime(currentPlayer.time);
        } else {

        }
    }, [currentPlayer, locations])


    //set player teams
    useEffect(() => {
       
        const deviceUser = auth().currentUser;
        if (props.team_1_data.id == deviceUser.uid) {
            setCurrentPlayer(props.team_1_data)
            setOpponent(props.team_2_data);
        } else {
            setCurrentPlayer(props.team_2_data);
            setOpponent(props.team_1_data);
        }

       
    }, [props.team_1_data,props.team_2_data])


    // after use picks a location key
    useEffect(() => {
        if (props.location) {
            setLocation(props.location);
        }

    }, [props.location])


    useEffect(() => {
        if (location != null) {
            let currentLocation = locations[location].value;
            if (currentLocation[filter] != null) {

                let validDays = Object.keys(currentLocation[filter]['schedule']).map((d, index) => {
                    const selected = currentPlayer.day == currentLocation[filter]['schedule'][d]
                    return { label: d, value: currentLocation[filter]['schedule'][d], selected: selected }

                })
                setDays(validDays)
            } else {
                setDays([])
            }
        }

    }, [props,location, filter])

    useEffect(() => {
        if (locations == null || !location) { return; }
        let newHours = [];
        let currentDay = currentPlayer.day ? currentPlayer.day : selectedDay;
        let currentLocation = locations[location].value;

        if (selectedDay && currentLocation && currentLocation[filter]) {

            newHours = currentLocation[filter]['schedule'][currentDay].map((v, i) => {
                return { label: v.start + "-" + v.end, value: v }
            })



            setHours(newHours);
        }

    }, [props,location, selectedDay])


    //{location['drop_in'] ? <FilterBox label={'Drop-in'} value={filter} filter={'drop_in'} onSelect={() => { setFilter('drop_in') }} /> : null}
    //{location['bookings'] ? <FilterBox label={'Booking'} value={filter} filter={'bookings'} onSelect={() => { setFilter('bookings') }} /> : null}


    if (location == null) {
        return null;
    }


    console.log('LOCATION SCHEDULER UPDATED',props.team_2_data.day);

    return (

        <View style={{ flex: 1, backgroundColor: 'white', borderRadius: 10, margin: 10, justifyContent: 'center', }}>
            <Text style={{ flex: 1, fontSize: 16, fontWeight: 'bold', textAlign: 'center', margin: 10 }}>Match Day and Time</Text>
            <Text style={{ flex: 1, fontSize: 12, textAlign: "center" }}>Select day and time avaiable based on your venue</Text>
            <View style={{ flex: 1, zIndex: 1000, flexDirection: 'row', justifyContent: 'space-evenly' }}>
                <Text style={{ flex: 1, margin: 10, fontWeight: 'bold' }}>You:</Text>
                <DropDownPicker
                    items={[{ label: 'Drop in', value: 'drop_in', selected: currentPlayer.match_type == 'drop_in' }, { label: 'Booking', value: 'bookings', selected: currentPlayer.match_type == 'bookings' }]}
                    placeholder={currentPlayer.match_type ? currentPlayer.match_type : "Match Type"}
                    containerStyle={{ flex: 1, zIndex: 1000 }}
                    style={{ flex: 1, backgroundColor: '#fafafa', zIndex: 1000 }}
                    itemStyle={{
                        flex: 1,
                        zIndex: 1000,
                        textAlign: 'center',
                        justifyContent: 'flex-start'
                    }}
                    dropDownStyle={{ backgroundColor: '#fafafa', zIndex: 1000 }}
                    onChangeItem={(item) => { setFilter(item.value); props.updateValue('match_type', item.value); }}
                />

            </View>

            <View style={{ flex: 1, padding: 10, justifyContent: 'flex-start', flexDirection: 'row', }}>
                <Text style={{ flex: 1, marginTop: 10, fontWeight: 'bold', }}>Opponent:</Text>
                <Text style={{ flex: 1, zIndex: 0, margin: 12, color: '#808080', textAlign: 'center' }}>{opponent.venue_key ? opponent.match_type : "Drop-in"}</Text>
            </View>

            <View style={{ flex: 1, zIndex: 900, margin: 10, flexDirection: 'row', justifyContent: 'space-evenly' }}>
                <Text style={{ flex: 1, fontWeight: 'bold', }}>You:</Text>
                <DropDownPicker
                    items={days}
                    placeholder={currentPlayer.day ? currentPlayer.day : "Match Day"}
                    containerStyle={{ flex: 1, zIndex: 900, }}
                    style={{ backgroundColor: '#fafafa' }}
                    itemStyle={{
                        zIndex: 900,
                        textAlign: 'center',
                        justifyContent: 'flex-start'
                    }}
                    dropDownStyle={{ backgroundColor: '#fafafa', zIndex: 900, }}
                    onChangeItem={(item) => { props.updateValue('day', item.label); setDay(item.label) }}
                />
            </View>

            <View style={{ flex: 1, padding: 10, justifyContent: 'flex-start', flexDirection: 'row', }}>
                <Text style={{ flex: 1, marginTop: 10, fontWeight: 'bold', }}>Opponent:</Text>
                <Text style={{ flex: 1, zIndex: 0, margin: 12, color: '#808080', textAlign: 'center' }}>{opponent.venue_key && opponent.day ? opponent.day : "Has no selected"}</Text>
            </View>
            <View style={{ flex: 1, margin: 10, zIndex: 500, flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ flex: 1, fontWeight: 'bold' }}>You:</Text>
                <DropDownPicker

                    items={selectedDay ? hours : []}
                    placeholder={currentPlayer.time ? currentPlayer.time.label : "Match Time"}
                    containerStyle={{ zIndex: 500, flex: 1, }}
                    style={{ zIndex: 500, backgroundColor: '#fafafa' }}
                    itemStyle={{
                        zIndex: 500,
                        textAlign: 'center',
                        justifyContent: 'flex-start'
                    }}
                    dropDownStyle={{ zIndex: 500, backgroundColor: '#fafafa' }}
                    onChangeItem={(item) => { props.updateValue('time', item); setTime(item); }}
                />

            </View>

            <View style={{ flex: 1, padding: 10, justifyContent: 'flex-start', flexDirection: 'row', }}>
                <Text style={{ flex: 1, marginTop: 10, fontWeight: 'bold', }}>Opponent:</Text>
                <Text style={{ flex: 1, zIndex: 0, margin: 12, color: '#808080', textAlign: 'center' }}>{opponent.venue_key && opponent.time ? opponent.time.label : "Has not selected"}</Text>
            </View>

        </View >

    )
}

export default function MatchEdit(props) {

    const [user, setUser] = useState(auth().currentUser);
    const [match_id, setMatchId] = useState(null);
    const [match_details, setMatchDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const { match_id } = props.route.params;

        database().ref('/matches/' + match_id).once('value').then((snapShot) => {
            if (snapShot) {
                setMatchId(match_id);
                setMatchDetails(snapShot.val())
                setLoading(false);
            }

        })
    }, []);


    useEffect(() => {
        //listen to changes from other player and update matchDetails
        if (match_details == null) { return; }
        let currentPlayerKey = 'team_1_data'
        let opponentKey = null;
        if (match_details[currentPlayerKey].id == auth().currentUser.uid) {
            opponentKey = 'team_2_data';
            currentPlayerKey ='team_1_data';
        } else {
            opponentKey = 'team_1_data';
            currentPlayerKey ='team_2_data';
        }

     
        const opponentListener = database().ref('/matches/' + match_id + '/' + opponentKey).on('value', snapShot => {
            
            if (snapShot) {
                console.log('DATA UPDATED')
                let updatedMatchDetails = {...match_details}
                updatedMatchDetails[opponentKey] = snapShot.val();
                updatedMatchDetails[currentPlayerKey] = match_details[currentPlayerKey];
                setMatchDetails(updatedMatchDetails);
            }

        });


        return () => database().ref('/matches/' + match_id + '/' + opponentKey).off('value',opponentListener);




    }, [loading]);



    //Displays both team's inputs , if they are the same then display finalized field, edited fields are grey 
    //<MatchDetailForm formData={match_details} />
    //if all detaitls match, then there is a confirm button

    return (
      
        <View style={{ flex: 1, flexDirection: 'column' }}>
            <ScrollView>

                {loading ? <ActivityIndicator animating={loading} size="large" color="#0000ff" /> : <VenuePicker team_1_data={match_details['team_1_data']} team_2_data={match_details['team_2_data']} match_id={match_id} />}

            </ScrollView>

        </View >
    )

}