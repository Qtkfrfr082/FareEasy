import React from 'react';
import { View, Text, StatusBar, TouchableOpacity, SafeAreaView, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import { Modal, Pressable } from 'react-native';


export default function AppInformationScreen() {
  const [modalVisible, setModalVisible] = React.useState(false);
  const [modalContent, setModalContent] = React.useState('');
  const [modalTitle, setModalTitle] = React.useState('');
    const router = useRouter();
    const handleBack = () => {
        // Add logic for opening the menu (e.g., navigate to a menu screen or toggle a drawer)
        router.push('./Menu'); 
      };
      const [fontsLoaded] = useFonts({
              'Inter-Bold': require('../../../assets/fonts/Inter_18pt-Bold.ttf'), // Replace with your font path
              'Inter-Regular': require('../../../assets/fonts/Inter_18pt-Regular.ttf'), // Replace with your font path
            });
          
            if (!fontsLoaded) {
              return null; // Render nothing until the font is loaded
            }
           
  return (
    <SafeAreaView className="flex-1 bg-[#0f1c2e]">
    <StatusBar barStyle="light-content" backgroundColor="transparent" translucent  />
       <Modal
  visible={modalVisible}
  transparent
  animationType="fade"
  onRequestClose={() => setModalVisible(false)}
>
  <View style={{
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  }}>
    <View style={{
      backgroundColor: '#22223b',
      borderRadius: 16,
      padding: 28,
      alignItems: 'center',
      minWidth: 300,
      maxWidth: '90%'
    }}>
      <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' }}>
        {modalTitle}
      </Text>
      <Text style={{ color: '#fff', fontSize: 15, marginBottom: 18, textAlign: 'center' }}>
        {modalContent}
      </Text>
      <Pressable
        style={{
          backgroundColor: '#06B6D4',
          borderRadius: 8,
          paddingVertical: 8,
          paddingHorizontal: 28,
          marginTop: 8
        }}
        onPress={() => setModalVisible(false)}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Close</Text>
      </Pressable>
    </View>
  </View>
</Modal>
      <View className="flex-1 px-5 pt-10">
        {/* Header with back button */}
        <View className="flex-row items-center mb-6">
          <TouchableOpacity className="mr-4">
            <Ionicons name="chevron-back" size={24} color="white" onPress={() => router.back()}/>
          </TouchableOpacity>
          <Text style={{ color: 'white', fontSize: 24, fontFamily: 'Inter-Bold'}}>App Information</Text>
        </View>
        
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
  {/* App Logo */}
  <View className="items-center justify-center my-6">
    <View className="w-24 h-24 bg-gray-800 rounded-3xl items-center justify-center mb-3">
     <Image
  source={require('../../../assets/FareEasy-Logo.png')}
  style={{ width: 70, height: 70, borderRadius: 20 }}
/>
    </View>
    <Text style={{ color: 'white', fontSize: 16, fontFamily: 'Inter-Bold' }}>FareEasy</Text>
    <Text style={{ color: 'gray', fontSize: 11, fontFamily: 'Inter-Regular' }}>Version 3.4.1</Text>
  </View>

  {/* App Details Section */}
  <View className="mb-6">
    <Text className="mb-4" style={{ color: 'white', fontSize: 16, fontFamily: 'Inter-Bold' }}>Details</Text>
    <View className="bg-gray-800 rounded-lg overflow-hidden">
      <InfoItem label="Latest Update" value="May 27, 2025" />
      <InfoItem label="Compatibility" value="Android 12.0 or later" hasBorder={true} />
      <InfoItem label="Languages" value="English" hasBorder={true} />
      <InfoItem label="Developer" value="Fare Technologies Inc." hasBorder={true} />
      <InfoItem label="Age Rating" value="18+" hasBorder={false} />
    </View>
  </View>

 {/* Release Notes Section */}
<View className="mb-6">
  <Text className="mb-4" style={{ color: 'white', fontSize: 16, fontFamily: 'Inter-Bold' }}>Release Notes</Text>
  <View className="bg-gray-800 rounded-lg p-4">
    <Text className="text-white text-sm leading-5">
      • Favorites: Save, view, and remove your favorite routes for quick access.{'\n'}
      • Paginated History: Transit and favorite history now loads in pages for faster performance.{'\n'}
      • Weather Integration: See live weather status and temperature with icons on the routing map.{'\n'}
      • Slide-in Animations: Recent searches, routes, and fare history now animate smoothly as they appear.{'\n'}
      • Improved Error Handling: Clearer alerts and better feedback for login, network, and backend errors.{'\n'}
      • UI Enhancements: Centered headers, improved modals, and better map visuals.{'\n'}
      • Backend Upgrades: New endpoints for favorites, paginated history, and improved data structure.
    </Text>
  </View>
</View>

{/* What's New Section */}
<View className="mb-6">
  <Text className="mb-4" style={{ color: 'white', fontSize: 16, fontFamily: 'Inter-Bold' }}>What's New</Text>
  <View className="bg-gray-800 rounded-lg p-4">
    <Text className="text-white text-sm leading-5">
      • Paginated fare and favorites history for smooth scrolling{'\n'}
      • Weather icon and temperature shown on the map{'\n'}
      • Slide-in and fade-in animations for all lists{'\n'}
      • Improved login alerts and error messages{'\n'}
      • Enhanced backend support for favorites and recents{'\n'}
      • General performance and stability improvements
    </Text>
  </View>
</View>

  {/* Privacy & Terms Section */}
  {/* Privacy & Terms Section */}
<View className="mb-6">
  <Text className="mb-4" style={{ color: 'white', fontSize: 16, fontFamily: 'Inter-Bold' }}>Privacy & Terms</Text>
  <View className="bg-gray-800 rounded-lg overflow-hidden">
    <LinkItem
      label="Privacy Policy"
      hasBorder={true}
      onPress={() => {
        setModalTitle('Privacy Policy');
        setModalContent('Your privacy is important to us. We do not share your data with third parties. All information is securely stored and used only to improve your experience.');
        setModalVisible(true);
      }}
    />
    <LinkItem
      label="Terms of Service"
      hasBorder={true}
      onPress={() => {
        setModalTitle('Terms of Service');
        setModalContent('By using this app, you agree to our terms of service. Please use the app responsibly and follow all applicable laws.');
        setModalVisible(true);
      }}
    />
    <LinkItem
      label="Data Collection"
      hasBorder={false}
      onPress={() => {
        setModalTitle('Data Collection');
        setModalContent('We collect minimal data necessary for app functionality, such as route history and preferences. No sensitive personal data is collected.');
        setModalVisible(true);
      }}
    />
  </View>
</View>

 {/* Contact & Support */}
<View className="mb-10">
  <Text className="mb-4" style={{ color: 'white', fontSize: 16, fontFamily: 'Inter-Bold' }}>Contact & Support</Text>
  <View className="bg-gray-800 rounded-lg overflow-hidden">
    <LinkItem
      label="Help Center"
      hasBorder={true}
      onPress={() => {
        setModalTitle('Help Center');
        setModalContent('Visit our Help Center for FAQs and guides on using FareEasy. For more assistance, contact support.');
        setModalVisible(true);
      }}
    />
    <LinkItem
      label="Report a Problem"
      hasBorder={true}
      onPress={() => {
        setModalTitle('Report a Problem');
        setModalContent('If you encounter any issues, please let us know. Email support@fareeasy.com or use the in-app feedback form.');
        setModalVisible(true);
      }}
    />
    <LinkItem
      label="Contact Support"
      hasBorder={false}
      onPress={() => {
        setModalTitle('Contact Support');
        setModalContent('For direct support, email support@fareeasy.com or call our hotline at 1-800-FAREEASY.');
        setModalVisible(true);
      }}
    />
  </View>
</View>
</ScrollView>
        
      
      </View>
    </SafeAreaView>
  );
}

// Component for information items with label and value
function InfoItem({ label, value, hasBorder = true }: { label: string; value: string; hasBorder?: boolean }) {
  return (
    <View className={`px-4 py-3 flex-row justify-between items-center ${hasBorder ? 'border-b border-gray-700' : ''}`}>
      <Text className="text-gray-400 text-sm">{label}</Text>
      <Text className="text-white text-sm">{value}</Text>
    </View>
  );
}

// Component for linkable items with chevron
function LinkItem({ label, hasBorder = true, onPress }: { label: string; hasBorder?: boolean; onPress?: () => void }) {
  return (
    <TouchableOpacity 
      className={`px-4 py-4 flex-row justify-between items-center ${hasBorder ? 'border-b border-gray-700' : ''}`}
      onPress={onPress}
    >
      <Text className="text-white text-sm">{label}</Text>
      <Ionicons name="chevron-forward" size={20} color="gray" />
    </TouchableOpacity>
  );
}