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
                    <Stack.Screen name="Start/Login" />
                    <Stack.Screen name="Start/Signup" />
                    <Stack.Screen name="Start/Home" />
                    <Stack.Screen name="Start/ChooseLocation" />
                    <Stack.Screen name="Start/components/Changepassword" />
                    <Stack.Screen name="Start/components/Editprofile" />
                    <Stack.Screen name="Start/components/Menu" />
                    <Stack.Screen name="Start/components/RoutesMap" />
                    <Stack.Screen name="Start/components/favorite" />
                </Stack>
            )}
       
      </GestureHandlerRootView>
    );
};

export default RootLayout;