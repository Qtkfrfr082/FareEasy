import React, { useEffect, useState,useRef } from 'react';
import {
  View,
  Text,
  StatusBar,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Alert,
  Switch
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

import axios from 'axios';

const { width } = Dimensions.get('window');
const GOOGLE_MAPS_APIKEY = 'AIzaSyDh3IwX1o3v0Ud_YZJUtM_29LIetafzQAY';

// Fare matrix (example, adjust as needed)


const VEHICLE_ICONS = {
  BUS: <MaterialCommunityIcons name="bus" size={28} color="#2048F3" />,
  TRICYCLE: <MaterialCommunityIcons name="motorbike" size={28} color="#2048F3" />,
  TAXI: <FontAwesome5 name="taxi" size={28} color="#2048F3" />,
  JEEP: <MaterialCommunityIcons name="jeepney" size={28} color="#2048F3" />,
  WALK: <Ionicons name="walk" size={28} color="#2048F3" />,
  LRT: <MaterialCommunityIcons name="train" size={28} color="#2048F3" />,
  MRT: <MaterialCommunityIcons name="train-variant" size={28} color="#2048F3" />,
  EDSA_Carousel: <MaterialCommunityIcons name="bus-side" size={28} color="#2048F3" />,
};

export default function RideWise() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const passengerType = Array.isArray(params.passengerType)
    ? params.passengerType[0]
    : params.passengerType || 'Regular';
  const [busToJeepSelections, setBusToJeepSelections] = useState<{ [key: number]: 'BUS' | 'JEEP' }>({});
  const [walkGroupSelections, setWalkGroupSelections] = useState<{ [key: number]: 'WALK' | 'TRICYCLE' }>({});
  const routeData = params.routeData ? JSON.parse(params.routeData as string) : null;
  // Set your origin and destination here
  
const mapRef = useRef<MapView>(null);
 const [fareMatrix, setFareMatrix] = useState({
  LRT_BASE: 15,        // Base fare for 1-3 stations
  LRT_EXTRA: 1,        // Per additional station

  MRT_BASE: 13,        // Base fare for 1-3 stations
  MRT_EXTRA: 1,        // Per additional station

  EDSA_Carousel: 15,           // MRT/LRT base fare starts around ₱15
  BUS_BASE: 13,           // City bus base fare for 5 km
  BUS_EXTRA: 2.2,        // Per km after 5 km
  TRICYCLE_BASE: 12,      // Base fare for 1 km
  TRICYCLE_EXTRA: 2,      // Per km after 1 km
  TAXI_BASE: 45,          // Base fare includes 500m
  TAXI_EXTRA: 13.5,       // Every additional km
  JEEP_BASE: 13,          // Base fare for first 4 km
  JEEP_EXTRA: 2,          // Every additional km after 4 km
  WALK: 0,
});

// Editable fare calculation functions
type VehicleType = 'LRT' | 'MRT' | 'EDSA_Carousel' | 'BUS' | 'TRICYCLE' | 'TAXI' | 'JEEP' | 'WALK';

type FareMatrixType = {
  LRT: (stations: number) => number;
  MRT: (stations: number) => number;
  EDSA_Carousel: (distance: number, step?: any) => number;
  BUS: (distance: number) => number;
  TRICYCLE: (distance: number) => number;
  TAXI: (distance: number) => number;
  JEEP: (distance: number) => number;
  WALK: () => number;
};

const FARE_MATRIX: FareMatrixType = {
  LRT: (stations: number) =>
    fareMatrix.LRT_BASE + Math.max(0, stations - 3) * fareMatrix.LRT_EXTRA,

  MRT: (stations: number) =>
    fareMatrix.MRT_BASE + Math.max(0, stations - 3) * fareMatrix.MRT_EXTRA,

   EDSA_Carousel: (distance: number, step?: any) => {
    let fare = 15 + Math.max(0, distance - 4) * 2.65;
    // Try to detect direction from step (if available)
    let maxFare = 75.5; // Default to southbound
    if (step && step.transit_details?.departure_stop?.name && step.transit_details?.arrival_stop?.name) {
      const dep = step.transit_details.departure_stop.name.toLowerCase();
      const arr = step.transit_details.arrival_stop.name.toLowerCase();
      if (dep.includes('pitx') || arr.includes('pitx')) {
        // If PITX is involved, check direction
        if (dep.includes('pitx')) maxFare = 73.0; // Northbound
        else if (arr.includes('pitx')) maxFare = 75.5; // Southbound
      }
    }
    return Math.min(fare, maxFare);
  },

  BUS: (distance: number) =>
    fareMatrix.BUS_BASE + Math.max(0, distance - 0) * fareMatrix.BUS_EXTRA,

  TRICYCLE: (distance: number) =>
    fareMatrix.TRICYCLE_BASE + Math.max(0, distance - 1) * fareMatrix.TRICYCLE_EXTRA,

  TAXI: (distance: number) =>
    fareMatrix.TAXI_BASE + Math.max(0, distance - 0.5) * fareMatrix.TAXI_EXTRA,

  JEEP: (distance: number) =>
    fareMatrix.JEEP_BASE + Math.max(0, distance - 4) * fareMatrix.JEEP_EXTRA,

  WALK: () => 0,
};

// Helper to get vehicle type from step
const getVehicleType = (step: any): VehicleType => {
  if (step.travel_mode === 'WALKING') return 'WALK';

  if (step.travel_mode === 'TRANSIT') {
    const vehicle = step.transit_details?.line?.vehicle;
    const name = vehicle?.name?.toLowerCase() || '';
    const type = vehicle?.type?.toUpperCase() || '';
    const lineShortName = step.transit_details?.line?.short_name?.toLowerCase() || '';
    const lineName = step.transit_details?.line?.name?.toLowerCase() || '';

    // Robust EDSA Carousel detection
    if (
      type === 'BUS' &&
      (lineShortName.includes('edsa carousel') || lineName.includes('edsa carousel'))
    ) {
      return 'EDSA_Carousel';
    }
    // Fallback: if EDSA Carousel is in line name but type is not BUS (rare)
    if (lineShortName.includes('edsa carousel') || lineName.includes('edsa carousel')) return 'EDSA_Carousel';

    if (type === 'BUS') return 'BUS';
    if (type === 'JEEPNEY' || name.includes('jeep')) return 'JEEP';
    if (type === 'TAXI' || name.includes('taxi')) return 'TAXI';
    if (name.includes('tricycle')) return 'TRICYCLE';
    if (name.includes('lrt') || lineName.includes('lrt')) return 'LRT';
    if (name.includes('mrt') || lineName.includes('mrt')) return 'MRT';

    // fallback to BUS if no specific match
    return 'BUS';
  }

  return 'WALK';
};
function parseDistance(text: string): number {
  if (!text) return 0;
  if (text.includes('km')) return parseFloat(text.replace(' km', '').trim());
  if (text.includes('m')) return parseFloat(text.replace(' m', '').trim()) / 1000;
  return 0;
}
// Helper to get fare for a step
const getFare = (step: any, idx?: number) => {
  let vehicleType = getVehicleType(step);
  if (
    typeof idx === 'number' &&
    (vehicleType === 'BUS' || vehicleType === 'JEEP')
  ) {
    vehicleType = busToJeepSelections[idx] || vehicleType;
  }
  const distance = parseDistance(step.distance?.text || '0');
  if (vehicleType === 'WALK') return 0;
  if (step.transit_details?.fare?.value) return step.transit_details.fare.value;
  if (vehicleType === 'EDSA_Carousel') {
    return FARE_MATRIX.EDSA_Carousel(distance, step);
  }
  return FARE_MATRIX[vehicleType as VehicleType](distance);
};

  

  if (!routeData) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0f1c2e', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'white' }}>No route data available.</Text>
      </SafeAreaView>
    );
  }

  const leg = routeData.legs[0];
  const steps = leg.steps || [];
  // Extract origin and destination coordinates
  const origin = {
    latitude: leg.start_location.lat,
    longitude: leg.start_location.lng,
  };
  const destination = {
    latitude: leg.end_location.lat,
    longitude: leg.end_location.lng,
  };
  // Group consecutive walking steps for tricycle suggestion
  let groupedSteps: any[] = [];
  let i = 0;
  while (i < steps.length) {
    if (steps[i].travel_mode === 'WALKING') {
      let walkGroup = [steps[i]];
      let j = i + 1;
      while (j < steps.length && steps[j].travel_mode === 'WALKING') {
        walkGroup.push(steps[j]);
        j++;
      }
      groupedSteps.push({ type: 'WALK_GROUP', steps: walkGroup });
      i = j;
    } else {
      groupedSteps.push({ type: 'STEP', step: steps[i] });
      i++;
    }
  }

