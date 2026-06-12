import React from 'react';
import { Dimensions, View, Image, StyleSheet } from 'react-native';

import { AppStackScreenProps } from '../../navigation/navigationTypes';

const ShowImage: React.FC<AppStackScreenProps<'showImage'>> = ({ route }) => {
  const deviceHeight = Dimensions.get('window').height;
  const deviceWidth = Dimensions.get('window').width;

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: route.params?.url || '' }}
        style={{
          height: deviceHeight,
          width: deviceWidth,
        }}
        resizeMode="contain"
      />
    </View>
  );
};

export default ShowImage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // optional for better image viewing
    justifyContent: 'center',
    alignItems: 'center',
  },
});
