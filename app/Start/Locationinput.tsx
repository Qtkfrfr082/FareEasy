import React from 'react';
import { View } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

type Props = {
  onSetStart: (loc: { latitude: number; longitude: number }) => void;
  onSetEnd: (loc: { latitude: number; longitude: number }) => void;
  onCalculateRoute: () => void;
};

const LocationInput: React.FC<Props> = ({ onSetStart, onSetEnd, onCalculateRoute }) => {
  return (
    <View className="px-4 pt-2">
      <GooglePlacesAutocomplete
        placeholder="Start Location"
        fetchDetails
        onPress={(data, details = null) => {
          if (details?.geometry?.location) {
            const { lat, lng } = details.geometry.location;
            onSetStart({ latitude: lat, longitude: lng });
          }
        }}
        query={{
          key: 'YOUR_GOOGLE_API_KEY',
          language: 'en',
        }}
        styles={{ textInput: { backgroundColor: 'white', borderRadius: 8, marginBottom: 10 } }}
      />
      <GooglePlacesAutocomplete
        placeholder="Destination"
        fetchDetails
        onPress={(data, details = null) => {
          if (details?.geometry?.location) {
            const { lat, lng } = details.geometry.location;
            onSetEnd({ latitude: lat, longitude: lng });
            onCalculateRoute();
          }
        }}
        query={{
          key: 'YOUR_GOOGLE_API_KEY',
          language: 'en',
        }}
        styles={{ textInput: { backgroundColor: 'white', borderRadius: 8 } }}
      />
    </View>
  );
};

export default LocationInput;
