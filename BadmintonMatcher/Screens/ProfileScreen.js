import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import database from '@react-native-firebase/database';
import CheckBox from '@react-native-community/checkbox';

import {
    ScrollView,
    View,
    Text,
    Image,
    TextInput,
    TouchableOpacity, ActivityIndicator
} from 'react-native';

import auth from '@react-native-firebase/auth';

const editIcon = require("./assets/edit.png")
/// @refresh reset 
function InputRow(props) {

    const editIcon = require("./assets/edit.png")
    const [value, setValue] = useState(props.value);
    const [editable, setEditable] = useState(false);

    //icon from Icons made by <a href="https://www.flaticon.com/authors/becris" title="Becris">Becris</a> from <a href="https://www.flaticon.com/" title="Flaticon"> www.flaticon.com</a>
    if (editable) {
        return (

            <View style={{ flex: 1, margin: 10 }}>
                <View style={{ flex: 1, flexDirection: 'row', padding: 20, justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 15, color: 'black' }}>{props.label}</Text>
                    <TouchableOpacity onPress={() => { setEditable(false) }} >
                        <Image source={editIcon} style={{ height: 10, height: 10 }} height={20} width={20} />
                    </TouchableOpacity>

                </View>
                <View style={{ flex: 1, marginLeft: 20 }}>
                    <TextInput
                        style={{ color: 'black', width: 100, borderWidth: 0.5, backgroundColor: 'white' }}
                        editable={true}
                        placeholderTextColor={'black'}
                        onChangeText={(text) => { props.onEdit(text); setValue(text); }}
                    />
                </View>
            </View>
        )
    } else {
        return (
            <View style={{ flex: 1, margin: 10 }}>
                <View style={{ flex: 1, flexDirection: 'row', padding: 20, justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 15, color: 'black' }}>{props.label}</Text>
                    <TouchableOpacity onPress={() => { setEditable(true) }} >
                        <Image source={editIcon} style={{ height: 10, height: 10 }} height={20} width={20} />
                    </TouchableOpacity>

                </View>
                <View style={{ flex: 1, marginLeft: 20 }}>
                    <Text style={{ fontSize: 12, color: 'white' }}>{props.value.toString()}</Text>
                </View>

            </View>
        )

    }
}

function TextBox(props) {
    const editIcon = require("./assets/edit.png");
    const [value, setValue] = useState(props.value && props.value.length ? props.value : 'Type something here');
    const [editMode, setEditMode] = useState(false)

    if (editMode) {
        return (
            <View style={{ flex: 1, flexDirection: 'column', padding: 20, }}>
                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 12, color: 'white' }}>{props.label}</Text>
                    <TouchableOpacity onPress={() => { setEditMode(false) }} >
                        <Image source={editIcon} style={{ height: 10, height: 10 }} height={20} width={20} />
                    </TouchableOpacity>

                </View>


                <TextInput
                    multiline={true}
                    value={value}
                    style={{ borderWidth: 0.5, borderColor: 'white', color: 'white' }}
                    placeholder={props.value}
                    editable={true}
                    placeholderTextColor={'white'}
                    onChangeText={(text) => { setValue(text), props.onEdit(text) }}
                />

            </View>
        )

    } else {
        return (
            <View style={{ flex: 1, margin: 10, flexDirection: 'column', padding: 20, }}>
                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 12, color: 'white' }}>{props.label}</Text>
                    <TouchableOpacity onPress={() => { setEditMode(true) }} >
                        <Image source={editIcon} style={{ height: 10, height: 10 }} height={20} width={20} />

                    </TouchableOpacity>

                </View>

                <ScrollView>
                    <TextInput
                        multiline={true}
                        value={value}
                        style={{ borderWidth: 0.0, borderColor: 'white', color: 'white' }}
                        placeholder={props.value ? props.value : 'Make a small summary about yourself'}
                        editable={false}
                        placeholderTextColor={'white'}
                        onChangeText={(text) => { props.onEdit(text) }}
                    />

                </ScrollView>
            </View>

        )
    }

}



