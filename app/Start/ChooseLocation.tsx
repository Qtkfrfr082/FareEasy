import React, { useState, useRef} from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  TouchableOpacity, 
  TextInput, 
  StyleSheet, 
  StatusBar,
  FlatList,
  ScrollView,
  Alert,
  
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons , MaterialCommunityIcons} from '@expo/vector-icons';
import { useRouter, useLocalSearchParams} from 'expo-router';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
interface HistoryItem {
 id: string;
  name: string;
  address: string;
  originCoords: { lat: number; lng: number };
  destinationCoords?: { lat: number; lng: number };
}
const GOOGLE_MAPS_APIKEY = 'AIzaSyDh3IwX1o3v0Ud_YZJUtM_29LIetafzQAY'; // Replace with your API key
const RouteScreen = () => {
  const router = useRouter();
  const [origin, setOrigin] = useState<any | null>(null); // Replace 'any' with the correct type if available
  const [destination, setDestination] = useState<any | null>(null); // Use a better type if available
  const params = useLocalSearchParams();
  const originData = params.originData ? JSON.parse(params.originData as string) : null;
  const originRef = useRef<any>(null);
  const destinationRef = useRef<any>(null);
  const hasSetOriginRef = useRef(false);
  const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
  const ITEMS_PER_PAGE = 5;
  const [currentPage, setCurrentPage] = useState(1);


  const [passengerType, setPassengerType] = useState('Regular');
  const [showDropdown, setShowDropdown] = useState(false);

  const passengerOptions = ['Student', 'PWD', 'Senior Citizen', 'Regular'];
  React.useEffect(() => {
  AsyncStorage.getItem('recentHistory').then(data => {
    if (data) setHistoryData(JSON.parse(data));
  });
}, []);

// Save history to AsyncStorage whenever it changes
React.useEffect(() => {
  AsyncStorage.setItem('recentHistory', JSON.stringify(historyData));
}, [historyData]);
React.useEffect(() => {
    if (historyData.length === 0) return;
    fetch('https://donewithit-yk99.onrender.com/recent-searches', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ recent: historyData }),
    })
      .then(async response => {
      if (!response.ok) {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Failed to send recent searches.');
        return;
      }
      const data = await response.json();
      // Optionally show a success message or handle the response
      // Alert.alert('Success', data.message || 'Recent searches sent.');
    })
    .catch(error => {
      Alert.alert('Network Error', 'Could not connect to the server. Please try again later.');
      // Optionally log the error: console.error('Error sending recent searches:', error);
    });
}, [historyData]);

React.useEffect(() => {
  if (originData && !hasSetOriginRef.current) {
    setOrigin(originData);
    const addressText =
      originData.formatted_address ||
      originData.name ||
      (originData.vicinity ? originData.vicinity : '') ||
      '';
    if (originRef.current && addressText) {
      originRef.current.setAddressText(addressText);
      hasSetOriginRef.current = true; // Prevent future updates
    }
  }
}, [originData]);

const handleApply = () => {
  if (!origin || !destination) {
    Alert.alert('Please select both origin and destination.');
    return;
  }

  // Extract coordinates for origin
  const lat = origin.geometry?.location?.lat;
  const lng = origin.geometry?.location?.lng;

  // Get a readable origin label
  let originLabel = origin.name || origin.formatted_address || origin.vicinity || '';
  let originCoords = null;
  if (!originLabel && origin.geometry?.location) {
    originCoords = {
      lat: origin.geometry.location.lat,
      lng: origin.geometry.location.lng,
    };
    originLabel = '';
  }

  // Extract only needed fields for destination
  let destinationLabel = '';
  let destinationCoords = null;
  if (typeof destination === 'object' && destination !== null) {
    destinationLabel = destination.formatted_address || destination.name || destination.vicinity || '';
    if (destination.geometry?.location) {
      destinationCoords = {
        lat: destination.geometry.location.lat,
        lng: destination.geometry.location.lng,
      };
    }
  } else if (typeof destination === 'string') {
    destinationLabel = destination;
  }

  setHistoryData(prev => {
  const newItem = {
    id: Date.now().toString(),
    name: originLabel,
    address: destinationLabel,
    originCoords: {
      lat,
      lng,
    },
    ...(destinationCoords && { destinationCoords }),
  };
  // Remove duplicates
  const filtered = prev.filter(
    item =>
      item.name !== newItem.name ||
      item.address !== newItem.address
  );
  return [newItem, ...filtered].slice(0, 10); // Keep only latest 10
});

  router.push({
    pathname: './components/RoutesMap',
    params: {
      origin: `${lat},${lng}`,
      destination: JSON.stringify({
        label: destinationLabel,
        ...(destinationCoords && { coords: destinationCoords }),
      }),
      passengerType,
    },
  });
};
  const handleBack = () => {
    router.push('./Home'); 
  };
  
  
