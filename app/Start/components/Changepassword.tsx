import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function Changepassword() {
    const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const handleBack = () => {
    // Add logic for opening the menu (e.g., navigate to a menu screen or toggle a drawer)
    router.push('./Menu'); 
  };
  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <View className="flex-1 px-5 pt-6">
        {/* Back button */}
        <TouchableOpacity className="mb-5">
          <Ionicons name="chevron-back" size={24} color="white" onPress={handleBack}/>
        </TouchableOpacity>
        
        {/* Header */}
        <Text className="text-white text-2xl font-bold mb-3">
          Create new password
        </Text>
        
        {/* Description */}
        <Text className="text-gray-400 text-sm mb-6">
          Your new password must be different from previous used passwords
        </Text>
        
        {/* Password Field */}
        <View className="mb-5">
          <Text className="text-white text-sm mb-2">Password</Text>
          <View className="flex-row items-center border border-gray-700 rounded bg-gray-800">
            <TextInput
              className="flex-1 py-3 px-4 text-white"
              placeholder=""
              placeholderTextColor="#6B7280"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
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
          <Text className="text-gray-400 text-xs mt-1">
            Must be at least 8 character.
          </Text>
        </View>
        
        {/* Confirm Password Field */}
        <View className="mb-8">
          <Text className="text-white text-sm mb-2">Confirm Password</Text>
          <View className="flex-row items-center border border-gray-700 rounded bg-gray-800">
            <TextInput
              className="flex-1 py-3 px-4 text-white"
              placeholder=""
              placeholderTextColor="#6B7280"
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
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
          <Text className="text-gray-400 text-xs mt-1">
            Both passwords must match.
          </Text>
        </View>
        
        {/* Reset Password Button */}
        <TouchableOpacity className="bg-blue-600 py-4 rounded">
          <Text className="text-white text-center font-medium">
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