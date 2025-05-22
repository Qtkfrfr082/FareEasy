import React, { useState } from 'react';
import { View,  StatusBar, Text, TextInput, TouchableOpacity, SafeAreaView, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fontsLoaded] = useFonts({
    'Inter-Bold': require('../../assets/fonts/Inter_18pt-Bold.ttf'), // Replace with your font path
    'Inter-Regular': require('../../assets/fonts/Inter_18pt-Regular.ttf'), // Replace with your font path
  });

  if (!fontsLoaded) {
    return null; // Render nothing until the font is loaded
  }
  const handleLogin = async () => {
  if (!email || !password) {
    alert('Please enter both email and password.');
    return;
  }
  try {
    const response = await fetch('https://donewithit-yk99.onrender.com/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (response.ok) {
      // Save user_id for future requests
      if (data.user_id) {
        await AsyncStorage.setItem('user_id', data.user_id);
        console.log('User ID saved:', data.user_id);
      }
      alert('Login successful!');
      router.replace('./Home');
    } else {
      alert(data.message || 'Login failed');
    }
  } catch (error) {
    alert('Network error. Please try again.');
  }
};

  const handleSignUp = () => {
    router.push('./Signup'); // Navigate to the Signup screen
  };

  return (
      <SafeAreaView className="flex-1 bg-gray-900">
         <StatusBar barStyle="light-content" backgroundColor="transparent" translucent  />
        <View className="flex-1 px-6 pt-10 items-center">
          {/* Logo */}
          <View className="mb-10 mt-28 items-center">
            <View className="w-16 h-16 rounded-full bg-gray-900 items-center justify-center">
              <Image
                source={require('../../assets/FareEasy-Logo.png')} // Replace with your image path
                style={{ width: 180, height: 180 }}
              />
            </View>
          </View>

          {/* Sign in text */}
          <Text style={{ color: 'white', fontSize: 24, fontFamily: 'Inter-Bold', marginBottom: 8, alignSelf: 'flex-start' }}>
            Sign in to your</Text>
            <Text style={{ color: 'white', fontSize: 24, fontFamily: 'Inter-Bold', marginBottom: 8, alignSelf: 'flex-start' }}>
              Account</Text>
              <Text style={{ color: 'gray', fontSize: 12, fontFamily: 'Inter-Regular', marginBottom: 8, alignSelf: 'flex-start' }}>Enter your email and password to log in</Text>

          {/* Email input */}
          <View className="w-full mb-4">
            <TextInput
              className="w-full bg-gray-800 text-gray-300 rounded-lg p-4 border border-gray-700"
              placeholder="Enter your Email Address"
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

          {/* Login button */}
          <TouchableOpacity className="w-full bg-cyan-500 rounded-lg p-4 items-center mb-4" onPress={handleLogin}>
            <Text className="text-white font-bold">Login</Text>
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
            <TouchableOpacity className="flex-1 ml-2 bg-gray-800 rounded-lg p-4 items-center border border-gray-700">
              <Image
                source={require('../../assets/google-icon.png')} // Replace with your image path
                style={{ width: 30, height: 30 }}
              />
            </TouchableOpacity>
          </View>

          {/* Sign up link */}
          <View className="flex-row mt-auto mb-8">
            <Text className="text-gray-400">Don't have an Account? </Text>
            <TouchableOpacity onPress={handleSignUp}>
              <Text className="text-cyan-500">Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
 
  );
};

export default Login;