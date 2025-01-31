import { FlatList, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import React from 'react';
import Room from '@/components/Room';

const Profile = () => {
  const rooms = ["134e5", "34dejd", "er3423", "12wkww", "23ekdkd","34dejd", "er3423","23ekdkd","34dejd", "er3423", "12wkww","34dejd", "er3423", "12wkww","34dejd", "er3423", "12wkww","12wkww"];
  const { width } = useWindowDimensions();
  
  // Define minimum width per item
  const itemWidth = 120; 
  const numColumns = Math.max(1, Math.floor(width / itemWidth));

  return (
    <View style={styles.container}>
      <Text className='text-gray-100 text-3xl bg-gray-900 m-2 p-4 rounded-lg'>Rooms</Text>
      <FlatList
        data={rooms}
        renderItem={({ item }) => (
          <View style={[styles.roomContainer, { width: width / numColumns - 10 }]}>
            <Room roomId={item} />
          </View>
        )}
        key={numColumns} // Forces re-render when numColumns changes
        keyExtractor={(item, index) => index.toString()}
        numColumns={numColumns}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop:50
  },
  listContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  roomContainer: {
    margin: 4,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#161622",
  },
});