const totalFare = groupedSteps.reduce((acc: number, group: any, idx: number) => {
  if (group.type === 'WALK_GROUP') {
    const totalWalkDistance = group.steps.reduce((a: number, s: any) => a + parseDistance(s.distance?.text || '0'), 0);
    const selected = walkGroupSelections[idx] || 'WALK';
    if (selected === 'TRICYCLE') {
      return acc + FARE_MATRIX.TRICYCLE(totalWalkDistance);
    }
    return acc; // Walk is free
  }
  if (group.type === 'STEP') {
    return acc + getFare(group.step);
  }
  return acc;
}, 0);

const discountTypes = ['Student', 'PWD', 'Senior Citizen'];
const isDiscounted = discountTypes.includes(passengerType);
const discountedFare = isDiscounted ? totalFare * 0.8 : totalFare;

 useEffect(() => {
  // Wait a tick to ensure MapView is rendered
  if (
    routeData?.overview_polyline?.points &&
    mapRef.current
  ) {
    const coords = decodePolyline(routeData.overview_polyline.points);
    if (coords.length > 0) {
      setTimeout(() => {
        mapRef.current?.fitToCoordinates(coords, {
          edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
          animated: true,
        });
      }, 500); // Delay to ensure map is ready
    }
  }
}, [routeData]);

