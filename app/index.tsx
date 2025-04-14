import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';

const App: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Redirect to the Login screen by default */}
      <Redirect href="/Start/Login" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827', // Add background color
  },
});

export default App;