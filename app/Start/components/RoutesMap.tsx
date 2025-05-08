import React, { useEffect, useState } from 'react';
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
import { useRouter } from 'expo-router';

const GOOGLE_MAPS_APIKEY = 'AIzaSyDh3IwX1o3v0Ud_YZJUtM_29LIetafzQAY'; // Replace with your API key

export default function RideWise() {
  const router = useRouter();
  const [routeData, setRouteData] = useState<Array<{ overview_polyline: { points: string }; legs: Array<{ duration: { text: string }; distance: { text: string }; steps: Array<{ polyline: { points: string }; duration: { text: string }; distance: { text: string } }> }> }>>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);

  const origin = { latitude: 14.7863, longitude: 120.9251 }; // Bambang
  const destination = { latitude: 14.7000, longitude: 120.9550 }; // Valenzuela Park

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const response = await axios.get(`https://maps.googleapis.com/maps/api/directions/json`, {
          params: {
            origin: `${origin.latitude},${origin.longitude}`,
            destination: `${destination.latitude},${destination.longitude}`,
            alternatives: true, // Fetch alternative routes
            key: GOOGLE_MAPS_APIKEY,
            traffic_model: 'best_guess',
            departure_time: 'now',
          },
        });
        setRouteData(response.data.routes);
        console.log(response.data.routes);
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch routes.');
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, []);

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
      params: { routeData: JSON.stringify(route) }
    });
  };
  const handleBack = () => {
    router.push('./Menu');
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#00ff00" />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1E2029' }}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, marginTop: 40, paddingHorizontal: 16 }}>
        <TouchableOpacity onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold', textAlign: 'center', flex: 1 }}>Ride Wise</Text>
      </View>

      {/* Map View */}
      {routeData.length > 0 && (
        <MapView
          style={{ width: '100%', height: 300 }}
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

          {/* Routes */}
          {routeData.map((route, index) => {
  const isSelected = index === selectedRouteIndex;

  // Decode the polyline for the entire route
  const routeCoordinates = decodePolyline(route.overview_polyline.points);

  return (
    <React.Fragment key={index}>
      {/* Route Polyline */}
      <Polyline
        coordinates={routeCoordinates}
        strokeColor={isSelected ? '#2048F3' : '#888'} // Blue for selected route, gray for others
        strokeWidth={isSelected ? 3 : 3}
        zIndex={isSelected ? 1 : 0} // Thicker line for selected route
      />

      {/* Live Traffic Indicators */}
      {isSelected &&
        route.legs[0].steps.map((step, stepIndex) => {
          const stepCoordinates = decodePolyline(step.polyline.points);
          const midpointIndex = Math.floor(stepCoordinates.length / 2);
          const midpoint = stepCoordinates[midpointIndex];

          return (
            <Marker key={stepIndex} coordinate={midpoint}>
              <View
                style={{
                  backgroundColor: 'white',
                  padding: 4,
                  borderRadius: 6,
                  borderColor: '#888',
                  borderWidth: 1,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: 'red', fontWeight: 'bold', fontSize: 12 }}>
                  {step.duration.text}
                </Text>
                <Text style={{ color: '#333', fontSize: 10 }}>
                  {step.distance.text}
                </Text>
              </View>
            </Marker>
          );
        })}
    </React.Fragment>
  );
})}
          
        </MapView>
      )}

      {/* Available Routes */}
<View style={{ flex: 1, paddingHorizontal: 16 }}>
  <Text style={{ color: '#9CA3AF', fontSize: 16, marginBottom: 8 }}>Available Routes</Text>
  <FlatList
    data={routeData}
    keyExtractor={(item, index) => index.toString()}
    renderItem={({ item, index }) => (
      <View
        style={{
          marginBottom: 16,
          padding: 12,
          backgroundColor: index === selectedRouteIndex ? '#2048F3' : '#2A2D3A',
          borderRadius: 8,
        }}
      >
        <TouchableOpacity onPress={() => setSelectedRouteIndex(index)}>
          <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
            Route {index + 1}
          </Text>
          <Text style={{ color: '#9CA3AF', fontSize: 14 }}>
            Duration: {item.legs[0].duration.text}
          </Text>
          <Text style={{ color: '#9CA3AF', fontSize: 14 }}>
            Distance: {item.legs[0].distance.text}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
  style={{
    marginTop: 8,
    backgroundColor: '#2048F3',
    paddingVertical: 8,
    borderRadius: 4,
  }}
  onPress={() => handleRouting(item)}
>
  <Text style={{ color: 'white', textAlign: 'center' }}>Detail</Text>
</TouchableOpacity>
      </View>
    )}
  />
</View>
    </SafeAreaView>
  );
}