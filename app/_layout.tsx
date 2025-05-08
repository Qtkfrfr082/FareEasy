// _layout.tsx
import '../global.css';
import React, { useState } from 'react';
import { Stack } from 'expo-router';
import SplashScreenComponent from './Splash'; // Adjust the path if necessary

const RootLayout = () => {
    const [isSplashVisible, setSplashVisible] = useState(true);

    const handleSplashFinish = () => {
        setSplashVisible(false); // Hide the splash screen
    };

    return (
        <>
            {isSplashVisible ? (
                <SplashScreenComponent onFinish={handleSplashFinish} />
            ) : (
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="Login" />
                    <Stack.Screen name="Signup" />
                    <Stack.Screen name="Home" />
                    <Stack.Screen name="ChooseLocation"/>
                    <Stack.Screen name="Editprofile" />
                    <Stack.Screen name="Menu" />
                    <Stack.Screen name="Changepassword" />
                    <Stack.Screen name="RouteMap" />
                </Stack>
            )}
        </>
    );
};

export default RootLayout;