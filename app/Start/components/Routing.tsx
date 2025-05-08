import React, { useEffect, useState } from 'react';
import { View, Text, StatusBar, SafeAreaView, TouchableOpacity, Dimensions, ActivityIndicator, ScrollView } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

const { width } = Dimensions.get('window');
const GOOGLE_MAPS_APIKEY = 'AIzaSyDh3IwX1o3v0Ud_YZJUtM_29LIetafzQAY'; // Replace with your API key

export default function RideWise() {
  const router = useRouter();
  const { routeData } = useLocalSearchParams();
  // Parse the selected route data passed from RoutesMap screen
  const selectedRoute = routeData ? JSON.parse(routeData as string) : null;
  
  // Extract the overview polyline for the route
  const overviewPolyline = selectedRoute?.overview_polyline?.points;
  
  const [loading, setLoading] = useState(false);
  const origin = { latitude: 14.7863, longitude: 120.9251 }; // Fallback origin; optionally, pass from RoutesMap
  const destination = { latitude: 14.7000, longitude: 120.9550 }; // Fallback destination

  if (loading) {
    return <ActivityIndicator size="large" color="#00ff00" />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1E2029' }}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, marginTop: 40, paddingHorizontal: 16 }}>
        <TouchableOpacity onPress={() => router.push('./Menu')}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold', textAlign: 'center', flex: 1 }}>
          Ride Wise
        </Text>
      </View>

      {/* Map View using the selected route's polyline */}
      {overviewPolyline && (
        <MapView
          style={{ width: '100%', height: 300 }}
          initialRegion={{
            latitude: (origin.latitude + destination.latitude) / 2,
            longitude: (origin.longitude + destination.longitude) / 2,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsTraffic={true}
        >
          <Marker coordinate={origin} title="Start" />
          <Marker coordinate={destination} title="End" />
          <Polyline
            coordinates={decodePolyline(overviewPolyline)}
            strokeColor="blue"
            strokeWidth={4}
          />
        </MapView>
      )}

      {/* Additional Route Details */}
      <ScrollView style={{ padding: 16 }}>
        <Text style={{ color: 'white', fontSize: 18, marginBottom: 8 }}>Selected Route Details</Text>
        {/* Transit Instructions Section */}
        {selectedRoute && selectedRoute.legs && selectedRoute.legs[0].steps &&
          selectedRoute.legs[0].steps.map((step: any, idx: number) => {
            // Check if this step is transit (i.e. includes transit_details)
            if (step.travel_mode === 'TRANSIT' && step.transit_details) {
              return (
                <View key={idx} style={{ marginVertical: 8, padding: 8, backgroundColor: '#2A2D3A', borderRadius: 6 }}>
                  <Text style={{ color: 'white', fontSize: 14 }}>
                    Get on {step.transit_details.line.vehicle.name} at {step.transit_details.departure_stop.name}
                  </Text>
                  <Text style={{ color: 'white', fontSize: 14 }}>
                    Get off at {step.transit_details.arrival_stop.name}
                  </Text>
                </View>
              );
            }
            return null;
          })
        }
      </ScrollView>
    </SafeAreaView>
  );
}

// Helper function to decode a polyline string into an array of coordinates
function decodePolyline(encoded: string): { latitude: number; longitude: number }[] {
  let points: { latitude: number; longitude: number }[] = [];
  let index = 0, len = encoded.length;
  let lat = 0, lng = 0;
  while (index < len) {
    let b, shift = 0, result = 0;
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