function DisplayBanner(props) {
    const [user, setUser] = useState(auth().currentUser);
    return (
        <View style={{ flex: 1, margin: 5, maxHeight: '50%', alignItems: 'center', justifyContent: 'flex-start' }} >
            <Text style={{ color: 'white', fontSize: 25, margin: 10 }}>Personal Profile</Text>
            <Image style={{ backgroundColor: 'white', width: 150, height: 150, borderRadius: 150 / 2 }} source={{ uri: props.data.profilePicUrL }}></Image>
            <Text style={{ color: 'white', fontSize: 20, margin: 10 }}>{props.data.display_name}</Text>
            <Text style={{ color: 'white', fontSize: 20, margin: 10 }}>MMR:{props.data.mmr}</Text>
            <Text style={{ color: 'white', fontSize: 20, margin: 10 }}>{props.data.email}</Text>
        </View>
    )
}

// list of values, callback that returns the index selected,
function SelectButtons(props) {
    const [indexSelected, setIndex] = useState(props.selected)
    return (
        <View style={{ padding: 10, flex: 0.5, flexDirection: 'row', width: '100%' }}>
            {props.values.map((v, i) => {
                let color = indexSelected == i ? 'orange' : '#304BCF'
                return (
                    <TouchableOpacity disabled={props.mode != 'edit' ? true : false} onPress={() => { props.onSelect(i); setIndex(i) }} style={{ flex: 0.5, height: 50, justifyContent: 'center', backgroundColor: color, alignItems: 'center', borderWidth: 0.5, borderRadius: 5, borderColor: '#5A8DD8' }}>
                        <Text style={{ color: 'white', fontSize: 13 }}>{v}</Text>
                    </TouchableOpacity>
                )
            })}
        </View>
    )
}

function Info(props) {
    let profileData = props.profileData;

    const [edit, setEdit] = useState('preview')
    const [gender, setGender] = useState(props.profileData['gender'])
    const [description, setDescription] = useState(props.profileData['description'])
    const [matchType, setMatchType] = useState(props.profileData['matchType'])
    const [yearsExp, setYearsExP] = useState(props.profileData['yearsExp'])
    const [phoneNum, setPhoneNum] = useState(props.profileData['phoneNum'])
    const [racket, setRacket] = useState(props.profileData['racket'])

    const buildSubmitData = () => {

        return {
            gender: gender,
            description: description,
            game_mode: matchType,
            years_of_exp: yearsExp,
            phoneNum: phoneNum,
            racket: racket
        };
    }

    return (

        <View style={{ flex: 4, margin: 10, padding: 10, justifyConent: 'flex-start', backgroundColor: '#5A8DD8', width: '100%' }} >
            <View style={{ flex: 1 }}>
                <TextBox
                    value={description}
                    mode={edit}
                    onEdit={(text) => { setDescription(text) }}
                    label='About You:' />
                <InputRow
                    value={phoneNum}
                    label='Email:'
                    onEdit={(text) => { setPhoneNum(text) }}
                    mode={edit} />
                <InputRow
                    value={yearsExp}
                    label='Years of Experience:'
                    onEdit={(text) => { setYearsExP(text) }}
                    mode={edit} />
                <InputRow
                    value={racket}
                    label='Favorite/Current Badminton Racket:'
                    onEdit={(text) => { setRacket(text) }}
                    mode={edit} />
                <MultiSelectBox
                    mainLabel={'Gender'}
                    labels={['M', 'F', 'N/A']}
                    value={gender}
                    onChange={(index) => { setGender(index); console.log('INDEX TOGGLED', index) }}
                />
                   <MultiSelectBox
                    mainLabel={'Prefered game mode:'}
                    labels={['Single', 'Doubles', 'Mixed']}
                    value={gender}
                    onChange={(index) => { setMatchType(index); console.log('INDEX TOGGLED', index) }}
                />

                {edit == 'preview' ? (<TouchableOpacity onPress={() => { setEdit('edit') }} style={{ flex: 0.5, height: 50, justifyContent: 'center', backgroundColor: '#304BCF', alignItems: 'center', borderWidth: 0.5, borderRadius: 5, borderColor: '#5A8DD8' }}>
                    <Text>Edit</Text>
                </TouchableOpacity>) :
                    <View>

                        <TouchableOpacity onPress={() => { props.onSubmit(buildSubmitData()) }} style={{ flex: 0.5, height: 50, justifyContent: 'center', backgroundColor: '#304BCF', alignItems: 'center', borderWidth: 0.5, borderRadius: 5, borderColor: '#5A8DD8' }}>
                            <Text>Save</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => { setEdit('preview') }} style={{ flex: 0.5, height: 50, justifyContent: 'center', backgroundColor: '#304BCF', alignItems: 'center', borderWidth: 0.5, borderRadius: 5, borderColor: '#5A8DD8' }}>
                            <Text>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                }
            </View>
        </View>
    )
}


