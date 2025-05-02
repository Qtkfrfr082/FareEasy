import React, { useState } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  TouchableOpacity, 
  TextInput, 
  StyleSheet, 
  StatusBar,
  FlatList,
  ScrollView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter} from 'expo-router';
interface HistoryItem {
  id: string;
  name: string;
  address: string;
}

const RouteScreen = () => {
  const router = useRouter();
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [passengerType, setPassengerType] = useState('Select Passenger Type');
  
  const handleBack = () => {
    router.push('./Home'); 
  };
  // History data
  const historyData: HistoryItem[] = [
    {
      id: '1',
      name: 'SM City Marilao',
      address: 'MacArthur Highway, Maril...'
    },
    {
      id: '2',
      name: 'Kariktan ng Meycauayan',
      address: 'Q2F5+R9C, Meycauayan, B...'
    },
    {
      id: '3',
      name: 'Valenzuela City People\'s Park',
      address: 'MacArthur Highway, Valenz...'
    },
    {
      id: '4',
      name: 'Balagtas Town Center',
      address: 'MacArthur Highway, Balagt...'
    },
    {
      id: '5',
      name: 'Philippine Arena',
      address: 'Bocaue Road, Santa Maria, B...'
    }
  ];

  const renderHistoryItem = ({ item }: { item: HistoryItem }) => (
    <View>
      <View style={styles.historyItem}>
        <View style={styles.historyContent}>
          <View style={styles.iconContainer}>
            <Ionicons name="time-outline" size={20} color="#FFF" />
          </View>
          <View style={styles.historyTextContainer}>
            <Text style={styles.historyTitle}>{item.name}</Text>
            <Text style={styles.historyAddress}>{item.address}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
      <View style={styles.divider} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
    <StatusBar barStyle="light-content" backgroundColor="transparent" translucent  />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fare Easy</Text>
        <View style={styles.placeholder} />
      </View>
      
      {/* Route Planning Section */}
      <View style={styles.routeSection}>
        {/* Origin Input */}
        <View style={styles.inputRow}>
          <View style={styles.locationMarker}>
            <View style={styles.originMarker} />
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Your location"
              placeholderTextColor="#8E8E93"
              value={origin}
              onChangeText={setOrigin}
            />
          </View>
        </View>
        
        {/* Destination Input */}
        <View style={styles.inputRow}>
          <View style={styles.locationMarker}>
            <View style={styles.destinationMarker} />
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Choose destination"
              placeholderTextColor="#8E8E93"
              value={destination}
              onChangeText={setDestination}
            />
          </View>
        </View>
        
        {/* Transportation Mode Button */}
        <View style={styles.inputRow}>
          <View style={styles.locationMarker}>
            <Ionicons name="car-outline" size={20} color="#FFF" />
          </View>
          <TouchableOpacity style={styles.transportButton}>
            <Text style={styles.transportButtonText}>Transportation Mode</Text>
          </TouchableOpacity>
        </View>
        
        {/* Passenger Type Dropdown */}
        <TouchableOpacity style={styles.dropdownButton}>
          <Text style={styles.dropdownText}>{passengerType}</Text>
          <Ionicons name="chevron-down" size={20} color="#333" />
        </TouchableOpacity>
      </View>
      
      {/* Pin Location Button */}
      <TouchableOpacity style={styles.pinLocationButton}>
        <View style={styles.pinMarkerContainer}>
          <View style={styles.pinMarker} />
        </View>
        <Text style={styles.pinLocationText}>Pin location o Map</Text>
      </TouchableOpacity>
      
      {/* History Section */}
      <View style={styles.historySection}>
        <Text style={styles.historyHeader}>History</Text>
        <FlatList
          data={historyData}
          renderItem={renderHistoryItem}
          keyExtractor={item => item.id}
          scrollEnabled={false}
        />
      </View>
      
      {/* Bottom Indicator */}
      
    </SafeAreaView>
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
    backgroundColor: '#7B86F4',
  },
  destinationMarker: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FF4D4D',
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
    color: 'white',
    fontSize: 16,
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
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginTop: 6,
  },
  dropdownText: {
    color: '#333',
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
    backgroundColor: '#1E2029',
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
    fontSize: 14,
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
});

export default RouteScreen;