const saveTransitToBackend = async () => {
    try {
      // Prepare minimal transit data (customize as needed)
      const transitData = {
        origin: leg.start_address,
        destination: leg.end_address,
        distance: leg.distance?.text,
        duration: leg.duration?.text,
        totalFare: discountedFare,
        passengerType,
        date: new Date().toISOString(),
        steps: steps.map((step: any, idx: number) => ({
          instruction: step.html_instructions?.replace(/<[^>]+>/g, ''),
          vehicle: getVehicleType(step),
          fare: getFare(step, idx),
          distance: step.distance?.text,
          duration: step.duration?.text,
        })),
      };
      const response = await fetch('https://donewithit-yk99.onrender.com/save-transit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transitData),
      });
      const data = await response.json();
      if (!response.ok) {
        Alert.alert('Error', data.message || 'Failed to save transit.');
      } else {
        Alert.alert('Saved', data.message || 'Transit saved to history!');
      }
    } catch (error) {
      Alert.alert('Network Error', 'Could not connect to the server. Please try again later.');
    }
  };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f1c2e' }}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        marginTop: 40,
        paddingHorizontal: 16,
      }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={{
          color: 'white',
          fontSize: 24,
          fontWeight: 'bold',
          textAlign: 'center',
          flex: 1,
        }}>
          Ride Wise
        </Text>
         <TouchableOpacity onPress={saveTransitToBackend} style={{ marginLeft: 12 }}>
          <Ionicons name="heart-outline" size={28} color="#FF4D4D" />
        </TouchableOpacity>
      </View>

      {/* Map View */}
       {routeData.overview_polyline?.points && (
  <View
    style={{
      marginHorizontal: 16,
      marginBottom: 8,
      borderRadius: 16,
      backgroundColor: '#0f1c2e',
      overflow: 'hidden',
      height: 350,
    }}
  >
    <MapView
  ref={mapRef}
  style={{ width: '100%', height: '100%' }}
  initialRegion={{
    latitude: (origin.latitude + destination.latitude) / 2,
    longitude: (origin.longitude + destination.longitude) / 2,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  }}
  showsTraffic={true}
>
  {/* Origin Marker */}
  <Marker coordinate={origin} title="Start" />

  {/* Destination Marker */}
  <Marker coordinate={destination} title="End" />

  {/* Route Polyline */}
  <Polyline
    coordinates={downsamplePolyline(decodePolyline(routeData.overview_polyline.points))}
    strokeColor="blue"
    strokeWidth={4}
  />

  {/* Pop-out mins at each step's start */}
  {routeData.legs[0]?.steps.slice(0, 20).map((step: any, idx: number) => (
  <Marker
    key={`step-marker-${idx}`}
    coordinate={{
      latitude: step.start_location.lat,
      longitude: step.start_location.lng,
    }}
    anchor={{ x: 0.5, y: 1 }}
    tracksViewChanges={false}
  >
    <View style={{
      backgroundColor: 'white',
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderColor: '#2048F3',
      borderWidth: 1,
      elevation: 2,
    }}>
      <Text style={{ color: '#2048F3', fontWeight: 'bold', fontSize: 13 }}>
        {step.duration?.text}
      </Text>
    </View>
  </Marker>
))}
</MapView>
  </View>
)}

     <View style={{
          backgroundColor: '#fff',
          padding: 18,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 5,
          zIndex: 1
        }}>
    <Text style={{ color: '#222', fontWeight: 'bold', fontSize: 16 }}>
      {leg.start_address?.split(',')[0]} - {leg.end_address?.split(',')[0]}
    </Text>
    <Text style={{ color: '#666', fontSize: 14, marginBottom: 4 }}>
      {leg.end_address}
    </Text>
    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
  <Text style={{ color: '#2048F3', fontWeight: 'bold', fontSize: 16, marginRight: 12 }}>
    ₱ {discountedFare?.toFixed(0)}
  </Text>
  {isDiscounted && (
    <Text style={{ color: '#7B86F4', fontSize: 14, marginRight: 12 }}>
      (20% discount {passengerType})
    </Text>
  )}
