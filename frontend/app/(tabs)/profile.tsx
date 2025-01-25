import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const Profile = () => {


  return (
    <View>
      <Text style={styles.text}>profile</Text>
        <Text className="text-lg bg-white font-medium">
          Welcome to Tailwind Nice to Meet you
        </Text>
        <Text className='text-2xl bg-red '>I am Jibesh</Text>
    </View>
  )
}

export default Profile

const styles = StyleSheet.create({
    profile : {
        backgroundColor:"#000"
    },
    text : {
        color:"#fff"
    }
})