// import { MaterialCommunityIcons } from '@expo/vector-icons';
<MaterialCommunityIcons name="map-marker" size={22} color="#7B86F4" />
  const renderHistoryItem = ({ item }: { item: HistoryItem }) => (
  <TouchableOpacity
    onPress={() => {
  if (originRef.current) {
    originRef.current.setAddressText(item.name);
  }
  if (destinationRef.current) {
    destinationRef.current.setAddressText(item.address);
  }
  setOrigin({
    name: item.name,
    geometry: { location: { lat: item.originCoords.lat, lng: item.originCoords.lng } }
  });
  setDestination({
    name: item.address,
    geometry: item.destinationCoords
      ? { location: { lat: item.destinationCoords.lat, lng: item.destinationCoords.lng } }
      : undefined
  });
}}
    activeOpacity={0.7}
  >
    <View style={styles.historyItem}>
      <View style={styles.historyContent}>
        <View style={styles.iconContainer}>
          <Ionicons name="time-outline" size={20} color="#FFF" />
        </View>
        <View style={styles.historyTextContainer}>
          <Text style={styles.historyTitle}>
            {item.name}
          </Text>
          <Text style={{ color: '#8E8E93', fontWeight: 'bold' }}>  To  </Text>
          <Text style={styles.historyAddress}>
            {item.address}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => {
          setHistoryData(prev => prev.filter(h => h.id !== item.id));
        }}
      >
        <Ionicons name="trash-outline" size={20} color="#FFF" />
      </TouchableOpacity>
    </View>
    <View style={styles.divider} />
  </TouchableOpacity>
);

  return (
    <SafeAreaView style={styles.container}>
    <StatusBar barStyle="light-content" backgroundColor="transparent" translucent  />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>FareEasy</Text>
        <View style={styles.placeholder} />
      </View>
      
      {/* Route Planning Section */}
      {/* Google Places Autocomplete for Origin */}
      <View style={styles.inputRow}>
        <View style={styles.locationMarker}>
         <Ionicons name="locate" size={28} color="#7B86F4" />
        </View>
        <GooglePlacesAutocomplete
  ref={originRef}
  placeholder="Your location"
  onPress={(data, details = null) => {
    setOrigin(details); // Save origin details
  }}
  query={{
    key: GOOGLE_MAPS_APIKEY,
    language: 'en',
  }}
  fetchDetails={true}
  enablePoweredByContainer={false}
  styles={{
    container: {
      flex: 1,
    },
    textInput: {
      backgroundColor: '#2A2D3A',
      color: 'white',
      borderRadius: 8,
      paddingHorizontal: 16,
      fontSize: 16,
      height: 40,
    },
    listView: {
      backgroundColor: '#272935',
      borderRadius: 8,
      position: 'absolute',
      top: 40,
      left: 0,
      right: 0,
      zIndex: 100,
    },
    row: {
      backgroundColor: '#272935',
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#333',
    },
    description: {
      color: 'white',
    },
    predefinedPlacesDescription: {
      color: '#7B86F4',
    },
  }}
/>
      </View>

      {/* Google Places Autocomplete for Destination */}
      <View style={styles.inputRow}>
        <View style={styles.locationMarker}>
         <MaterialCommunityIcons name="map-marker" size={22} color="#FF4D4D" />
        </View>
        <GooglePlacesAutocomplete
          ref={destinationRef}
          placeholder="Choose destination"
          onPress={(data, details = null) => {
            setDestination(details); // Save destination details as an object
          }}
          query={{
            key: GOOGLE_MAPS_APIKEY,
            language: 'en',
          }}
          fetchDetails={true}
          enablePoweredByContainer={false}
          styles={{
    container: {
      flex: 1,
    },
    textInput: {
      backgroundColor: '#2A2D3A',
      color: 'white',
      borderRadius: 8,
      paddingHorizontal: 16,
      fontSize: 16,
      height: 40,
    },
    listView: {
      backgroundColor: '#272935',
      borderRadius: 8,
      position: 'absolute',
      top: 40,
      left: 0,
      right: 0,
      zIndex: 100,
    },
    row: {
      backgroundColor: '#272935',
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#333',
    },
    description: {
      color: 'white',
    },
    predefinedPlacesDescription: {
      color: '#7B86F4',
    },
  }}
        />
      </View>
        
       
        {/* Passenger Type Dropdown */}
        <View style={{ position: 'relative', marginTop: 6 }}>
  <TouchableOpacity
    style={styles.dropdownButton}
    onPress={() => setShowDropdown(!showDropdown)}
  >
    <Text style={styles.dropdownText}>{passengerType}</Text>
    <Ionicons name="chevron-down" size={20} color="#333" />
  </TouchableOpacity>
  {showDropdown && (
    <View style={styles.dropdownMenu}>
      {passengerOptions.map(option => (
        <TouchableOpacity
          key={option}
          style={styles.dropdownItem}
          onPress={() => {
            setPassengerType(option);
            setShowDropdown(false);
          }}
        >
          <Text style={styles.dropdownText}>{option}</Text>
        </TouchableOpacity>
      ))}
    </View>
  )}
</View>
   
      {/* Apply Button */}
  <TouchableOpacity
    className="bg-cyan-500"
    style={styles.applyButton}
    onPress={handleApply}
  >
    <Text style={styles.applyButtonText}>Apply</Text>
  </TouchableOpacity>

     
     

      {/* History Section */}
      <View style={styles.historySection}>
       <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16 }}>
  <Text style={styles.historyHeader}>Recent</Text>
  {historyData.length > 0 && (
    <TouchableOpacity
     
      onPress={() => {
        Alert.alert(
          'Clear Recent Searches',
          'Are you sure you want to clear all recent searches?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Clear', style: 'destructive', onPress: () => setHistoryData([]) },
          ]
        );
      }}
      style={{ padding: 8 }}
    >
      <Ionicons name="trash-outline" size={22} color="#FF4D4D" />
    </TouchableOpacity>
  )}