</View>
<View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
  <Text style={{ color: '#888', fontSize: 14, marginRight: 12 }}>
    {leg.distance?.text}
  </Text>
  <Text style={{ color: '#888', fontSize: 14 }}>
    {leg.duration?.text}
  </Text>
</View>
  </View>


      <ScrollView style={{ flex: 1, backgroundColor: '#E5E4E2', marginTop: 0 }}>
        {/* Route Summary Card */}
        
  {/* Steps */}
  {groupedSteps.map((group, idx) => {
  if (group.type === 'WALK_GROUP') {
    const totalWalkDistance = group.steps.reduce((a: number, s: any) => a + parseDistance(s.distance?.text || '0'), 0);
    const totalWalkDuration = group.steps.reduce((acc: number, s: any) => acc + parseInt(s.duration?.text.replace(' min', '') || '0'), 0);
    const tricycleFare = FARE_MATRIX.TRICYCLE(totalWalkDistance);

    // Toggle state for this walk group
    const isTricycle = walkGroupSelections[idx] === 'TRICYCLE';
    const handleToggle = () => {
      setWalkGroupSelections(prev => ({
        ...prev,
        [idx]: isTricycle ? 'WALK' : 'TRICYCLE'
      }));
    };

    return (
      <View
        key={idx}
        style={{
          backgroundColor: '#fff',
          marginTop: 12,
          borderRadius: 12,
          padding: 14,
          marginHorizontal: 10,
          flexDirection: 'row',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.06,
          shadowRadius: 2,
          elevation: 2,
        }}
      >
        {/* Icon */}
        <View style={{ marginRight: 16 }}>
          {isTricycle ? VEHICLE_ICONS.TRICYCLE : VEHICLE_ICONS.WALK}
        </View>
        {/* Details */}
        <View style={{ flex: 1 }}>
          <Text style={styles.stepTitle}>{isTricycle ? 'Tricycle' : 'Walk'}</Text>
          {isTricycle ? (
            <>
              <Text style={{ color: '#222', fontSize: 14 }}>
                {group.steps[0]?.start_location ? 'From: ' + group.steps[0]?.start_location.lat + ',' + group.steps[0]?.start_location.lng : ''}
              </Text>
              <Text style={{ color: '#222', fontSize: 14 }}>
                {group.steps[group.steps.length - 1]?.end_location ? 'To: ' + group.steps[group.steps.length - 1]?.end_location.lat + ',' + group.steps[group.steps.length - 1]?.end_location.lng : ''}
              </Text>
              <Text style={styles.stepSubText}>
                 ₱ {tricycleFare.toFixed(0)} • {totalWalkDistance.toFixed(2)} km
              </Text>
            </>
          ) : (
            <>
              <Text style={{ color: '#222', fontSize: 14 }}>
                {group.steps.map((s: any) => s.html_instructions?.replace(/<[^>]+>/g, '')).join(', ')}
              </Text>
              <Text style={styles.stepSubText}>
                {totalWalkDuration} min • {totalWalkDistance.toFixed(2)} km
              </Text>
            </>
          )}
        </View>
        {/* Toggle */}
        <Switch
          value={isTricycle}
          onValueChange={handleToggle}
          thumbColor={isTricycle ? '#2048F3' : '#ccc'}
          trackColor={{ false: '#ccc', true: '#A7C7FF' }}
        />
      </View>
    );
  }
    // Regular step (bus, jeep, taxi, etc.)
    if (group.type === 'STEP') {
  const step = group.step;
  let vehicleType = getVehicleType(step);
  const isBusOrJeep = vehicleType === 'BUS' || vehicleType === 'JEEP';
  const selectedVehicle = isBusOrJeep ? (busToJeepSelections[idx] || vehicleType) : vehicleType;
  const fare = getFare(step, idx);
  let icon = VEHICLE_ICONS[selectedVehicle] || VEHICLE_ICONS.BUS;
  let vehicleName = selectedVehicle.charAt(0) + selectedVehicle.slice(1).toLowerCase();

  if (
    selectedVehicle === 'BUS' ||
    selectedVehicle === 'JEEP' ||
    selectedVehicle === 'TAXI' ||
    selectedVehicle === 'TRICYCLE' ||
    selectedVehicle === 'LRT' ||
    selectedVehicle === 'MRT' ||
    selectedVehicle === 'EDSA_Carousel'
  ) {
    vehicleName =
      step.transit_details?.line?.short_name ||
      step.transit_details?.line?.name ||
      vehicleName;
  }

  return (
    <View key={idx} style={styles.stepCard}>
      {icon}
      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text style={styles.stepTitle}>
          {selectedVehicle === 'BUS' && 'Bus'}
          {selectedVehicle === 'JEEP' && 'Jeep'}
          {selectedVehicle === 'TAXI' && 'Taxi'}
          {selectedVehicle === 'TRICYCLE' && 'Tricycle'}
          {selectedVehicle === 'WALK' && 'Walk'}
          {selectedVehicle === 'LRT' && 'LRT'}
          {selectedVehicle === 'MRT' && 'MRT'}
          {selectedVehicle === 'EDSA_Carousel' && 'EDSA Carousel'}
        </Text>
        {step.transit_details && (
          <>
            <Text style={styles.stepSubText}>
              <Text style={{ color: '#2048F3', fontWeight: 'bold' }}>● GET ON </Text>
              <Text style={{ color: '#222' }}>{step.transit_details.departure_stop?.name}</Text>
            </Text>
            <Text style={styles.stepSubText}>
              <Text style={{ color: '#2048F3', fontWeight: 'bold' }}>● GET OFF </Text>
              <Text style={{ color: '#222' }}>{step.transit_details.arrival_stop?.name}</Text>
            </Text>
          </>
        )}
        <Text style={styles.stepSubText}>
          ₱ {fare.toFixed(0)} • {step.duration?.text} • {step.distance?.text}
        </Text>
      </View>
      {/* Toggle for BUS/JEEP */}
      {isBusOrJeep && (
        <Switch
          value={selectedVehicle === 'JEEP'}
          onValueChange={() =>
            setBusToJeepSelections(prev => ({
              ...prev,
              [idx]: selectedVehicle === 'JEEP' ? 'BUS' : 'JEEP'
            }))
          }
          thumbColor={selectedVehicle === 'JEEP' ? '#2048F3' : '#ccc'}
          trackColor={{ false: '#ccc', true: '#A7C7FF' }}
        />
      )}
    </View>
  );
}
    return null;
  })}
  <View style={{ height: 30 }} />
</ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  stepCard: {
    backgroundColor: '#fff',
          marginTop: 12,
          borderRadius: 12,
          padding: 14,
          marginHorizontal: 10,
          flexDirection: 'row',
          alignItems: 'stretch', // ensures equal height
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.06,
          shadowRadius: 2,
          elevation: 2,
  } as ViewStyle,
  stepTitle: {
    color: '#2048F3',
    fontSize: 15,
  } as TextStyle,
  stepSubText: {
    color: '#888',
    fontSize: 13,
    marginTop: 2,
  } as TextStyle,
});

// Helper function to decode a polyline string into an array of coordinates
function decodePolyline(encoded: string): { latitude: number; longitude: number }[] {
  let points: { latitude: number; longitude: number }[] = [];
  let index = 0,
    len = encoded.length;
  let lat = 0,
    lng = 0;
  while (index < len) {
    let b,
      shift = 0,
      result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    let dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    let dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;
    points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }
  return points;
}

// Helper function
interface PolylinePoint {
  latitude: number;
  longitude: number;
}

function downsamplePolyline(points: PolylinePoint[], maxPoints: number = 500): PolylinePoint[] {
  if (points.length <= maxPoints) return points;
  const step = Math.ceil(points.length / maxPoints);
  return points.filter((_, idx) => idx % step === 0);
}