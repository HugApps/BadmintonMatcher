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

import auth from '@react-native-firebase/auth';
//Search database for drop in , booking locations
/// @refresh reset 

function MatchDetailForm(props) {
    const [formData, setFormData] = useState(props.formData);
    const [teamOneData, setTeamOneData] = useState(formData.team_1_data);
    const [teamTwoData, setTeamTwoData] = useState(formData.team_2_data);

    return (

        <ScrollView style={{ flex: 1, margin: 10 }}>
            <VenuePicker />
            <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'space-evenly' }}>

                <View style={{ flex: 1, padding: 10, flexDirection: 'row', justifyContent: 'space-evenly' }}>
                    <Text style={{ flex: 1 }}>Date:</Text>
                    <TextInput
                        style={{ flex: 1 }}
                        placeholder={"Day of match"}
                        value={new Date()} />
                    <Text style={{ flex: 1 }}>opponents date</Text>
                </View>

                <View style={{ flex: 1, padding: 10, flexDirection: 'row', justifyContent: 'space-evenly' }}>
                    <Text style={{ flex: 1 }}>Time:</Text>
                    <TextInput
                        style={{ flex: 1 }}
                        placeholder={"Time of match"}
                        value={new Date()} />
                    <Text style={{ flex: 1 }}>opponents time</Text>
                </View>

                <View style={{ flex: 1, padding: 10, flexDirection: 'row', justifyContent: 'space-evenly' }}>
                    <Text style={{ flex: 1 }}>Venue Type:</Text>
                    <View style={{ flex: 1 }}>
                        <Text style={{ textAlign: 'left', flex: 1, fontSize: 14, color: 'black', }}>Drop in</Text>
                        <CheckBox
                            style={{ margin: 10, width: 20, height: 20 }}
                            boxType={'square'}
                            onCheckColor={'blue'}
                            onTintColor={'white'}
                            tinColor={'white'}
                            disabled={false}
                            value={false}
                            onValueChange={(index) => { }}>
                        </CheckBox>

                    </View>


                    <View style={{ flex: 1 }}>
                        <Text style={{ textAlign: 'left', flex: 1, fontSize: 14, color: 'black', }}>Booking</Text>
                        <CheckBox
                            style={{ margin: 10, width: 20, height: 20 }}
                            boxType={'square'}
                            onCheckColor={'blue'}
                            onTintColor={'white'}
                            tinColor={'white'}
                            disabled={false}
                            value={false}
                            onValueChange={(index) => { }}>
                        </CheckBox>

                    </View>

                    <Text style={{ flex: 1 }}>Drop-in</Text>
                </View>


                <View style={{ flex: 1, padding: 10, flexDirection: 'row', justifyContent: 'space-evenly' }}>
                    <Text style={{ flex: 1 }}>Match Location:</Text>
                    <TextInput
                        style={{ flex: 1 }}
                        placeholder={"Location"}
                        value={new Date()} />
                    <Text style={{ flex: 1 }}>opponents location</Text>
                </View>

                <View style={{ flex: 1, margin: 10 }}>
                    <Text>Chat/notes</Text>
                    <TextInput
                        multiline={true}
                        numberOfLines={4}
                        style={{ flex: 1 }}
                        placeholder={"Enter message here"}
                        value={new Date()} />
                    <Button title={"Send"}></Button>
                    <Text style={{ flex: 1 }}>opponents location</Text>

                </View>

                <View style={{ flex: 1, margin: 10, padding: 10, flexDirection: 'row', justifyContent: 'space-evenly' }}>

                    <Button title={'Save'} onPress={() => { }} />
                    <Button title={'Reject'} onPress={() => { }} />


                </View>





            </View>

        </ScrollView >

    )
}

