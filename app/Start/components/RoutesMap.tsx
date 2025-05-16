import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StatusBar,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useRouter, useLocalSearchParams } from 'expo-router';

const GOOGLE_MAPS_APIKEY = 'AIzaSyDh3IwX1o3v0Ud_YZJUtM_29LIetafzQAY'; // Replace with your API key

export default function RideWise() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const [routeData, setRouteData] = useState<Array<{ overview_polyline: { points: string }; legs: Array<{ duration: { text: string }; distance: { text: string }; steps: Array<{ polyline: { points: string }; duration: { text: string }; distance: { text: string }; start_location: { lat: number; lng: number } }> }> }>>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  const [bestRouteIndex, setBestRouteIndex] = useState<number | null>(null);
  const [destCoords, setDestCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const params = useLocalSearchParams();
  const passengerType = params.passengerType || 'Regular';
const originStr = params.origin as string | undefined;
let originLat: number | undefined = undefined;
let originLng: number | undefined = undefined;

if (originStr) {
  [originLat, originLng] = originStr.split(',').map(Number);
}
let destination: string | { latitude: number; longitude: number } | null = null;
if (params.destination) {
  try {
    // Try to parse as coordinates object
    const parsed = JSON.parse(params.destination as string);
    if (
      typeof parsed === 'object' &&
      parsed.latitude &&
      parsed.longitude
    ) {
      destination = parsed;
    } else {
      destination = params.destination as string;
    }
  } catch {
    // If not JSON, treat as string address
    destination = params.destination as string;
  }
}console.log('Received origin:', originLat, originLng);
console.log('Received destination:', destination);
async function geocodeAddress(address: string) {
  const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
    params: {
      address,
      key: GOOGLE_MAPS_APIKEY,
    },
  });
  const result = response.data.results[0];
  if (result) {
    return {
      latitude: result.geometry.location.lat,
      longitude: result.geometry.location.lng,
    };
  }
}

  useEffect(() => {
  const fetchRoutes = async () => {
    try {
      let coords = destination;
      if (typeof destination === 'string') {
        const geocoded = await geocodeAddress(destination);
        if (!geocoded) {
          Alert.alert('Error', 'Could not geocode destination address.');
          setLoading(false);
          return;
        }
        coords = geocoded;
      }
      if (!originLat || !originLng || !coords) {
        Alert.alert('Error', 'Could not get coordinates for origin or destination.');
        setLoading(false);
        return;
      }
      // Only set destCoords if coords is an object with latitude and longitude
      if (typeof coords === 'object' && coords.latitude !== undefined && coords.longitude !== undefined) {
        setDestCoords(coords);
      }
      const response = await axios.get(`https://maps.googleapis.com/maps/api/directions/json`, {
        params: {
          origin: `${originLat},${originLng}`,
          destination: `${(coords as { latitude: number; longitude: number }).latitude},${(coords as { latitude: number; longitude: number }).longitude}`,
          alternatives: true,
          mode: 'transit',
          key: GOOGLE_MAPS_APIKEY,
          traffic_model: 'best_guess',
          departure_time: 'now',
        },
      });
      if (response.data.routes && response.data.routes.length > 0) {
        setRouteData(response.data.routes);
        setBestRouteIndex(getBestRouteIndex(response.data.routes));
      } else {
        Alert.alert('No routes found');
      }
      setLoading(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch route.');
      setLoading(false);
    }
  };
  fetchRoutes();
}, []);
 

useEffect(() => {
  if (
    routeData.length > 0 &&
    routeData[selectedRouteIndex]?.overview_polyline?.points &&
    mapRef.current
  ) {
    const coords = decodePolyline(routeData[selectedRouteIndex].overview_polyline.points);
    if (coords.length > 0) {
      mapRef.current.fitToCoordinates(coords, {
        edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
        animated: true,
      });
    }
  }
}, [routeData, selectedRouteIndex]);
  const getBestRouteIndex = (routes: any[]) => {
    let bestIndex = 0;
    let bestScore = Infinity;

    routes.forEach((route, index) => {
      const duration = parseInt(route.legs[0].duration.text.replace(' mins', '')) || 0; // Convert duration to minutes
      const distance = parseFloat(route.legs[0].distance.text.replace(' km', '')) || 0; // Convert distance to kilometers
      const fare = distance * 2; // Example fare calculation (2 currency units per km)

      const score = duration + fare; // Combine duration and fare for scoring
      if (score < bestScore) {
        bestScore = score;
        bestIndex = index;
      }
    });

    return bestIndex;
  };

  const decodePolyline = (encoded: string) => {
    let points = [];
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
  };
  const handleRouting = (route: { overview_polyline: { points: string }; legs: Array<{ duration: { text: string }; distance: { text: string }; steps: Array<{ polyline: { points: string }; duration: { text: string }; distance: { text: string } }> }> }) => {
    router.push({
      pathname: './Routing',
      params: { 
        routeData: JSON.stringify(route),
        passengerType
      }
    });
  };
 

  

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#111827' }}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, marginTop: 40, paddingHorizontal: 16 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold', textAlign: 'center', flex: 1 }}>Ride Wise</Text>
      </View>

          {(originLat && originLng && destCoords) ? (
  <MapView
    ref={mapRef}
    style={{ width: '100%', height: 250 }}
    initialRegion={{
      latitude: (originLat + destCoords.latitude) / 2,
      longitude: (originLng + destCoords.longitude) / 2,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    }}
    showsTraffic={true}
  >
    {/* Origin Marker */}
    <Marker coordinate={{ latitude: originLat, longitude: originLng }} />
    <Marker coordinate={destCoords} />
    {routeData[selectedRouteIndex]?.overview_polyline?.points && (
      <Polyline
        coordinates={decodePolyline(routeData[selectedRouteIndex].overview_polyline.points)}
        strokeColor="#2048F3"
        strokeWidth={6}
      />
    )}
    {/* Step Markers */}
    {routeData[selectedRouteIndex]?.legs[0]?.steps.map((step, idx) => (
      <Marker
        key={`step-marker-${idx}`}
        coordinate={{
          latitude: step.start_location.lat,
          longitude: step.start_location.lng,
        }}
        anchor={{ x: 0.5, y: 1 }}
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
            {step.duration.text}
          </Text>
        </View>
      </Marker>
    ))}
  </MapView>
) : (
  <View style={{ height: 250, justifyContent: 'center', alignItems: 'center' }}>
    <ActivityIndicator size="large" color="#2048F3" />
    <Text style={{ color: '#fff', marginTop: 10 }}>Loading map...</Text>
  </View>
)}

          {/* Route Details */}
          <View style={{ padding: 16, backgroundColor: '#111827', borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
            <View style={{ alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
              <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>Routes</Text>
            </View>
            <FlatList
              data={routeData}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  onPress={() => setSelectedRouteIndex(index)} // Update selected route index
                  style={{
                    marginBottom: 16,
                    padding: 12,
                    backgroundColor: index === selectedRouteIndex ? '#2048F3' : '#2A2D3A',
                    borderRadius: 8,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <View>
                    <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
                      {`Route ${index + 1}`}
                    </Text>
                    <Text style={{ color: '#9CA3AF', fontSize: 14 }}>
                      {item.legs[0].duration.text} - {item.legs[0].distance.text}
                    </Text>
                  </View>
                  {index === bestRouteIndex && (
                    <View
                      style={{
                        backgroundColor: '#FFD700',
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 4,
                      }}
                    >
                      <Text style={{ color: '#1E2029', fontWeight: 'bold', fontSize: 12 }}>BEST</Text>
                    </View>
                  )}
                  <TouchableOpacity
                    style={{
                      marginLeft: 8,
                      backgroundColor: '#1E2029',
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      borderRadius: 4,
                    }}
                    onPress={() => handleRouting(item)}
                  >
                    <Text style={{ color: 'white', fontSize: 14 }}>Details</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              )}
            />
          </View>
    </SafeAreaView>
  );
}