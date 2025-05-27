import * as Location from 'expo-location';
import React, { useEffect, useState, useRef, useMemo } from 'react';
import BottomSheet, { BottomSheetView,  BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  View,
  Text,
  StatusBar,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
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
import AsyncStorage from '@react-native-async-storage/async-storage';

import axios from 'axios';

// Import fare helpers from utils
import {
  fareMatrix,
  discountTypes,
  parseDistance,
  getVehicleType,
  getStepFare,
  getRouteTotalFare,
} from '../util/fareutils';

let userId: string | null = null;
AsyncStorage.getItem('user_id').then(id => {
  userId = id;
});

const { width } = Dimensions.get('window');
const GOOGLE_MAPS_APIKEY = 'AIzaSyDh3IwX1o3v0Ud_YZJUtM_29LIetafzQAY';

type VehicleType =
  | 'BUS'
  | 'TRICYCLE'
  | 'TAXI'
  | 'JEEP'
  | 'WALK'
  | 'LRT'
  | 'MRT'
  | 'EDSA_Carousel';

const VEHICLE_ICONS: Record<VehicleType, JSX.Element> = {
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
  const [routeType, setRouteType] = useState<'shortest' | 'cheapest'>('shortest');
  const [busToJeepSelections, setBusToJeepSelections] = useState<{ [key: number]: 'BUS' | 'JEEP' }>({});
  const [walkGroupSelections, setWalkGroupSelections] = useState<{ [key: number]: 'WALK' | 'TRICYCLE' }>({});
  const [hasSavedHistory, setHasSavedHistory] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);
const snapPoints = useMemo(() => ["20%", "50%", "90%"], []);
   useEffect(() => {
    const fetchUserLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      let location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    };
    fetchUserLocation();
  }, []);

  const [userHeading, setUserHeading] = useState<number | null>(null);

useEffect(() => {
  let subscription: Location.LocationSubscription | null = null;
  const subscribe = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;
    subscription = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, distanceInterval: 1, timeInterval: 1000 },
      (location) => {
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        setUserHeading(location.coords.heading ?? 0);
      }
    );
  };
  subscribe();
  return () => {
    if (subscription) subscription.remove();
  };
}, []);

   let routeData = null;
  if (params.routeData) {
    try {
      routeData = JSON.parse(params.routeData as string);
     
    } catch (e) {
      routeData = null;
    }
  }
 useEffect(() => {
    if (!hasSavedHistory && routeData) {
      saveTransitToBackend(); // Save to history
      setHasSavedHistory(true);
    }
  }, [routeData, hasSavedHistory]);
  const mapRef = useRef<MapView>(null);

  // Discount logic
  const isDiscounted = discountTypes.includes(passengerType);

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

  // Calculate total fare using fareUtils
  const totalFare = useMemo(() => {
    return groupedSteps.reduce((acc: number, group: any, idx: number) => {
      if (group.type === 'WALK_GROUP') {
        const totalWalkDistance = group.steps.reduce((a: number, s: any) => a + parseDistance(s.distance?.text || '0'), 0);
        const selected = walkGroupSelections[idx] || 'WALK';
        if (selected === 'TRICYCLE') {
          let fakeStep = { ...group.steps[0], travel_mode: 'TRANSIT', transit_details: { line: { vehicle: { name: 'tricycle' } } }, distance: { text: `${totalWalkDistance} km` } };
          let fare = getStepFare(fakeStep);
          if (isDiscounted) fare *= 0.8;
          return acc + fare;
        }
        return acc; // Walk is free
      }
      if (group.type === 'STEP') {
        let step = group.step;
        let vehicleType = getVehicleType(step);
        const isBusOrJeep = vehicleType === 'BUS' || vehicleType === 'JEEP';
        const selectedVehicle = isBusOrJeep ? (busToJeepSelections[idx] || vehicleType) : vehicleType;
        let fakeStep = { ...step };
        if (isBusOrJeep) {
          fakeStep = { ...step, travel_mode: 'TRANSIT', transit_details: { ...step.transit_details, line: { ...step.transit_details?.line, vehicle: { name: selectedVehicle.toLowerCase() } } } };
        }
        let fare = getStepFare(fakeStep);
        return acc + fare;
      }
      return acc;
    }, 0);
  }, [groupedSteps, walkGroupSelections, busToJeepSelections, isDiscounted]);

  const discountedFare = totalFare;

  useEffect(() => {
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
        }, 500);
      }
    }
  }, [routeData]);

  const saveFavoriteToBackend = async () => {
  try {
    const userId = await AsyncStorage.getItem('user_id');
    if (!userId) {
      Alert.alert('Error', 'User not logged in.');
      return;
    }

    const minimalRouteData = {
      bounds: routeData.bounds,
      copyrights: routeData.copyrights,
      fare: routeData.fare,
      legs: routeData.legs,
      overview_polyline: routeData.overview_polyline,
      summary: routeData.summary,
      warnings: routeData.warnings,
      waypoint_order: routeData.waypoint_order,
    };

    const favorite = {
      fullRouteData: minimalRouteData,
      passengerType,
      date: new Date().toISOString(),
      totalFare: discountedFare,
    };

    const response = await fetch('https://donewithit-yk99.onrender.com/add-favorite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, favorite }),
    });
    const data = await response.json();
    if (!response.ok) {
      Alert.alert('Error', data.message || 'Failed to save favorite.');
    } else {
      Alert.alert('Success', 'Route added to favorites!');
    }
  } catch (error) {
    Alert.alert('Network Error', 'Could not connect to the server. Please try again later.');
  }
};

