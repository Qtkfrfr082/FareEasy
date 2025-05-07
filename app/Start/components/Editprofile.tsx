import React, { useState } from 'react';
import { View, StatusBar, Text, TextInput, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';


export default function Editprofile() {
    const router = useRouter();
    
  const [name, setName] = useState('Richard Kyle Gonzales');
  const [email, setEmail] = useState('rk.gonzales@gmail.com');
  const [phone, setPhone] = useState('+639123456789');
  const [address, setAddress] = useState('123 Mockingbird Lane, Figtown, Z20000');
  const [fontsLoaded] = useFonts({
        'Inter-Bold': require('../../../assets/fonts/Inter_18pt-Bold.ttf'), // Replace with your font path
        'Inter-Regular': require('../../../assets/fonts/Inter_18pt-Regular.ttf'), // Replace with your font path
      });
    
      if (!fontsLoaded) {
        return null; // Render nothing until the font is loaded
      }
  const handleBack = () => {
    // Add logic for opening the menu (e.g., navigate to a menu screen or toggle a drawer)
    router.push('./Menu'); 
  };
  return (
    <ScrollView className="flex-1 bg-[#0f1c2e] px-6 pt-12">
      {/* Header */}
      <View className="flex-row items-center mb-6">
        <Feather name="arrow-left" size={24} color="white" onPress={handleBack}/>
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
      <TouchableOpacity className="bg-blue-600 py-4 rounded-xl mt-8">
        <Text className="text-center "style={{ color: 'white', fontSize: 16, fontFamily: 'Inter-Regular'}}>Save Changes</Text>
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
