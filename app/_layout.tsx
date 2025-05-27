import '../global.css';
import React, { useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import SplashScreenComponent from './Splash'; 
const RootLayout = () => {
    const [isSplashVisible, setSplashVisible] = useState(true);

    const handleSplashFinish = () => {
        setSplashVisible(false); // Hide the splash screen
    };

    return (
        <GestureHandlerRootView>
        
            {isSplashVisible ? (
                <SplashScreenComponent onFinish={handleSplashFinish} />
            ) : (
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="Start/Login"  />
                    <Stack.Screen name="Start/Signup" options={{
            animation: 'slide_from_right',
          }}  />
                    <Stack.Screen name="Start/Home"options={{
            animation: 'slide_from_right',
          }}  />
                    <Stack.Screen name="Start/ChooseLocation"options={{
            animation: 'slide_from_right',
          }}  />
                    <Stack.Screen name="Start/components/Changepassword"options={{
            animation: 'slide_from_right',
          }}  />
                    <Stack.Screen name="Start/components/Editprofile" options={{
            animation: 'slide_from_right',
          }} />
                    <Stack.Screen name="Start/components/Menu"options={{
            animation: 'slide_from_right',
          }}  />
                    <Stack.Screen name="Start/components/RoutesMap"options={{
            animation: 'slide_from_right',
          }}  />
                    <Stack.Screen name="Start/components/favorite"options={{
            animation: 'slide_from_right',
          }}  />
                    <Stack.Screen name="Start/components/TransitRecord"options={{
            animation: 'slide_from_right',
          }}  />
                    <Stack.Screen name="Start/components/Appinformation"options={{
            animation: 'slide_from_right',
          }}  />
                    <Stack.Screen name="Start/components/Routing"options={{
            animation: 'slide_from_right',
          }}  />
                </Stack>
                   
               
            )}
       
      </GestureHandlerRootView>
    );
};

export default RootLayout;