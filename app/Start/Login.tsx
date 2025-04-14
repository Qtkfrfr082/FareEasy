import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    router.push('./Home'); 
  };
  const handleSignUp = () => {
    router.push('./Signup'); // Navigate to the Signup screen
  };

  return (
      <SafeAreaView className="flex-1 bg-gray-900">
        <View className="flex-1 px-6 pt-10 items-center">
          {/* Logo */}
          <View className="mb-20 mt-20 items-center">
            <View className="w-16 h-16 rounded-full bg-gray-900 items-center justify-center">
              <Image
                source={require('../../assets/FareEasy-Logo.png')} // Replace with your image path
                style={{ width: 250, height: 250 }}
              />
            </View>
          </View>

          {/* Sign in text */}
          <Text className="text-white text-2xl font-bold mb-2 self-start">Sign in to your</Text>
          <Text className="text-white text-2xl font-bold mb-6 self-start">Account</Text>
          <Text className="text-gray-400 text-sm mb-4 self-start">Enter your email and password to log in</Text>

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