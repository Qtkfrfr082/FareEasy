import React, { useState, useEffect } from 'react';
import { View, StatusBar, Text, TextInput, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function Editprofile() {
    const router = useRouter();
    
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [fontsLoaded] = useFonts({
    'Inter-Bold': require('../../../assets/fonts/Inter_18pt-Bold.ttf'),
    'Inter-Regular': require('../../../assets/fonts/Inter_18pt-Regular.ttf'),
  });

  // Fetch user info on mount
  useEffect(() => {
    const fetchProfile = async () => {
      const userId = await AsyncStorage.getItem('user_id');
      if (!userId) return;
      try {
        const res = await fetch(`https://donewithit-yk99.onrender.com/get-user?user_id=${userId}`);
        const data = await res.json();
        if (res.ok && data.user) {
          setName(data.user.name || '');
          setEmail(data.user.email || '');
          setPhone(data.user.phone || '');
          setAddress(data.user.address || '');
        } else {
          setName('');
          setEmail('');
          setPhone('');
          setAddress('');
        }
      } catch (e) {
        setName('');
        setEmail('');
        setPhone('');
        setAddress('');
      }
    };
    fetchProfile();
  }, []);
    
      if (!fontsLoaded) {
        return null; // Render nothing until the font is loaded
      }
  const handleBack = () => {
    // Add logic for opening the menu (e.g., navigate to a menu screen or toggle a drawer)
    router.push('./Menu'); 
  };

  const handleSave = async () => {
    const userId = await AsyncStorage.getItem('user_id');
    if (!userId) {
      Alert.alert('Error', 'User not logged in.');
      return;
    }
    try {
      const res = await fetch('https://donewithit-yk99.onrender.com/update-user', {
        method: 'POST', // or 'PUT' if your backend expects it
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          name,
          email,
          phone,
          address,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert('Success', 'Profile updated!');
       
      } else {
        Alert.alert('Error', data.message || 'Failed to update profile.');
      }
    } catch (e) {
      Alert.alert('Error', 'Network error. Please try again.');
    }
  };
  return (
    <ScrollView className="flex-1 bg-[#0f1c2e] px-6 pt-12">
      {/* Header */}
      <View className="flex-row items-center mb-6">
        <Ionicons name="chevron-back" size={28} color="white" onPress={() => router.back()}/>
        <Text className="ml-4" style={{ color: 'white', fontSize: 24, fontFamily: 'Inter-Bold' }}>Edit Profile</Text>
      </View>

      {/* Avatar & Name */}
      <View className="items-center mb-10">
        <Image
          source={require('../../../assets/avatar-boy.png')} // Replace with your image
          className="w-32 h-32 rounded-full mb-3"
        />
        <Text style={{ color: 'white', fontSize: 16, fontFamily: 'Inter-Bold'}}>{name}</Text>
      </View>

      {/* Input Fields */}
      <View className="space-y-6 ">
        <Field label="Name" value={name} onChangeText={setName} />
        <Field label="Email Address" value={email} onChangeText={setEmail} keyboardType="email-address" />
        <Field label="Phone Number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <Field label="Home Address" value={address} onChangeText={setAddress} />
      </View>

      {/* Save Button */}
      <TouchableOpacity className="bg-cyan-500 py-4 rounded-xl mt-8" onPress={handleSave}>
        <Text className="text-center " style={{ color: 'white', fontSize: 16, fontFamily: 'Inter-Regular' }}>Save Changes</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

import { KeyboardTypeOptions } from 'react-native';

const Field = ({ label, value, onChangeText, keyboardType }: { label: string; value: string; onChangeText: (text: string) => void; keyboardType?: KeyboardTypeOptions }) => (
  <View>
    <Text className="text-gray-300 mb-2" style={{ color: 'gray', fontSize: 16, fontFamily: 'Inter-Regular'}}>{label}</Text>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      placeholderTextColor="#aaa"
      className="border-b border-gray-500 text-white pb-1 mb-2"
      style={{ color: 'white', fontSize: 16, fontFamily: 'Inter-Regular'}}
    />
  </View>
);
