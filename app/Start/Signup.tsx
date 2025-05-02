import React, { useState } from 'react';
import { View, Text, StatusBar, TextInput, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { useRouter } from 'expo-router';

const Signup = () => {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    router.push('./Login'); 
  };

  const handleSignUp = () => {
    // Add signup logic here
    router.replace('./Home'); // Navigate to Home screen
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
              <Text className="text-gray-400">⊚</Text>
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
            <TouchableOpacity className="flex-1 ml-2 bg-gray-800 rounded-lg p-4 items-center border border-gray-700">
              <Image
                source={require('../../assets/google-icon.png')} // Replace with your image path
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