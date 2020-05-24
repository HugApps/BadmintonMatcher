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
import auth from '@react-native-firebase/auth';


export default class LoginScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {loggedIn:false,newUser:false};

      }

   /* componentDidMount(){
        //use this later to check for stored tokens



        
    }*/

    componentDidMount(){
        const authSubscribe = auth().onAuthStateChanged(onAuthStateChanged);



    }



    onAuthStateChanged(user){
        if(user){
            console.log(user);
            this.setState({loggedIn:true});
        }
    }

    redirectToDashboard(){
        console.log(this.props);
    }

    renderLoginForm = (props) => {
        const [email , setEmail] = useState('');
        const [password,setPassword] = useState('');
 
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
                    onPress={()=>{props.navigator.navigate('Dashboard')}}
                ></Button>
                <Button
                    title = 'Register'
                    onPress ={()=>this.setState({newUser:true})}>
                </Button>
            </View>
        )
    }

    renderSignUpForm = (props) => {
        const [email , setEmail] = useState('');
        const [password,setPassword] = useState('');

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
                    onPress={()=>{props.navigator.navigate('Dashboard')}}
                ></Button>
                <Button
                    title = 'Back'
                    onPress ={()=>this.setState({loggedIn:false,newUser:false})}>
                </Button>
            </View>
        )

    }

    registerUser(email,password){
        if(email && password) {
            





        }



    }


    render () {

       if(this.state.newUser) {
           return <this.renderSignUpForm navigator = {this.props.navigation}/>
       }
       if(this.state.loggedIn == false) {
           return <this.renderLoginForm navigator = {this.props.navigation}/>
       } 

    }
}

