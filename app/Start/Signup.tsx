import React, { useState , useEffect} from 'react';
import { View, Text, StatusBar, TextInput, TouchableOpacity, SafeAreaView, Image,  } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { signInWithCredential, GoogleAuthProvider } from 'firebase/auth';

import { auth } from './firebaseconfig'; // Adjust path if needed
import { useAuthRequest, makeRedirectUri, ResponseType } from 'expo-auth-session';

console.log(makeRedirectUri({ scheme: 'FareEasy' }));
WebBrowser.maybeCompleteAuthSession();

const useGoogleAuth = () => {
  const router = useRouter();

 
const [request, response, promptAsync] = Google.useAuthRequest({
  androidClientId: '54531737499-lu242kqrttllvkkl7pg90k0pl9vfbdke.apps.googleusercontent.com',
  scopes: ['openid', 'profile', 'email'], // 🧠 include openid for id_token
  redirectUri: makeRedirectUri({
    scheme: 'FareEasy', // Must match your app.json
   }),
});

  useEffect(() => {
    console.log(makeRedirectUri({ scheme: 'FareEasy' }));
  console.log('Google Auth Response:', response);

  if (response?.type === 'success' && response.authentication?.idToken) {
    const { idToken } = response.authentication;
    const credential = GoogleAuthProvider.credential(idToken);

    signInWithCredential(auth, credential)
      .then((userCred) => {
        console.log('✅ Signed in:', userCred.user.displayName);
        router.replace('./Home');
      })
      .catch((err) => {
        console.error('❌ Firebase Sign-In Error:', err);
      });
  }
}, [response]);

  return {
    request,
    promptAsync,
  };
};

const Signup = () => {
  const router = useRouter();
  const { promptAsync } = useGoogleAuth(); // ✅ Call the custom hook here

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    router.push('./Login'); 
  };

  const handleSignUp = async () => {
  if (!fullName || !email || !password) {
    alert('Please fill in all fields.');
    return;
  }
  try {
    const response = await fetch('http://localhost:5000/signup', { // Change to your backend URL if needed
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: fullName,
        email: email,
        password: password,
      }),
    });
    const data = await response.json();
    if (response.ok) {
      alert('Signup successful!');
      router.replace('./Home');
    } else {
      alert(data.message || 'Signup failed');
    }
  } catch (error) {
    alert('Network error. Please try again.');
  }
};



  return (
      <SafeAreaView className="flex-1 bg-gray-900">
         <StatusBar barStyle="light-content" backgroundColor="transparent" translucent  />
        <View className="flex-1 px-6 pt-4 items-center">
          {/* Logo */}
          <View className="mb-8 mt-8 items-center">
            <View>
              <View className="w-16 h-16 rounded-full bg-gray-900 items-center justify-center"></View>
              <Image
                source={require('../../assets/FareEasy-Logo.png')} // Replace with your image path
                style={{ width: 180, height: 180 }}
              />
            </View>
          </View>

          {/* Create account heading */}
          <Text className="text-white text-2xl font-bold mb-2 self-start">Create an Account</Text>
          <Text className="text-gray-400 text-sm mb-6 self-start">
            To create an account provide details, verify email and set password
          </Text>

          {/* Full Name input */}
          <View className="w-full mb-4">
            <TextInput
              className="w-full bg-gray-800 text-gray-300 rounded-lg p-4 border border-gray-700"
              placeholder="Enter your Full Name"
              placeholderTextColor="#9CA3AF"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="none"
            />
          </View>

          {/* Email input */}
          <View className="w-full mb-4">
            <TextInput
              className="w-full bg-gray-800 text-gray-300 rounded-lg p-4 border border-gray-700"
              placeholder="Enter your Email"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Password input */}
          <View className="w-full mb-6 relative">
            <TextInput
              className="w-full bg-gray-800 text-gray-300 rounded-lg p-4 border border-gray-700"
              placeholder="Enter your Password"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              className="absolute right-4 top-4"
              onPress={() => setShowPassword(!showPassword)}
            >
             <Ionicons
                name={showPassword ? 'eye-off' : 'eye'}
                size={24}
                color="#9CA3AF"
              />
            </TouchableOpacity>
          </View>

          {/* Sign up button */}
          <TouchableOpacity
            className="w-full bg-cyan-500 rounded-lg p-4 items-center mb-4"
            onPress={handleSignUp}
          >
            <Text className="text-white font-bold">Sign up</Text>
          </TouchableOpacity>

          {/* Or sign in with */}
          <View className="w-full flex-row items-center justify-center mb-6">
            <View className="h-px bg-gray-700 flex-1" />
            <Text className="text-gray-500 mx-4">Or Sign in with</Text>
            <View className="h-px bg-gray-700 flex-1" />
          </View>

          {/* Social login buttons */}
          <View className="flex-row justify-between w-full">
            <TouchableOpacity className="flex-1 mr-2 bg-gray-800 rounded-lg p-4 items-center border border-gray-700">
              <Image
                source={require('../../assets/facebook-icon.png')} // Replace with your image path
                style={{ width: 30, height: 30 }}
              />
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 ml-2 bg-gray-800 rounded-lg p-4 items-center border border-gray-700"
              onPress={() => promptAsync()}
            >
              <Image
                source={require('../../assets/google-icon.png')}
                style={{ width: 30, height: 30 }}
              />
            </TouchableOpacity>
          </View>

          {/* Login link */}
          <View className="flex-row mt-auto mb-8 justify-center">
            <Text className="text-gray-400">Already have an Account? </Text>
            <TouchableOpacity onPress={handleLogin}>
              <Text className="text-cyan-500">Sign in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
   
  );
};

export default Signup;