const saveTransitToBackend = async () => {
  try {
    const userId = await AsyncStorage.getItem('user_id');
    if (!userId) {
      Alert.alert('Error', 'User not logged in.');
      return;
    }

    const minimalRouteData = {
      bounds: routeData.bounds,
      copyrights: routeData.copyrights,
      fare: routeData.fare,
      legs: routeData.legs,
      overview_polyline: routeData.overview_polyline,
      summary: routeData.summary,
      warnings: routeData.warnings,
      waypoint_order: routeData.waypoint_order,
    };

    const transit = {
      fullRouteData: minimalRouteData,
      passengerType,
      date: new Date().toISOString(),
      totalFare: discountedFare,
    };

    const response = await fetch('https://donewithit-yk99.onrender.com/save-transit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, transit }),
    });
    const data = await response.json();
    if (!response.ok) {
      Alert.alert('Error', data.message || 'Failed to save favorite.');
    } else {
      Alert.alert('Success', 'Route added to favorites!');
    }
  } catch (error) {
    Alert.alert('Network Error', 'Could not connect to the server. Please try again later.');
  }
};
  const shortestRouteData = routeData; // Route with shortest distance
  const cheapestRouteData = routeData; // Route with lowest fare
  const selectedRouteData = routeType === 'shortest' ? shortestRouteData : cheapestRouteData;


 const hasFocusedRef = useRef(false); // Add this near your other refs/states