</View>
        <FlatList
          data={historyData}
          renderItem={renderHistoryItem}
          keyExtractor={item => item.id}
          scrollEnabled={true}
        />
      </View>
      
      {/* Bottom Indicator */}
      
    </SafeAreaView>
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
  
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 24,
  },
  routeSection: {
    padding: 16,
    backgroundColor: '#272935',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginHorizontal: 16, 
  },
  locationMarker: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  originMarker: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#7B86F4', // Blue marker for origin
  },
  destinationMarker: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FF4D4D', // Red marker for destination
  },
  inputContainer: {
    flex: 1,
    height: 40,
    backgroundColor: '#1E2029',
    borderRadius: 20,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  input: {
    backgroundColor: '#2A2D3A',
    color: 'white',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    height: 40,
  },
  transportButton: {
    flex: 1,
    height: 40,
    backgroundColor: '#2048F3',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transportButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dropdownButton: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: 'gray',
  borderRadius: 8,
  padding: 16,
  marginHorizontal: 16,
  marginTop: 6,
  position: 'relative', // <-- Add this
},
  dropdownText: {
    color: 'white',
    fontSize: 16,
  },
  pinLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#272935',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  pinMarkerContainer: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  pinMarker: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FF4D4D',
  },
  pinLocationText: {
    color: 'white',
    fontSize: 16,
  },
  historySection: {
    flex: 1,
   
  },
  historyHeader: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    padding: 16,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  historyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#454756',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  historyTextContainer: {
    flex: 1,
  },
  historyTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  historyAddress: {
    color: '#8E8E93',
    fontSize: 16,
    fontWeight: '500',
  },
  deleteButton: {
    padding: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#333',
    marginLeft: 58,
  },
  bottomIndicator: {
    width: 120,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    alignSelf: 'center',
    marginVertical: 8,
  },
  applyButton: {
    margin: 16,
    padding: 16,
   
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  autocompleteContainer: {
    marginTop: 20,
    position: 'absolute', 
    marginHorizontal: 16,
    
   
  },
  dropdownMenu: {
  backgroundColor: '#272935',
  borderRadius: 8,
  marginHorizontal: 0, 
  marginTop: 2,
  position: 'absolute', 
  top: '100%',          
  left: 0,
  right: 0,
  zIndex: 100,          
},
dropdownItem: {
  padding: 14,
  borderBottomWidth: 1,
  borderBottomColor: '#333',
},
  
});

export default RouteScreen;