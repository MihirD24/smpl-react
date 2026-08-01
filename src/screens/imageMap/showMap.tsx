import { View, StyleSheet, Image, TouchableOpacity, useColorScheme, SafeAreaView, Platform, StatusBar } from 'react-native';
import React, { useState } from 'react';
import MapView, { Marker } from 'react-native-maps';
import { AppStackScreenProps } from '../../navigation/navigationTypes';
import { ChevronLeft } from 'lucide-react-native';

const ShowMap: React.FC<AppStackScreenProps<'showMap'>> = ({ navigation, route }) => {
  const isDarkMode = useColorScheme() === 'dark';
  const theme = {
    screenBg: isDarkMode ? '#111827' : '#F6FAFF',
    title: isDarkMode ? '#F9FAFB' : '#111827',
    backBtnBg: isDarkMode ? 'rgba(31, 41, 55, 0.9)' : 'rgba(255, 255, 255, 0.9)',
    shadowColor: isDarkMode ? '#000000' : '#000000',
  };

  const [lat, setLat] = useState(route.params.lat);
  const [long, setLong] = useState(route.params.long);

  return (
    <View style={[styles.container, { backgroundColor: theme.screenBg }]}>
      <MapView
        style={styles.mapContainer}
        region={{
          latitude: lat,
          longitude: long,
          latitudeDelta: 0.015,
          longitudeDelta: 0.0121,
        }}
        showsUserLocation={false}
        followsUserLocation={true}
      >
        <Marker coordinate={{ latitude: lat, longitude: long }}>
          <View style={styles.markerView}>
            <Image
              source={require('../../assets/images/profile.png')}
              style={styles.markerImage}
            />
          </View>
        </Marker>
      </MapView>

      <SafeAreaView style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
          style={[styles.backButton, { backgroundColor: theme.backBtnBg }]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ChevronLeft
            size={24}
            color={theme.title}
            strokeWidth={2.5}
          />
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    width: '100%',
    position: 'relative',
  },
  mapContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  headerContainer: {
    position: 'absolute',
    top: Platform.OS === 'android' ? (StatusBar.currentHeight || 20) + 10 : 10,
    left: 16,
    zIndex: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  markerView: {
    height: 30,
    width: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerImage: {
    height: 30,
    width: 30,
  },
});
export default ShowMap;
