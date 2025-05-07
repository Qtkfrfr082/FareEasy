import React, { useEffect } from 'react';
import { Text, StyleSheet, Animated, Image ,StatusBar, View} from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

interface SplashScreenProps {
    onFinish: () => void;
}

const SplashScreenComponent: React.FC<SplashScreenProps> = ({ onFinish }) => {
    const slideAnim = new Animated.Value(50); // Start below the screen

    useEffect(() => {
        const hideSplash = async () => {
            await SplashScreen.preventAutoHideAsync();
            

            Animated.spring(slideAnim, {
                toValue: 0, // Slide to its original position
                friction: 5, // Add bounce effect
                useNativeDriver: true,
            }).start(() => {
                // Wait for 5 seconds before calling onFinish
                setTimeout(() => {
                    onFinish();
                }, 5000);
            });
        };

        hideSplash();
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent  />
            <Animated.Image
                source={require('../assets/FareEasy-Logo.png')}
                style={[styles.logo, { transform: [{ translateY: slideAnim }] }]}
            />
            <Animated.Text style={[styles.text, { transform: [{ translateY: slideAnim }] }]}>
                Welcome to MyApp!
            </Animated.Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#111827',
    },
    logo: {
        width: 150,
        height: 150,
        marginBottom: 20,
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
});

export default SplashScreenComponent;