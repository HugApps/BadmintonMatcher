import React from 'react';
import {Component,useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  TextInput,
  Button,
  
} from 'react-native';  

//import auth from '@react-native-firebase/auth';



function LoginScreen(props) {
    const [email , setEmail] = useState('');
    const [password,setPassword] = useState('');

    const params = props.route.params

    console.log(props.route);

    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text>LoginPage</Text>
            <TextInput 
                placeholder={'Email'}
                onChangeText= {(text)=>{setEmail(text)}}
            />
           <TextInput 
                placeholder={'password'}
                secureTextEntry ={true}
                onChangeText= {(text)=>{setPassword(text)}}
            />
            <Button
                title ='Login'
                onPress={()=>{props.route.params.onLoginSuccess('test')}}
            ></Button>
            <Button
                title = 'Register'
                onPress ={()=>props.navigation.navigate('RegisterScreen')}>
            </Button>
        </View>
    )



  
}


  
function RegisterForm(props){
        const [email , setEmail] = useState('');
        const [password,setPassword] = useState('');

        const params = props.route.params

        console.log(props.route);

        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text>Sign up </Text>
                <TextInput 
                    placeholder={'Email'}
                    onChangeText= {(text)=>{setEmail(text)}}
                />
               <TextInput 
                    placeholder={'password'}
                    secureTextEntry ={true}
                    onChangeText= {(text)=>{setPassword(text)}}
                />

                 <TextInput 
                    placeholder={'Display name:'}
                    onChangeText= {(text)=>{setPassword(text)}}
                />
                <Button
                    title ='Register!'
                    onPress={()=>{props.route.params.onRegister(email,password)}}
                ></Button>
                <Button
                    title = 'Back'
                    onPress ={()=>props.navigation.navigate('LoginScreen')}>
                </Button>
            </View>
        )

    }

  

export {LoginScreen,RegisterForm}

