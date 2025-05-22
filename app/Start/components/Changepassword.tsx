import React, { useState,  } from 'react';
import { View, Text, TextInput, StatusBar, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Changepassword() {
    const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fontsLoaded] = useFonts({
        'Inter-Bold': require('../../../assets/fonts/Inter_18pt-Bold.ttf'), // Replace with your font path
        'Inter-Regular': require('../../../assets/fonts/Inter_18pt-Regular.ttf'), // Replace with your font path
      });
    
      const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      alert('Please fill in both fields.');
      return;
    }
    if (password.length < 8) {
      alert('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }
    const userId = await AsyncStorage.getItem('user_id');
    if (!userId) {
      alert('User not logged in.');
      return;
    }
    try {
      const res = await fetch('https://donewithit-yk99.onrender.com/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          new_password: password,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        alert('Password changed successfully!');
        router.push('./Menu');
      } else {
        alert(data.message || 'Failed to change password.');
      }
    } catch (e) {
      alert('Network error. Please try again.');
    }
  };
      if (!fontsLoaded) {
        return null; // Render nothing until the font is loaded
      }
  const handleBack = () => {
    // Add logic for opening the menu (e.g., navigate to a menu screen or toggle a drawer)
    router.push('./Menu'); 
  };
  return (
    <SafeAreaView className="flex-1 bg-[#0f1c2e]">
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <View className="flex-1 px-5 pt-10">
        {/* Back button */}
        <TouchableOpacity className="mb-5">
          <Ionicons name="chevron-back" size={24} color="white" onPress={handleBack}/>
        </TouchableOpacity>
        
        {/* Header */}
        <Text className="mb-3" style={{ color: 'white', fontSize: 24, fontFamily: 'Inter-Bold', marginBottom: 8, alignSelf: 'flex-start' }}>
          Create new password
        </Text>
        
        {/* Description */}
        <Text className=" mb-6" style={{ color: 'gray', fontSize: 11, fontFamily: 'Inter-Regular',  alignSelf: 'flex-start' }}>
          Your new password must be different from previous used passwords
        </Text>
        
        {/* Password Field */}
        <View className="mb-5">
          <Text className="mb-2" style={{ color: 'white', fontSize: 16, fontFamily: 'Inter-Regular',  alignSelf: 'flex-start' }}>Password</Text>
          <View className="flex-row items-center border border-gray-700 rounded bg-gray-800">
            <TextInput
              className="flex-1 py-3 px-4 text-white"
              placeholder=""
              placeholderTextColor="#6B7280"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              style={{ color: 'white', fontSize: 16, fontFamily: 'Inter-Regular'}}
            />
            <TouchableOpacity 
              className="px-3" 
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons 
                name={showPassword ? 'eye-off' : 'eye'} 
                size={20} 
                color="white" 
              />
            </TouchableOpacity>
          </View>
          <Text className="mt-1" style={{ color: 'gray', fontSize: 11, fontFamily: 'Inter-Regular'}}>
            Must be at least 8 character.
          </Text>
        </View>
        
        {/* Confirm Password Field */}
        <View className="mb-8">
          <Text className=" mb-2" style={{ color: 'white', fontSize: 16, fontFamily: 'Inter-Regular',  alignSelf: 'flex-start' }}>Confirm Password</Text>
          <View className="flex-row items-center border border-gray-700 rounded bg-gray-800">
            <TextInput
              className="flex-1 py-3 px-4 text-white"
              placeholder=""
              placeholderTextColor="#6B7280"
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              style={{ color: 'white', fontSize: 16, fontFamily: 'Inter-Regular'}}
            />
            <TouchableOpacity 
              className="px-3" 
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Ionicons 
                name={showConfirmPassword ? 'eye-off' : 'eye'} 
                size={20} 
                color="white" 
              />
            </TouchableOpacity>
          </View>
          <Text className="mt-1" style={{ color: 'gray', fontSize: 11, fontFamily: 'Inter-Regular'}}>
            Both passwords must match.
          </Text>
        </View>
        
        {/* Reset Password Button */}
        <TouchableOpacity className="bg-cyan-500 py-4 rounded-xl mt-8" onPress={handleResetPassword}>
        <Text style={{ color: 'white', fontSize: 16, fontFamily: 'Inter-Regular', alignSelf: 'center' }}>
          Reset Password
        </Text>
      </TouchableOpacity>

        {/* Bottom Indicator */}
        <View className="absolute bottom-8 left-0 right-0 items-center">
          <View className="w-16 h-1 bg-gray-600 rounded-full" />
        </View>
      </View>
    </SafeAreaView>
  );
}