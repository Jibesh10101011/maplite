import { StyleSheet, Text, View , Image} from 'react-native'
import React,{FC} from 'react'
import { Icons } from '@/constants/icons';


interface RoomProps {
    roomId:string;
};

const Room:FC<RoomProps> = ({roomId}) => {
  return (
    <View className='flex items-center'>
        <Image 
            source={Icons.mapIcon}
            resizeMode='contain'
            tintColor='red'
            className='w-20 h-20 border border-red-500 rounded-lg'
        />
        <Text className='text-white'>{roomId}</Text>
    </View>
  )
}

export default Room

const styles = StyleSheet.create({})