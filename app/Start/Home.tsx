import React, { useRef } from 'react';
import { Text, View, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const App = () => {
  const router = useRouter();
  const mapRef = useRef(null);

  const handleChooseLoc = () => {
    router.push('./ChooseLocation');
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
        <Text style={styles.headerText}>Fare Easy</Text>
        <TouchableOpacity>
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
        />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TouchableOpacity style={styles.searchBox} onPress={handleChooseLoc}>
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
    backgroundColor: '#1E2029',
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
    fontSize: 26,
    fontWeight: 'bold',
  },
  menuIcon: {
    width: 30,
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
    backgroundColor: '#2A2D3A',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    width: '80%',
  },
  searchText: {
    color: 'white',
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