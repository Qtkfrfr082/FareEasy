import axios from 'axios';

const GOOGLE_MAPS_API_KEY = 'AIzaSyDh3IwX1o3v0Ud_YZJUtM_29LIetafzQAY'; // Replace with your actual API key

export const fetchRoute = async (origin: { lat: number; lng: number; }, destination: { lat: number; lng: number; }, mode: string) => {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/directions/json`,
      {
        params: {
          origin: `${origin.lat},${origin.lng}`,
          destination: `${destination.lat},${destination.lng}`,
          key: GOOGLE_MAPS_API_KEY,
          mode: 'transit', // You can change this to 'driving', 'walking', etc.
        },
      }
    );
    return response.data.routes[0]; // Return the first route
  } catch (error) {
    console.error('Error fetching route:', error);
    return null;
  }
};
