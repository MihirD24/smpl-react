import { View, StyleSheet, Image } from 'react-native';
import React, { useState } from 'react';
import MapView, { Marker } from 'react-native-maps';
import { AppStackScreenProps } from '../../navigation/navigationTypes';

const ShowMap: React.FC<AppStackScreenProps<'showMap'>> = ({ route }) => {
  const [lat, setLat] = useState(route.params.lat);
  const [long, setLong] = useState(route.params.long);
  console.log('lat', lat);
  return (
    <View style={styles.container}>
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
          <View
            style={{
              height: 30,
              width: 30,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Image
              source={require('../../assets/images/profile.png')}
              style={{ height: 30, width: 30 }}
            />
          </View>
        </Marker>
      </MapView>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
 mapContainer: {
    height: '100%',
     width: '100%',
     overflow: 'hidden',
     alignSelf: 'center',
   },
});
export default ShowMap;
