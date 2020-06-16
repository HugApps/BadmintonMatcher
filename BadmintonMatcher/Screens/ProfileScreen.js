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
    TouchableOpacity
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

    const editable = props.mode == 'edit' ? true : false

    return (
        <View style={{ flex: 1, flexDirection: 'row', padding: 20, justifyContent: 'space-between', alignItems: 'center' }}>

            <Text style={{ fontSize: 12, color: 'white' }}>{props.label}</Text>
            <TextInput
                style={{ color: 'white' }}
                placeholder={props.value.toString()}
                editable={editable}
                placeholderTextColor={'white'}
                onChangeText={(text) => { props.onEdit(text) }}
            />

        </View>
    )


}

function TextBox(props) {

    const editable = props.mode == 'edit' ? true : false

    return (
        <View style={{ flex: 1, flexDirection: 'column', padding: 20, }}>
            <Text style={{ fontSize: 12, color: 'white' }}>{props.label}</Text>

            <TextInput
                multiline={true}
                style={{ borderWidth: 0.5, borderColor: 'white', color: 'white' }}
                placeholder={props.value}
                editable={editable}
                placeholderTextColor={'white'}
                onChangeText={(text) => { props.onEdit(text) }}
            />

        </View>
    )

}



function DisplayBanner(props) {
    const [user, setUser] = useState(auth().currentUser);
    return (
        <View style={{ flex: 1, margin: 5, maxHeight: '50%', alignItems: 'center', justifyContent: 'flex-start' }} >
            <Text style={{ color: 'white', fontSize: 25, margin: 10 }}>Personal Profile</Text>
            <Image style={{ backgroundColor: 'white', width: 150, height: 150, borderRadius: 150 / 2 }} source={require("./assets/test_profile.jpg")}></Image>
            <Text style={{ color: 'white', fontSize: 20, margin: 10 }}>{user.displayName ? user.displayName : user.email}</Text>
            <Text style={{ color: 'white', fontSize: 20, margin: 10 }}>{"MMR:6500"}</Text>
            <Text style={{ color: 'white', fontSize: 20, margin: 10 }}>{user.email}</Text>
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
    const profileData  = props.profileData
    const [edit, setEdit] = useState('preview')
    const [gender, setGender] = useState(profileData.gender)
    const [description,setDescription] =useState(profileData.description)
    const [matchType,setMatchType] =useState(profileData.matchType)
    const [yearsExp,setYearsExP] = useState(profileData.yearsExp)
    const [phoneNum,setPhoneNum] =useState(profileData.phoneNum)
    const [racket,setRacket] = useState(profileData.racket)

    const  buildSubmitData =()=>{
        return {
            gender:gender,
            description:description,
            matchType:matchType,
            yearsExp:yearsExp,
            phoneNum:phoneNum,
            racket:racket
        };
    }

    console.log('CURRENT GENDER', gender);
    return (

        <View style={{ flex: 4, margin: 10, padding: 10, justifyConent: 'flex-start', backgroundColor: '#5A8DD8', width: '100%' }} >
            <View style={{ flex: 1 }}>
                <TextBox 
                    value={description}
                    mode={edit} 
                    onEdit={(text)=>{setDescription(text)}}
                    label='About You:' />
                <InputRow 
                    value={phoneNum}
                    label='Phone:' 
                    onEdit={(text)=>{setPhoneNum(text)}}
                    mode={edit} />
                <InputRow 
                    value={yearsExp}
                    label='Years of Experience:' 
                    onEdit={(text)=>{setYearsExP(text)}}
                    mode={edit} />
                <InputRow 
                    value={racket} 
                    label='Favorite/Current Badminton Racket:' 
                    onEdit={(text)=>{setRacket(text)}}
                    mode={edit} />

                <Text style={{ color: 'white' }}>Sex:</Text>
                <SelectButtons 
                    values={['Male', 'Female', 'N/a']} 
                    mode={edit} 
                    selected={gender} 
                    onSelect={(index) => { setGender(index) }} />


                <Text style={{ color: 'white' }}>Prefered game:(Single,Mixed,Doubles)</Text>
                <SelectButtons 
                    values={['Single', 'Doubles', 'Mixed']} 
                    mode={edit} 
                    selected={matchType} 
                    onSelect={(index) => { setMatchType(index) }} />
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

function ButtonBar(props) {
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

export default function ProfileScreen(props) {

    const [user, setUser] = useState(auth().currentUser);
    const [displayName, setDisplayName] = useState(user.displayName);
    const [preview, setPreview] = useState(true);
  
    const testData = {
        gender:1,
        description:'test description text',
        matchType:1,
        yearsExp:10,
        phoneNum:'604-338-7732',
        racket:'N/A'}
    const [profileData,setProfileData] =useState({testData});




    return (
        <View style={{ flex: 5, backgroundColor: '#3171CE', justifyContent: 'space-around', flexDirection: 'column' }}>
            <ScrollView>
                <DisplayBanner />
                <ButtonBar />
                <Info profileData={profileData} onSubmit ={(data)=>{setProfileData(data)}}/>
            </ScrollView>
        </View >
    )

}