function MultiSelectBox(props) {
    const [editable, setEditMode] = useState(false)
    const [mainLabel, setLabels] = useState(props.mainLabel);
    const [responseLabels, setResponseLabels] = useState(props.labels)
    const [value, setValue] = useState(props.value);

    if (props.labels == null || props.labels.length == 0) {
        return null;
    }

    const options = responseLabels.map((l, index) => {
        return (
            <View style={{flex:1,margin:20,justifyContent:'center',alignContent:'center'}} >
                <Text style={{margin:5,flex:1,fontSize:16,color:'white',}}>{l}</Text>
                <CheckBox
                    style={{flex:1,width:20,height:20}}
                    boxType={'square'}
                    onCheckColor={'white'}
                    onTintColor={'white'}
                    tinColor={'white'}
                    disabled={!editable}
                    value={(index == value) ? true : false}
                    onValueChange={(newValue) => { setValue(index); props.onChange(index) }}>

                </CheckBox>

            </View>

        )
    });



    return (
        <View style={{ flex: 1, margin: 20, flexDirection: 'column' }}>
            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: 'black' }}>{mainLabel}:</Text>
                <TouchableOpacity onPress={() => { setEditMode(!editable) }} >
                    <Image source={editIcon} style={{ height: 10, height: 10 }} height={20} width={20} />
                </TouchableOpacity>
            </View>

            <View style={{ flex: 1, marginTop:10,marginLeft:-10, flexDirection: 'row', justifyContent: 'space-around' }}>
                {options}
            </View>
        </View >
    )


}


export default function ProfileScreen(props) {

    const [user, setUser] = useState(auth().currentUser);
    const [displayName, setDisplayName] = useState(user.displayName);
    const [preview, setPreview] = useState(true);
    const [profileData, setProfileData] = useState(null);

    const saveData = (data) => {
        console.log('data to be sent', data);
        database().ref('/clients/' + user.uid + '/profile').set(data).then((result) => {
            console.log('saving results', result);
        })


    }

    useEffect(() => {

        database().ref('/clients/' + user.uid).once('value').then(snapShot => {
            console.log('profile data loading result', snapShot.val())
            let userDetails = snapShot.val();
            let profileData = snapShot.val()['profile'];
            console.log('userDetails', userDetails);

            let userProfile = {
                profilePicUrL: userDetails.profilePicUrL,
                display_name: userDetails.display_name,
                mmr: userDetails.mmr,
                test: 'test',
                gender: profileData ? profileData['gender'] : 1,
                description: profileData ? profileData['description'] : ' ',
                matchType: profileData ? profileData['game_mode'] : 0,
                yearsExp: profileData ? profileData['years_of_exp'] : 10,
                phoneNum: profileData ? profileData['phoneNum'] : 'N/A',
                racket: profileData ? profileData['racket'] : 'N/A',
            }
            setProfileData(userProfile);
        })
            .catch((error) => {
                console.log('profile load error', error);
                let userProfile = {
                    test: 'test',
                    gender: 1,
                    description: "",
                    matchType: 0,
                    yearsExp: 0,
                    phoneNum: "",
                    racket: "",
                }
                setProfileData(userProfile);
            })
    }, []);

    if (profileData == null) {
        return (
            <View style={{ flex: 5, backgroundColor: '#3171CE', justifyContent: 'space-around', flexDirection: 'column' }}>
                <ScrollView>
                    <ActivityIndicator size="large" color="white" />
                </ScrollView>
            </View >

        )
    }
    return (
        <View style={{ flex: 5, backgroundColor: '#3171CE', justifyContent: 'space-around', flexDirection: 'column' }}>
            <ScrollView>

                <DisplayBanner data={profileData} />
                <Info profileData={profileData} onSubmit={(data) => { saveData(data) }} />
            </ScrollView>
        </View >
    )

}