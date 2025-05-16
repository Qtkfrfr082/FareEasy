import React, { useRef } from 'react';
import { Text, View, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFonts } from 'expo-font';

const App = () => {
  const router = useRouter();
  const mapRef = useRef<MapView | null>(null);
  const params = useLocalSearchParams();
const startLat = params.startLat ? parseFloat(params.startLat as string) : null;
const startLng = params.startLng ? parseFloat(params.startLng as string) : null;
  const [userLocation, setUserLocation] = React.useState<{ latitude: number; longitude: number } | null>(null);
  const [fontsLoaded] = useFonts({
      'Inter-Bold': require('../../assets/fonts/Inter_18pt-Bold.ttf'), // Replace with your font path
      'Inter-Regular': require('../../assets/fonts/Inter_18pt-Regular.ttf'), // Replace with your font path
    });
  
    if (!fontsLoaded) {
      return null; // Render nothing until the font is loaded
    }

    const handleMyLocation = async () => {
  let { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    alert('Permission to access location was denied');
    return;
  }
  let location = await Location.getCurrentPositionAsync({});
  setUserLocation({
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  });
  if (mapRef.current) {
    mapRef.current.animateToRegion({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  }
};
  const handleMenu = () => {
    router.push('./components/Menu');
  };
  const handleChooseLoc = () => {
  if (userLocation) {
    router.push({
      pathname: './ChooseLocation',
      params: { 
        originData: JSON.stringify({
          formatted_address: 'Current Location',
          geometry: { location: { lat: userLocation.latitude, lng: userLocation.longitude } }
        })
      }
    });
  } else {
    router.push('./ChooseLocation');
  }
};

  const region = {
    latitude: 14.6042,
    longitude: 120.9822,
    latitudeDelta: 0.15,
    longitudeDelta: 0.15,
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}  >FareEasy</Text>
        <TouchableOpacity onPress={handleMenu}>
          <View style={styles.menuIcon}>
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Map Container */}
      <View style={styles.mapContainer}>
<MapView
  ref={mapRef}
  style={styles.map}
  initialRegion={region}
  provider={PROVIDER_GOOGLE}
>
{userLocation && (
  <Marker
    coordinate={userLocation}
    anchor={{ x: 0.5, y: 0.5 }}
  >
    <View
      style={{
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: '#2048F3',
        borderWidth: 3,
        borderColor: '#fff',
      }}
    />
  </Marker>
)}
</MapView>
        <View style={{
  position: 'absolute',
  bottom: 20,
  right: 20,
  zIndex: 10,
}}>
  
  <TouchableOpacity
    onPress={handleMyLocation}
    style={{
      backgroundColor: '#fff',
      borderRadius: 24,
      padding: 12,
      elevation: 4,
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <Ionicons name="locate" size={28} color="#2048F3" />
  </TouchableOpacity>
</View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TouchableOpacity className="bg-cyan-500" style={styles.searchBox} onPress={handleChooseLoc}>
          <Text style={styles.searchText}>Choose Route</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Access Buttons */}
      <View style={styles.quickAccessContainer}>
        <TouchableOpacity style={styles.quickAccessButton} onPress={handleChooseLoc}>
          <View style={styles.iconContainer}>
            <Ionicons name="time-outline" size={16} color="#FFF" />
          </View>
          <Text style={styles.quickAccessText}>SM City Marilao</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickAccessButton}>
          <View style={styles.iconContainer}>
            <Ionicons name="time-outline" size={16} color="#FFF" />
          </View>
          <Text style={styles.quickAccessText}>Kariktan ng Meycauayan</Text>
        </TouchableOpacity>
        
      </View>
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1c2e',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    
    paddingTop: StatusBar.currentHeight || 40, // Dynamically add padding for the status bar
    backgroundColor: '#1E2029',
  },
  headerText: {
    color: 'white',
    fontFamily: 'Inter-Bold',
    fontSize: 26,
    fontWeight: 'bold',
  },
  menuIcon: {
    width: 28,
    height: 22,
    justifyContent: 'space-between',
  },
  menuLine: {
    height: 3,
    backgroundColor: 'white',
    borderRadius: 1,
  },
  mapContainer: {
    flex: 1,
    marginHorizontal: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  searchContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  searchBox: {
   
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    width: '80%',
  },
  searchText: {
    color: 'white',
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    fontWeight: 'bold',
  },
  quickAccessContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  quickAccessButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2D3A',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 10,
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#424452',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  quickAccessText: {
    color: 'white',
    fontSize: 14,
  },
});

export default App;