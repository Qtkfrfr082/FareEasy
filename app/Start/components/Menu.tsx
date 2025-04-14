import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function Menu() {
  const router = useRouter();
  const handleBack = () => {
    // Add logic for opening the menu (e.g., navigate to a menu screen or toggle a drawer)
    router.push('../Home'); 
  };
  return (
    <ScrollView
      className="flex-1 bg-[#0f1c2e] px-6 pt-12"
      contentContainerStyle={{ paddingBottom: 20 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between mb-6">
        <Feather name="arrow-left" size={24} color="white" onPress={handleBack}/>
        <Text className="text-white text-lg font-semibold">My Profile</Text>
        <Feather name="settings" size={24} color="white" />
      </View>

      {/* Profile Info */}
      <View className="items-center mb-8">
        <Image
          source={require('../../../assets/avatar-boy.png')} // Replace with your image
          className="w-16 h-16 rounded-full mb-3"
        />
        <Text className="text-white text-lg font-semibold">Richard Kyle Gonzales</Text>
        <Text className="text-gray-400 text-sm">rk.gonzales@gmail.com</Text>
      </View>

      {/* Option List */}
      <View className="space-y-4">
        <Option
          icon="lock"
          label="Edit Profile"
          handlePress={() => router.push('./Editprofile')} // Navigate to Edit Profile
        />
        <Option icon="edit" label="Change Password" 
        handlePress={() => router.push('./Changepassword')}/>
        <Option icon="info" label="App Information" 
          handlePress={() => router.push('./Appinformation')}/>
        <Option icon="calendar" label="Transit Record" />
        <Option icon="log-out" label="Log out" 
         handlePress={() => router.push('../Login')}/>
      </View>
    </ScrollView>
  );
}

const Option = ({
  icon,
  label,
  handlePress,
}: {
  icon: any;
  label: string;
  handlePress?: () => void;
}) => (
  <TouchableOpacity
    className="flex-row items-center justify-between bg-[#1a2a3d] rounded-xl px-4 py-4"
    onPress={handlePress}
  >
    <View className="flex-row items-center space-x-3">
      <Feather name={icon} size={20} color="white" />
      <Text className="text-white text-base">{label}</Text>
    </View>
    <Feather name="chevron-right" size={20} color="white" />
  </TouchableOpacity>
);