// Displays drop down, lets players pick a venue
// takes in a callback, to pass back selected location to parent form component
function VenuePicker(props) {
    const [locations, setLocations] = useState([]);
    const [open, setOpen] = useState(false);
    const [selectedLocation, setSelected] = useState(null);
    const [team_1_data, updateTeamAData] = useState(props.team_1_data);
    const [team_2_data, updateTeamBData] = useState(props.team_2_data);
    const [currentPlayer,setCurrentPlayer] = useState('team_1_data');
    const [ opponent,setOpponent] = useState('team_2_data');





    useEffect(() => {
        database().ref('/venues').once('value').then((snapShot) => {
            if (snapShot) {
                let locationArray = Object.keys(snapShot.val()).map((v, i) => {

                    return { key:v,label: snapShot.val()[v].name, value:snapShot.val()[v], selected:currentPlayer.venue_key == v  }
                })
                
                setLocations(locationArray);
                
            }
        })
        
    }, [ ])

    //Check if user already selected a venue
    useEffect(()=>{
        
            locations.forEach((l,index)=>{
                if(l.key == currentPlayer.venue_key){
                    console.log(l)
                    setSelected(l);
                }
            })
        
    },[ ])

    useEffect(()=>{
        if(props.team_1_data.id == auth().currentUser.uid) {
            setCurrentPlayer(props.team_1_data);
            setOpponent(props.team_2_data);
        } else{
            setCurrentPlayer(props.team_2_data);
            setOpponent(props.team_1_data);
        }
    },[ ])

    const updateValue = (key, value) => {
        let currentTeam = props.team_1_data.id == auth().currentUser.uid ? 'team_1' : 'team_2';
        let newValue = {}
        newValue[key] = value
        database().ref("/matches/" + props.match_id + '/' + currentTeam + '_data/').update(newValue);
    }

    //make serverRequest when selectedLocation gets updated
   /* useEffect(() => {
        if(selectedLocation){
 
            updateValue('venue_key', selectedLocation.key)
        }
       
    }, [selectedLocation])*/

    if (locations != null || locations.length > 0) {
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
                            onChangeItem={(item )=> {updateValue('venue_key', item.key); setSelected(item)}}
                        />
                    </View>

                    <View style={{ margin: 10, flex: 1, justifyContent: 'flex-start', flexDirection: 'row', }}>
                        <Text style={{ flex: 1, fontWeight: 'bold', marginLeft: 10 }}>Opponent:</Text>
                        <Text style={{ flex: 1, zIndex: 0, color: '#808080', marginLeft: 10 }}>{opponent.venue_key ? opponent.venue_key : "Opponent has not set"}</Text>
                    </View>
                </View>

                <View>

                   {currentPlayer.venue_key ?   <LocationSchedulePicker
                        team_1_data={team_1_data}
                        team_2_data={team_2_data}
                        location={selectedLocation}
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
    const [location, setLocation] = useState(null);
    const [days, setDays] = useState([])
    const [hours, setHours] = useState([])
    const [filter, setFilter] = useState('drop_in');
    const [selectedDay, setDay] = useState(null);
    const [selectedTime, setTime] = useState(null);
    const [currentPlayer,setCurrentPlayer] = useState(props.team_1_data);
    const [opponent,setOpponent] = useState(props.team_2_data);


    //Load existing data
    useEffect(()=>{
        console.log('props.location',props);
        if(currentPlayer && currentPlayer.day && currentPlayer.time){
            setDay(currentPlayer.day);
            setTime(currentPlayer.time);
        }
    },[ ])


    useEffect(()=>{
        const deviceUser = auth().currentUser;
        if(props.team_1_data.id ==  deviceUser.uid){
            setCurrentPlayer(props.team_1_data)
            setOpponent(props.team_2_data);
        } else {
            setCurrentPlayer(props.team_2_data);
            setOpponent(props.team_1_data);
        }

    }, [ ])
    useEffect(() => {
        if(props.location){
            console.log('props.location',props.location);
            setLocation(props.location.value);

        }
   
    }, [props.location])


    useEffect(() => {
        if (location !=null) {
            console.log('debug location',location);
            if (location[filter]['schedule'] != null) {
                let validDays = Object.keys(location[filter]['schedule']).map((d, index) => {
                    const selected = currentPlayer.day == location[filter]['schedule'][d]
                    return { label: d, value: location[filter]['schedule'][d], selected:selected }

                })
                setDays(validDays)
            } else {
                setDays([])
            }
        }

    }, [location, filter])

    useEffect(() => {
        let newHours = [];
        if (selectedDay) {

            newHours = location[filter]['schedule'][selectedDay].map((v, i) => {
                return { label: v.start + "-" + v.end, value: v }
            })

            setHours(newHours);
        }

    }, [selectedDay])


    //{location['drop_in'] ? <FilterBox label={'Drop-in'} value={filter} filter={'drop_in'} onSelect={() => { setFilter('drop_in') }} /> : null}
    //{location['bookings'] ? <FilterBox label={'Booking'} value={filter} filter={'bookings'} onSelect={() => { setFilter('bookings') }} /> : null}


    return (

        <View style={{ flex: 1, backgroundColor: 'white', borderRadius: 10, margin: 10, justifyContent: 'center', }}>
            <Text style={{ flex: 1, fontSize: 16, fontWeight: 'bold', textAlign: 'center', margin: 10 }}>Match Day and Time</Text>
            <Text style={{ flex: 1, fontSize: 12, textAlign: "center" }}>Select day and time avaiable based on your venue</Text>
            <View style={{ flex: 1, zIndex: 1000, flexDirection: 'row', justifyContent: 'space-evenly' }}>
                <Text style={{ flex: 1, margin: 10, fontWeight: 'bold' }}>You:</Text>
                <DropDownPicker
                    items={[{ label: 'Drop in', value: 'drop_in',selected: currentPlayer.match_type =='drop_in' }, { label: 'Booking', value: 'bookings',selected: currentPlayer.match_type =='bookings' }]}
                    placeholder="Match Type"
                    containerStyle={{ flex: 1, zIndex: 1000 }}
                    style={{ flex: 1, backgroundColor: '#fafafa', zIndex: 1000 }}
                    itemStyle={{
                        flex: 1,
                        zIndex: 1000,
                        textAlign:'center',
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
                    placeholder="Match Day"
                    containerStyle={{ flex: 1, zIndex: 900, }}
                    style={{ backgroundColor: '#fafafa' }}
                    itemStyle={{
                        zIndex: 900,
                        textAlign:'center',
                        justifyContent: 'flex-start'
                    }}
                    dropDownStyle={{ backgroundColor: '#fafafa', zIndex: 900, }}
                    onChangeItem={(item) => { props.updateValue('day', item.label); setDay(item.label) }}
                />
            </View>

            <View style={{ flex: 1, padding: 10, justifyContent: 'flex-start', flexDirection: 'row', }}>
                <Text style={{ flex: 1, marginTop: 10, fontWeight: 'bold', }}>Opponent:</Text>
                <Text style={{ flex: 1, zIndex: 0, margin: 12, color: '#808080', textAlign: 'center' }}>{opponent.venue_key ? opponent.day : "F"}</Text>
            </View>
            <View style={{ flex: 1, margin: 10, zIndex:500,flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ flex: 1, fontWeight: 'bold' }}>You:</Text>
                <DropDownPicker

                    items={selectedDay ? hours : []}
                    placeholder="Match Time"
                    containerStyle={{ zIndex:500,flex: 1, }}
                    style={{ zIndex:500,backgroundColor: '#fafafa' }}
                    itemStyle={{zIndex:500,
                        textAlign:'center',
                        justifyContent: 'flex-start'
                    }}
                    dropDownStyle={{ zIndex:500,backgroundColor: '#fafafa' }}
                    onChangeItem={(item) => { props.updateValue('time', item); setTime(item); }}
                />

            </View>

            <View style={{flex: 1,padding:10, justifyContent: 'flex-start', flexDirection: 'row', }}>
                <Text style={{ flex: 1,marginTop:10,fontWeight: 'bold',}}>Opponent:</Text>
                <Text style={{ flex: 1, zIndex: 0, margin:12, color: '#808080',textAlign:'center'  }}>{opponent.venue_key ? opponent.time.label : "12:00PM - 3:00PM"}</Text>
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
        //listen to changes, and update the form 

    }, []);



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