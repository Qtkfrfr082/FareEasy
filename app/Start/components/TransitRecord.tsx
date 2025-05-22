import React, { useState } from 'react';
import { View, Text, FlatList, StatusBar, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import { Calendar } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GOOGLE_MAPS_APIKEY = 'AIzaSyDh3IwX1o3v0Ud_YZJUtM_29LIetafzQAY';

export default function RideWise() {
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    'Inter-Bold': require('../../../assets/fonts/Inter_18pt-Bold.ttf'),
    'Inter-Regular': require('../../../assets/fonts/Inter_18pt-Regular.ttf'),
  });

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  // Convert fareHistory to state
  const [fareHistory, setFareHistory] = useState<any[]>([]);

 React.useEffect(() => {
    const fetchTransitHistory = async () => {
      const userId = await AsyncStorage.getItem('user_id');
      if (!userId) {
        Alert.alert('Error', 'User not logged in.');
        return;
      }
      fetch(`https://donewithit-yk99.onrender.com/get-transit?user_id=${userId}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data.transit)) {
            setFareHistory(
              data.transit.map((item: any, idx: number) => ({
                id: item.id || idx.toString(),
                date: item.date ? item.date.slice(0, 10) : '',
                route: `${item.origin || ''} - ${item.destination || ''}`,
                origin: item.originCoords
                  ? {
                      latitude: item.originCoords.lat,
                      longitude: item.originCoords.lng,
                    }
                  : (item.steps && item.steps[0] && item.steps[0].start_location
                      ? {
                          latitude: item.steps[0].start_location.lat,
                          longitude: item.steps[0].start_location.lng,
                        }
                      : { latitude: 0, longitude: 0 }),
                destination: item.destinationCoords
                  ? {
                      latitude: item.destinationCoords.lat,
                      longitude: item.destinationCoords.lng,
                    }
                  : (item.steps && item.steps[item.steps.length - 1] && item.steps[item.steps.length - 1].end_location
                      ? {
                          latitude: item.steps[item.steps.length - 1].end_location.lat,
                          longitude: item.steps[item.steps.length - 1].end_location.lng,
                        }
                      : { latitude: 0, longitude: 0 }),
                fare: item.totalFare ? `₱${Number(item.totalFare).toFixed(0)}` : '',
                passengerType: item.passengerType || 'Regular',
                legs: item.fullRouteData?.legs || [],
                fullRouteData: item.fullRouteData || item,
              }))
            );
          }
        })
        .catch(() => {
          Alert.alert('Error', 'Failed to fetch transit history from server.');
        });
    };

    fetchTransitHistory();
  }, []);

  const handleBack = () => {
    router.push('./Menu');
  };

  const filterFareHistory = () => {
    if (!startDate || !endDate) return fareHistory;
    return fareHistory.filter(
      (item) => item.date >= startDate && item.date <= endDate
    );
  };

  // Delete function
  const deleteFareHistory = (id: string) => {
    Alert.alert(
      'Delete Confirmation',
      'Are you sure you want to delete this record?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setFareHistory((prev) => prev.filter((item) => item.id !== id));
          },
        },
      ]
    );
  };

  // Generate marked dates for the calendar
  const generateMarkedDates = () => {
    const markedDates: Record<string, { marked?: boolean; dotColor?: string; selectedColor?: string; selected?: boolean }> = {};
    fareHistory.forEach((item) => {
      markedDates[item.date] = { marked: true, dotColor: '#06B6D4', selectedColor: '#06B6D4' };
    });
    if (startDate) {
      markedDates[startDate] = { ...markedDates[startDate], selected: true, selectedColor: '#06B6D4' };
    }
    if (endDate) {
      markedDates[endDate] = { ...markedDates[endDate], selected: true, selectedColor: '#06B6D4' };
    }
    return markedDates;
  };

  if (!fontsLoaded) {
    return null;
  }

 const handleHistoryClick = (item: any) => {
  // Check that all required fields exist in the backend data
  if (
    !item.fullRouteData ||
    !item.fullRouteData.bounds ||
    !item.fullRouteData.legs ||
    !item.fullRouteData.overview_polyline
  ) {
    Alert.alert('Error', 'No complete route data available for this record.');
    return;
  }

  // Only send the minimal Google Directions API-like structure
  const routeData = {
    bounds: item.fullRouteData.bounds,
    copyrights: item.fullRouteData.copyrights,
    fare: item.fullRouteData.fare,
    legs: item.fullRouteData.legs,
    overview_polyline: item.fullRouteData.overview_polyline,
    summary: item.fullRouteData.summary,
    warnings: item.fullRouteData.warnings,
    waypoint_order: item.fullRouteData.waypoint_order,
  };

  console.log('Sending routeData:', routeData);

  router.push({
    pathname: './Routing',
    params: { 
      routeData: JSON.stringify(routeData),
      passengerType: item.passengerType || 'Regular',
    }
  });
};

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f1c2e' }}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, marginTop: 40, paddingHorizontal: 16 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text
          style={{
            color: 'white',
            fontSize: 24,
            fontFamily: 'Inter-Bold',
            textAlign: 'center',
            flex: 1,
          }}
        >
          Transit History
        </Text>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingHorizontal: 16 }}>
  {/* Date Range Filter */}
  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
    {/* Start Date */}
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2A2D3A',
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 6,
        marginRight: 8,
      }}
      onPress={() => setShowStartCalendar(!showStartCalendar)}
    >
      <Ionicons name="calendar" size={16} color="#fff" style={{ marginRight: 4 }} />
      <Text style={{ color: '#9CA3AF', fontSize: 14 }}>
        {startDate || 'Start'}
      </Text>
    </TouchableOpacity>

    {/* End Date */}
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2A2D3A',
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 6,
      }}
      onPress={() => setShowEndCalendar(!showEndCalendar)}
    >
      <Ionicons name="calendar" size={16} color="#fff" style={{ marginRight: 4 }} />
      <Text style={{ color: '#9CA3AF', fontSize: 14 }}>
        {endDate || 'End'}
      </Text>
    </TouchableOpacity>
  </View>

  {/* Grid/List View Toggle */}
  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
    <TouchableOpacity
      style={{
        backgroundColor: '#2A2D3A',
        borderRadius: 8,
        padding: 6,
        marginRight: 8,
      }}
      onPress={() => setViewMode('grid')} // Set to grid view
    >
      <Ionicons name="grid-outline" size={16} color="#fff" />
    </TouchableOpacity>
    <TouchableOpacity
      style={{
        backgroundColor: '#2A2D3A',
        borderRadius: 8,
        padding: 6,
      }}
      onPress={() => setViewMode('list')} // Set to list view
    >
      <Ionicons name="list-outline" size={16} color="#fff" />
    </TouchableOpacity>
  </View>
</View>

{showStartCalendar && (
  <Calendar
    onDayPress={(day: { dateString: string }) => {
      setStartDate(day.dateString);
      setShowStartCalendar(false);
    }}
    markedDates={generateMarkedDates()}
    theme={{
      backgroundColor: '#0f1c2e',
      calendarBackground: '#0f1c2e',
      textSectionTitleColor: '#FFFFFF',
      selectedDayBackgroundColor: '#06B6D4',
      selectedDayTextColor: '#FFFFFF',
      todayTextColor: '#06B6D4',
      dayTextColor: '#FFFFFF',
      textDisabledColor: '#555555',
      arrowColor: '#FFFFFF',
      monthTextColor: '#FFFFFF',
    }}
  />
)}

{showEndCalendar && (
  <Calendar
    onDayPress={(day: { dateString: string }) => {
      setEndDate(day.dateString);
      setShowEndCalendar(false);
    }}
    markedDates={generateMarkedDates()}
    theme={{
      backgroundColor: '#0f1c2e',
      calendarBackground: '#0f1c2e',
      textSectionTitleColor: '#FFFFFF',
      selectedDayBackgroundColor: '#06B6D4',
      selectedDayTextColor: '#FFFFFF',
      todayTextColor: '#06B6D4',
      dayTextColor: '#FFFFFF',
      textDisabledColor: '#555555',
      arrowColor: '#FFFFFF',
      monthTextColor: '#FFFFFF',
    }}
  />
)}

      {/* Recent Fare History */}
      <View style={{ flex: 1, paddingHorizontal: 16 }}>
        <Text style={{ color: '#9CA3AF', fontSize: 16, marginBottom: 8 }}>Recent Fare History</Text>

        {viewMode === 'list' ? (
         <FlatList
            data={filterFareHistory()}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
    <TouchableOpacity onPress={() => handleHistoryClick(item)}>
      <View
        style={{
          backgroundColor: '#2A2D3A',
          borderRadius: 8,
          marginBottom: 16,
          padding: 12,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
            {item.date}
          </Text>
          <Text style={{ color: '#9CA3AF', fontSize: 14, marginTop: 4 }}>
            Origin: {item.fullRouteData?.legs?.[0]?.start_address || 'Unknown'}
          </Text>
          <Text style={{ color: '#9CA3AF', fontSize: 14, marginTop: 4 }}>
            Destination: {item.fullRouteData?.legs?.[0]?.end_address || 'Unknown'}
          </Text>
          <Text style={{ color: '#06B6D4', fontSize: 14, marginTop: 4 }}>
            Fare: {item.fare || 'N/A'}
          </Text>
        </View>
        <TouchableOpacity onPress={() => deleteFareHistory(item.id)}>
          <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )}
/>
        ) : (
          // Grid View (with Map)
          <FlatList
  data={filterFareHistory()}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => (
    <TouchableOpacity onPress={() => handleHistoryClick(item)}>
      <View style={{ backgroundColor: '#2A2D3A', borderRadius: 8, marginBottom: 16, overflow: 'hidden' }}>
        <MapView
          style={{ width: '100%', height: 180 }}
          initialRegion={{
            latitude: item.origin.latitude,
            longitude: item.origin.longitude,
            latitudeDelta: 0.5,
            longitudeDelta: 0.5,
          }}
        >
          <Marker coordinate={item.origin} title="Start" />
          <Marker coordinate={item.destination} title="End" />
          <MapViewDirections
            origin={item.origin}
            destination={item.destination}
            apikey={GOOGLE_MAPS_APIKEY}
            strokeWidth={4}
            strokeColor="blue"
          />
        </MapView>
        <View style={{ padding: 12 }}>
          <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>{item.date}</Text>
          <Text style={{ color: '#9CA3AF', fontSize: 14, marginTop: 4 }}>
            Start: {item.originCoords?.address || item.originCoords?.name || item.originName || item.origin || 'Unknown'}
          </Text>
          <Text style={{ color: '#9CA3AF', fontSize: 14, marginTop: 4 }}>
            End: {item.destinationCoords?.address || item.destinationCoords?.name || item.destinationName || item.destination || 'Unknown'}
          </Text>
          <Text style={{ color: '#06B6D4', fontSize: 14, marginTop: 4 }}>
            Fare: {item.fare || 'N/A'}
          </Text>
          <Text style={{ color: '#9CA3AF', fontSize: 14, marginTop: 4 }}>
            Route: {item.route}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}