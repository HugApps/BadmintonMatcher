import React from 'react';
import { Component, useState } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    ScrollView,
    View,
    Text,
    StatusBar,
    TextInput,
    Button,
    Image,
    Alert

} from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';

//import auth from '@react-native-firebase/auth';

/// @refresh reset 

//when firebase or back end validates credentials 



function LoginScreen(props) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');


    const params = props.route.params

    const logoImage = require("./assets/logo.png")

    const checkField = (fieldText) => {
        if (fieldText == null) { return false }
        if (fieldText.length <= 0) { return false }
        return true;
    }

    const handleSubmit = (props) => {
        if (checkField(email) && checkField(password)) { props.route.params.login(email, password) }
        else {
            Alert.alert('Login error', 'Check and see if your fields are inputed correctly')
        }
    }

    return (
        <View style={{ flex: 1, margin: 10, flexDirection: 'column', justifyContent: 'center' }}>



            <View style={{ flex: 1, margin: 10, justifyContent: 'center' }}>
                <Image resizeMode='cover' resizeMethod={'scale'} style={{ marginLeft: 20, marginBottom: 10, height: 200, width: '80%' }} source={logoImage} />
                <Text style={{ fontSize: 30, padding: 10, marginBottom: 30 }}>Login</Text>
                <View style={{ margin: 10 }}>
                    <Text style={{ paddingBottom: 10 }}>Email Address</Text>
                    <TextInput
                        style={{ padding: 10, borderBottomWidth: 1 }}
                        placeholder={'Email'}
                        onChangeText={(text) => { setEmail(text) }}
                    />
                </View>

                <View style={{ margin: 10 }}>


                    <Text style={{ marginTop: 10, paddingTop: 10 }}>Password</Text>

                    <TextInput
                        style={{ padding: 10, borderBottomWidth: 1 }}
                        placeholder={'Password'}
                        secureTextEntry={true}
                        onChangeText={(text) => { setPassword(text) }}
                    />




                </View>


                <View style={{ marginTop: 40, flexDirection: 'row', justifyContent: 'space-around' }}>
                    <Button
                        title='Login'
                        onPress={() => { handleSubmit(props) }}
                    ></Button>

                    <Button
                        title='Register'
                        onPress={() => props.navigation.navigate('RegisterScreen')}>
                    </Button>

                </View>

            </View>




        </View>
    )




}



function RegisterForm(props) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName,setDisplayName] =useState('');

    const checkField = (fieldText) => {
        if (fieldText == null) { return false }
        if (fieldText.length <= 0) { return false }
        return true;
    }


    console.log('registerSCreen', props.route.params);
    const handleSubmit = () => {
        if (checkField(email) && checkField(password)) {
            props.route.params.register(email, password,displayName);
        }
        else {
            Alert.alert('Registration error', 'Check and see if your fields are inputed correctly')
        }
    }

    return (
        <View style={{ flex: 1, margin: 10, flexDirection: 'column', justifyContent: 'center' }}>


            <View style={{ flex: 1, margin: 10, justifyContent: 'center' }}>
                <View style={{ marginBottom: 10 }}>

                    <Text style={{ fontSize: 30, padding: 10, marginBottom: 30 }}>Register</Text>
                    <Text style={{ padding: 10, fontWeight: 'bold' }}>Badminton Matcher: Meet skilled opponents,improve your Game, and build your network!</Text>
                </View>

                <View style={{ margin: 10 }}>
                    <Text style={{ paddingBottom: 10 }}>Display Name : What other users will identify you as</Text>
                    <TextInput
                        style={{ padding: 10, borderBottomWidth: 1 }}
                        placeholder={'Email'}
                        onChangeText={(text) => { setDisplayName(text) }}
                    />
                </View>

                <View style={{ margin: 10 }}>
                    <Text style={{ paddingBottom: 10 }}>Email Address</Text>
                    <TextInput
                        style={{ padding: 10, borderBottomWidth: 1 }}
                        placeholder={'Email'}
                        onChangeText={(text) => { setEmail(text) }}
                    />
                </View>

                <View style={{ margin: 10 }}>


                    <Text style={{ marginTop: 10, paddingTop: 10 }}>Password</Text>

                    <TextInput
                        style={{ padding: 10, borderBottomWidth: 1 }}
                        placeholder={'Password'}
                        secureTextEntry={true}
                        onChangeText={(text) => { setPassword(text) }}
                    />




                </View>


                <View style={{ marginTop: 40, flexDirection: 'row', justifyContent: 'space-around' }}>
                    <Button
                        title='Register Now!'
                        onPress={() => { handleSubmit() }}
                    ></Button>
                    <Button
                        title='Back'
                        onPress={() => props.navigation.navigate('LoginScreen')}>
                    </Button>

                </View>

            </View>









        </View>
    )

}


const AuthStack = createStackNavigator();

export default function AuthScreens(props) {

    const [loggedIn, setLoggedIn] = useState(false)
    //token you get from store device
    const [user, setUser] = useState(false);
    //loading assets or authenticating state
    const [loading, setLoading] = useState(true);

    console.log('authSTACKPROPS', props);

    return (
        <AuthStack.Navigator>
            <AuthStack.Screen
                name="LoginScreen"
                headerShown={false}
                component={LoginScreen}
                screenProps={{ test: 'test' }}
                options={{ headerShown: false, title: null }}
                initialParams={{ login: props.route.params.login }}
            />
            <AuthStack.Screen
                name="RegisterScreen"
                screenProps={{ test: 'test' }}
                initialParams={{ register: (email, password,displayName) => props.route.params.register(email, password,displayName) }}
                component={RegisterForm} />
        </AuthStack.Navigator>
    )

}





