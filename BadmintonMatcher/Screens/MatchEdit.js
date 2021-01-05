import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
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
    const [selectedLocation, setSelected] = useState(0);

    useEffect(() => {
        database().ref('/venues').once('value').then((snapShot) => {
            if (snapShot) {
                let locationArray = Object.keys(snapShot.val()).map((v, i) => {
                    return { key: v, ...snapShot.val()[v] }
                })
                setLocations(locationArray);
            }

        })
    }, [])
    let items = locations.map((v, i) => {
        return { label: v.name, value: v }
    })
    if (items != null || items.length > 0) {
        return (
            <View style={{ flex: 1 }}>
                <DropDownPicker
                    items={items}
                    placeholder="Select an Location"
                    containerStyle={{ height: 40 }}
                    style={{ backgroundColor: '#fafafa' }}
                    itemStyle={{
                        justifyContent: 'flex-start'
                    }}
                    dropDownStyle={{ backgroundColor: '#fafafa' }}
                    onChangeItem={item => { setSelected(item) }}
                />

                <LocationSchedulePicker location={selectedLocation} />

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
    let controller;



    useEffect(() => {
        setLocation(props.location.value);
    }, [props.location])


    useEffect(() => {
        if (location) {

            if (location[filter]['schedule']) {
                let validDays = Object.keys(location[filter]['schedule']).map((d, index) => {
                    return { label: d, value: location[filter]['schedule'][d] }

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
            console.log('newHOUrs', newHours);
        }

    }, [selectedDay])


    if (location == null) {
        return null;
    }

    return (

        <View style={{ flex: 1 }}>
            <View style={{ margin: 10, height: 40, flexDirection: 'row', justifyContent: 'space-evenly' }}>
                {location['drop_in'] ? <FilterBox label={'Drop-in'} value={filter} filter={'drop_in'} onSelect={() => { setFilter('drop_in') }} /> : null}
                {location['bookings'] ? <FilterBox label={'Booking'} value={filter} filter={'bookings'} onSelect={() => { setFilter('bookings') }} /> : null}
            </View>

            <View style={{ flex: 1 }}>
                <DropDownPicker
                    items={days}
                    placeholder="Match Day"
                    containerStyle={{ height: 50 }}
                    style={{ backgroundColor: '#fafafa' }}
                    itemStyle={{
                        justifyContent: 'flex-start'
                    }}
                    dropDownStyle={{ backgroundColor: '#fafafa' }}
                    onChangeItem={(item) => { setDay(item.label) }}
                />
            </View>
            <View style={{ flex: 1 }}>
                <DropDownPicker

                    items={selectedDay ? hours : []}
                    placeholder="Match Time"
                    containerStyle={{ height: 50, }}
                    style={{ backgroundColor: '#fafafa' }}
                    itemStyle={{
                        justifyContent: 'flex-start'
                    }}
                    dropDownStyle={{ backgroundColor: '#fafafa' }}
                    onChangeItem={(item) => { setTime(item); console.log(item.value) }}
                />

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
        setMatchId(match_id);
        database().ref('/matches/' + match_id).once('value').then((snapShot) => {
            if (snapShot) {
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
        <View style={{ flex: 5, justifyContent: 'space-around', flexDirection: 'column' }}>
            {loading ? <ActivityIndicator animating={loading} size="large" color="#0000ff" /> : <VenuePicker />}
        </View >
    )

}