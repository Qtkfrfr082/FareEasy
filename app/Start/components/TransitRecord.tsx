import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StatusBar, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import { Calendar } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Animated } from 'react-native';
const GOOGLE_MAPS_APIKEY = '';


export default function RideWise() {
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    'Inter-Bold': require('../../../assets/fonts/Inter_18pt-Bold.ttf'),
    'Inter-Regular': require('../../../assets/fonts/Inter_18pt-Regular.ttf'),
  });
const SlideInItem = React.memo(({ children, index }: { children: React.ReactNode; index: number }) => {
  const translateX = useRef(new Animated.Value(60)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: 0,
        duration: 350,
        delay: index * 60,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 350,
        delay: index * 60,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index, translateX, opacity]);

  return (
    <Animated.View style={{ transform: [{ translateX }], opacity }}>
      {children}
    </Animated.View>
  );
});
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  // Convert fareHistory to state
  const [fareHistory, setFareHistory] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 10; 


  const fetchTransitHistory = async (reset = false) => {
  const userId = await AsyncStorage.getItem('user_id');
  if (!userId) {
    Alert.alert('Error', 'User not logged in.');
    return;
  }
  if (loadingMore) return;
  setLoadingMore(true);

  // For cursor-based pagination, send last item's date or id
  const lastItem = !reset && fareHistory.length > 0 ? fareHistory[fareHistory.length - 1] : null;
  const lastDate = lastItem ? lastItem.date : undefined;

  let url = `https://donewithit-yk99.onrender.com/get-transit?user_id=${userId}&limit=${PAGE_SIZE}`;
  if (lastDate) url += `&lastDate=${lastDate}`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data.transit)) {
        const newData = data.transit.map((item: any) => {
          const legs = item.fullRouteData?.legs || [];
          const startLoc = legs[0]?.start_location;
          const endLoc = legs[legs.length - 1]?.end_location;
          return {
            id: item.transit_id || item.id,
            date: item.date ? item.date.slice(0, 10) : '',
            route: `${legs[0]?.start_address || ''} - ${legs[legs.length - 1]?.end_address || ''}`,
            origin: startLoc
              ? { latitude: startLoc.lat, longitude: startLoc.lng }
              : { latitude: 0, longitude: 0 },
            destination: endLoc
              ? { latitude: endLoc.lat, longitude: endLoc.lng }
              : { latitude: 0, longitude: 0 },
            fare: item.totalFare ? `₱${Number(item.totalFare).toFixed(0)}` : '',
            passengerType: item.passengerType || 'Regular',
            legs,
            fullRouteData: item.fullRouteData || item,
          };
        });
        setFareHistory(reset ? newData : [...fareHistory, ...newData]);
        setHasMore(newData.length === PAGE_SIZE);
      }
      setLoadingMore(false);
    })
    .catch((error) => {
      Alert.alert('Error', 'Failed to fetch transit history.');
      setLoadingMore(false);
      console.error(error);
    });
};
           
  useEffect(() => {
      fetchTransitHistory(true); // true = reset
    }, []);

  const filterFareHistory = () => {
    if (!startDate || !endDate) return fareHistory;
    return fareHistory.filter(
      (item) => item.date >= startDate && item.date <= endDate
    );
  };

  // Delete function
  const deleteFareHistory = async (id: string) => {
  Alert.alert(
    'Delete Confirmation',
    'Are you sure you want to delete this record?',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          // Remove from local state
          console.log('Deleting transit_id:', id); // <-- Add this
          setFareHistory((prev) => prev.filter((item) => item.id !== id));
          // Remove from backend
          const userId = await AsyncStorage.getItem('user_id');
          if (userId) {
            fetch('https://donewithit-yk99.onrender.com/delete-transit', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ user_id: userId, transit_id: id }),
            });
          }
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

  

  router.push({
    pathname: './Routing',
    params: { 
      routeData: JSON.stringify(routeData),
      passengerType: item.passengerType || 'Regular',
    }
  });
};

  const renderListItem = useCallback(
    ({ item, index }: { item: any; index: number }) => (
      <SlideInItem index={index}>
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
                Fare: {item.fare || '₱0'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => deleteFareHistory(item.id)}
              style={{ padding: 16, borderRadius: 24, alignItems: 'center', justifyContent: 'center' }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </SlideInItem>
    ),
    [handleHistoryClick, deleteFareHistory]
  );

  const renderGridItem = useCallback(
    ({ item, index }: { item: any; index: number }) => (
      <SlideInItem index={index}>
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
           
            <MapViewDirections
              origin={item.origin}
              destination={item.destination}
              apikey={GOOGLE_MAPS_APIKEY}
              strokeWidth={4}
              strokeColor="blue"
            /> 
            <Marker coordinate={item.origin} title="Start" />
            <Marker coordinate={item.destination} title="End" />
          </MapView>
          
          <View style={{ padding: 12 }}> 
            <TouchableOpacity onPress={() => handleHistoryClick(item)}>
            <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>{item.date}</Text>
           <Text style={{ color: '#9CA3AF', fontSize: 14, marginTop: 4 }}>
  Start: {
    item.originCoords?.address ||
    item.originCoords?.name ||
    item.originName ||
    item.fullRouteData?.legs?.[0]?.start_address ||
    (typeof item.origin === 'string'
      ? item.origin
      : (item.origin && typeof item.origin.latitude === 'number' && typeof item.origin.longitude === 'number')
        ? `${item.origin.latitude}, ${item.origin.longitude}`
        : 'Unknown')
  }
</Text>
<Text style={{ color: '#9CA3AF', fontSize: 14, marginTop: 4 }}>
  End: {
    item.destinationCoords?.address ||
    item.destinationCoords?.name ||
    item.destinationName ||
    item.fullRouteData?.legs?.[0]?.end_address ||
    (typeof item.destination === 'string'
      ? item.destination
      : (item.destination && typeof item.destination.latitude === 'number' && typeof item.destination.longitude === 'number')
        ? `${item.destination.latitude}, ${item.destination.longitude}`
        : 'Unknown')
  }
</Text>
            <Text style={{ color: '#06B6D4', fontSize: 14, marginTop: 4 }}>
              Fare: {item.fare || '₱0'}
            </Text>
            </TouchableOpacity>
          </View> 
        </View>
      </SlideInItem>
    ),
    [handleHistoryClick]
  );

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
           renderItem={renderListItem}
           onEndReached={() => {
    if (hasMore && !loadingMore) fetchTransitHistory();
  }}
  onEndReachedThreshold={0.5}
  ListFooterComponent={
    loadingMore ? (
      <View style={{ padding: 16, alignItems: 'center' }}>
        <Text style={{ color: '#9CA3AF' }}>Loading more...</Text>
      </View>
    ) : null
  }
          />
        ) : (
          // Grid View (with Map)
          <FlatList
  data={filterFareHistory()}
  keyExtractor={(item) => item.id}
  renderItem={renderGridItem}
          />
        )}
      </View>
      
    </SafeAreaView>
  );
}