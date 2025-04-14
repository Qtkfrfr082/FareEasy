import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';


export default function AppInformationScreen() {
    const router = useRouter();
    const handleBack = () => {
        // Add logic for opening the menu (e.g., navigate to a menu screen or toggle a drawer)
        router.push('./Menu'); 
      };
  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <View className="flex-1 px-5 pt-6">
        {/* Header with back button */}
        <View className="flex-row items-center mb-6">
          <TouchableOpacity className="mr-4">
            <Ionicons name="chevron-back" size={24} color="white" onPress={handleBack}/>
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">App Information</Text>
        </View>
        
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* App Logo */}
          <View className="items-center justify-center my-6">
            <View className="w-24 h-24 bg-blue-600 rounded-3xl items-center justify-center mb-3">
              <Ionicons name="bus-outline" size={45} color="white" />
            </View>
            <Text className="text-white text-lg font-bold">Fare Easy</Text>
            <Text className="text-gray-400 text-sm">Version 2.4.1</Text>
          </View>
          
          {/* App Details Section */}
          <View className="mb-6">
            <Text className="text-gray-300 text-base font-medium mb-4">Details</Text>
            
            <View className="bg-gray-800 rounded-lg overflow-hidden">
              <InfoItem 
                label="Latest Update" 
                value="April 10, 2025" 
              />
              <InfoItem 
                label="Size" 
                value="24.5 MB" 
                hasBorder={true}
              />
              <InfoItem 
                label="Compatibility" 
                value="Android 12.0 or later" 
                hasBorder={true}
              />
              <InfoItem 
                label="Languages" 
                value="English" 
                hasBorder={true}
              />
              <InfoItem 
                label="Developer" 
                value="Fare Technologies Inc." 
                hasBorder={true}
              />
              <InfoItem 
                label="Age Rating" 
                value="4+" 
                hasBorder={false}
              />
            </View>
          </View>
          
          {/* What's New Section */}
          <View className="mb-6">
            <Text className="text-gray-300 text-base font-medium mb-4">What's New</Text>
            <View className="bg-gray-800 rounded-lg p-4">
              <Text className="text-white text-sm leading-5">
                • Enhanced map interface with improved traffic visualization
                {'\n'}• Added support for multiple payment methods
                {'\n'}• Fixed bugs related to route calculations
                {'\n'}• Improved accuracy of fare estimates
                {'\n'}• Added dark mode support
              </Text>
            </View>
          </View>
          
          {/* Privacy & Terms Section */}
          <View className="mb-6">
            <Text className="text-gray-300 text-base font-medium mb-4">Privacy & Terms</Text>
            
            <View className="bg-gray-800 rounded-lg overflow-hidden">
              <LinkItem 
                label="Privacy Policy" 
                hasBorder={true}
              />
              <LinkItem 
                label="Terms of Service" 
                hasBorder={true}
              />
              <LinkItem 
                label="Data Collection" 
                hasBorder={false}
              />
            </View>
          </View>
          
          {/* Contact & Support */}
          <View className="mb-10">
            <Text className="text-gray-300 text-base font-medium mb-4">Contact & Support</Text>
            
            <View className="bg-gray-800 rounded-lg overflow-hidden">
              <LinkItem 
                label="Help Center" 
                hasBorder={true}
              />
              <LinkItem 
                label="Report a Problem" 
                hasBorder={true}
              />
              <LinkItem 
                label="Contact Support" 
                hasBorder={false}
              />
            </View>
          </View>
        </ScrollView>
        
        {/* Bottom Indicator */}
        <View className="absolute bottom-8 left-0 right-0 items-center">
          <View className="w-16 h-1 bg-gray-600 rounded-full" />
        </View>
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
function LinkItem({ label, hasBorder = true }: { label: string; hasBorder?: boolean }) {
  return (
    <TouchableOpacity 
      className={`px-4 py-4 flex-row justify-between items-center ${hasBorder ? 'border-b border-gray-700' : ''}`}
    >
      <Text className="text-white text-sm">{label}</Text>
      <Ionicons name="chevron-forward" size={20} color="gray" />
    </TouchableOpacity>
  );
}