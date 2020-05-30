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

} from 'react-native';

//import auth from '@react-native-firebase/auth';



function LoginScreen(props) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const params = props.route.params

    const logoImage = require("./assets/logo.png")

    return (
        <View style={{ flex: 1, margin: 10, flexDirection: 'column', justifyContent: 'center' }}>



            <View style={{ flex: 1, margin: 10, justifyContent: 'center' }}>
                <Image resizeMode='cover' resizeMethod={'scale'} style={{ marginLeft: 20, marginBottom: 10, height: 200, width: '80%' }} source={logoImage} />
                <Text style={{ fontSize: 30, padding: 10, marginBottom: 30 }}>Login</Text>
                <View style={{margin:10}}>
                    <Text style={{ paddingBottom: 10 }}>Email Address</Text>
                    <TextInput
                        style={{ padding: 10, borderBottomWidth: 1 }}
                        placeholder={'Email'}
                        onChangeText={(text) => { setEmail(text) }}
                    />
                </View>

                <View style={{margin:10}}>


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
                        onPress={() => { props.route.params.onLogin(email, password) }}
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

    const params = props.route.params

    return (
        <View style={{ flex: 1, margin: 10, flexDirection: 'column', justifyContent: 'center' }}>


            <View style={{ flex: 1, margin: 10, justifyContent: 'center' }}>
                <View style={{marginBottom:10}}>
                    
                    <Text style={{ fontSize: 30, padding: 10, marginBottom: 30 }}>Register</Text>
                    <Text style={{ padding: 10, fontWeight: 'bold' }}>Badminton Matcher: Meet skilled opponents,improve your Game, and build your network!</Text>
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
                        onPress={() => { props.route.params.onRegister(email, password) }}
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



export { LoginScreen, RegisterForm }