useEffect(() => {
  if (
    routeData?.overview_polyline?.points &&
    mapRef.current &&
    !hasFocusedRef.current // Only run once
  ) {
    const coords = decodePolyline(routeData.overview_polyline.points);
    if (coords.length > 0) {
      setTimeout(() => {
        // Focus and tilt to side view
        mapRef.current?.fitToCoordinates(coords, {
          edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
          animated: true,
        });
        mapRef.current?.animateCamera(
          {
            center: coords[Math.floor(coords.length / 2)],
            pitch: 60, // Side view
            heading: 0,
            zoom: 15,
            altitude: 500,
          },
          { duration: 1500 }
        );
        hasFocusedRef.current = true; // Prevent future runs

        // After 3 seconds, animate to top-down (unfocused) view
        setTimeout(() => {
          mapRef.current?.animateCamera(
            {
              center: coords[Math.floor(coords.length / 2)],
              pitch: 0, // Top-down view
              heading: 0,
              zoom: 14, // Zoom out a bit
              altitude: 1500,
            },
            { duration: 1200 }
          );
        }, 3000); // 3 seconds after focus
      }, 700);
    }
  }
}, [routeData]);

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
        
        </Text>
        <TouchableOpacity onPress={saveFavoriteToBackend} style={{ marginLeft: 12 }}>
          <Ionicons name="heart-outline" size={28} color="#FF4D4D" />
        </TouchableOpacity>
      </View>
   
        <GestureHandlerRootView>
  <View
        style={styles.mapContainer}
      >
      {/* Map View */}
      {routeData.overview_polyline?.points && (
        <View
          style={{
            marginHorizontal: 2,
            marginBottom: 8,
            borderRadius: 16,
            backgroundColor: '#0f1c2e',
            overflow: 'hidden',
            height: 610,
          }}
        >
          <MapView
            ref={mapRef}
            style={styles.map}
            
            initialRegion={{
              latitude: (origin.latitude + destination.latitude) / 2,
              longitude: (origin.longitude + destination.longitude) / 2,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
            showsTraffic={true}
          >
            {/* User Location Marker */}
            {userLocation && (
              <Marker
                coordinate={userLocation}
                title="Your Location"
                pinColor="#2048F3"
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
          {/* Traffic Legend */}
          <View
            style={{
              position: 'absolute',
              bottom: 16,
              right: 16,
              backgroundColor: 'rgba(255,255,255,0.95)',
              borderRadius: 8,
              padding: 10,
              flexDirection: 'row',
              alignItems: 'center',
              elevation: 4,
              shadowColor: '#000',
              shadowOpacity: 0.15,
              shadowRadius: 4,
            }}
          >
            <View style={{ width: 18, height: 6, backgroundColor: '#2ecc40', borderRadius: 3, marginRight: 6 }} />
            <Text style={{ fontSize: 13, color: '#222', marginRight: 12 }}>Light</Text>
            <View style={{ width: 18, height: 6, backgroundColor: '#ffdc00', borderRadius: 3, marginRight: 6 }} />
            <Text style={{ fontSize: 13, color: '#222', marginRight: 12 }}>Moderate</Text>
            <View style={{ width: 18, height: 6, backgroundColor: '#ff4136', borderRadius: 3, marginRight: 6 }} />
            <Text style={{ fontSize: 13, color: '#222' }}>Heavy</Text>
          </View>
        </View>
      )}
      </View>
     <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      backgroundStyle={{  borderRadius: 16 }}
      handleIndicatorStyle={{ backgroundColor: '#888' }}
    >
 <BottomSheetView style={{ flex: 1  }}>
      {/* Route Details */}
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
        {/* Steps */}
        {groupedSteps.map((group, idx) => {
          if (group.type === 'WALK_GROUP') {
            const totalWalkDistance = group.steps.reduce((a: number, s: any) => a + parseDistance(s.distance?.text || '0'), 0);
            const totalWalkDuration = group.steps.reduce((acc: number, s: any) => acc + parseInt(s.duration?.text.replace(' min', '') || '0'), 0);
            let fakeStep = { ...group.steps[0], travel_mode: 'TRANSIT', transit_details: { line: { vehicle: { name: 'tricycle' } } }, distance: { text: `${totalWalkDistance} km` } };
            const tricycleFare = getStepFare(fakeStep);

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
          const step = group.step;
          let vehicleType = getVehicleType(step);
          const isBusOrJeep = vehicleType === 'BUS' || vehicleType === 'JEEP';
          const selectedVehicle = isBusOrJeep ? (busToJeepSelections[idx] || vehicleType) : vehicleType;
          let fakeStep = { ...step };
          if (isBusOrJeep) {
            fakeStep = { ...step, travel_mode: 'TRANSIT', transit_details: { ...step.transit_details, line: { ...step.transit_details?.line, vehicle: { name: selectedVehicle.toLowerCase() } } } };
          }
          const fare = getStepFare(fakeStep);
          let icon = VEHICLE_ICONS[selectedVehicle as VehicleType] || VEHICLE_ICONS.BUS;
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
        })}
        <View style={{ height: 30 }} />
      </ScrollView>
       </BottomSheetView>
    </BottomSheet>
    </GestureHandlerRootView>
  </SafeAreaView>
);
}

const styles = StyleSheet.create({ 
  map: {
      ...StyleSheet.absoluteFillObject,
    },
  mapContainer: {
    flex: 1,
    marginHorizontal: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  stepCard: {
    backgroundColor: '#fff',
    marginTop: 12,
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'stretch',
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
  contentContainer: {
    flex: 1,
    padding: 36,
    alignItems: 'center',
  },
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

