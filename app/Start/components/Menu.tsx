import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StatusBar,Image,ScrollView, Alert } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Menu() {
  const router = useRouter();
  const [fontsLoaded] = useFonts({
      'Inter-Bold': require('../../../assets/fonts/Inter_18pt-Bold.ttf'), // Replace with your font path
      'Inter-Regular': require('../../../assets/fonts/Inter_18pt-Regular.ttf'), // Replace with your font path
    });
  
    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const fetchUserInfo = async () => {
      const userId = await AsyncStorage.getItem('user_id');
      if (!userId) return;
      try {
        const res = await fetch(`https://donewithit-yk99.onrender.com/get-user?user_id=${userId}`);
        const data = await res.json();
        if (res.ok && data.user) {
          setUserName(data.user.name || '');
          setUserEmail(data.user.email || '');
        }
      } catch (e) {
        Alert.alert('Error', 'Failed to fetch user info.');
      }
    };
    fetchUserInfo();
  }, []);
    if (!fontsLoaded) {
      return null; // Render nothing until the font is loaded
    }
  
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
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent  />
      {/* Header */}
      <View className="flex-row items-center justify-center mb-6" style={{ position: 'relative' }}>
  <TouchableOpacity
    style={{ position: 'absolute', left: 0 }}
    onPress={() => router.back()}
  >
    <Ionicons name="chevron-back" size={24} color="white" />
  </TouchableOpacity>
  <Text
    style={{
      color: 'white',
      fontSize: 24,
      fontFamily: 'Inter-Bold',
      marginBottom: 8,
      alignSelf: 'center',
    }}
  >
    My Profile
  </Text>
</View>

      {/* Profile Info */}
      <View className="items-center mb-8">
        <Image
          source={require('../../../assets/avatar-boy.png')} // Replace with your image
          className="w-32 h-32 rounded-full mb-3"
        />
     <Text style={{ color: 'white', fontSize: 16, fontFamily: 'Inter-Regular' }}>{userName}</Text>
        <Text style={{ color: 'gray', fontSize: 12, fontFamily: 'Inter-Regular' }}>{userEmail}</Text>
      </View>

      {/* Option List */}
      <View className="space-y-8">
        <Option
          icon="lock"
          label="Edit Profile"
          
          handlePress={() => router.push('./Editprofile')} // Navigate to Edit Profile
        />
        <Option icon="edit" label="Change Password" 
        handlePress={() => router.push('./Changepassword')}/>
        <Option icon="info" label="App Information" 
          handlePress={() => router.push('./Appinformation')}/>
        <Option icon="calendar" label="Transit Record" 
        handlePress={() => router.push('./TransitRecord')}/>
        <Option icon="heart" label="Favorite Routes" 
        handlePress={() => router.push('./favorite')}/>
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
    className="flex-row items-center justify-between bg-[#1a2a3d] rounded-xl px-4 py-4 mb-4" // Added mb-4 for spacing
    onPress={handlePress}
  >
    <View className="flex-row items-center space-x-3">
      <Feather name={icon} size={20} color="white"  />
      <Text style={{ color: 'white', fontSize: 16, fontFamily: 'Inter-Regular', marginLeft: 5}}>{label}</Text>
    </View>
    <Feather name="chevron-right" size={20} color="white" />
  </TouchableOpacity>
);