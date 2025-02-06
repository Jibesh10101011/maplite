import { View , Text, ScrollView, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { images } from '../../constants/Images';
import CustomButton from '@/components/CustomButton';
import { Link, Redirect,router } from 'expo-router';


import '../../global.css';
import { handleSignOut } from '@/lib/apiBackend';

export default function HomeScreen() {
  return (
    <SafeAreaView className='bg-primary h-full'>
      <ScrollView contentContainerStyle={{height:"100%",overflow:"scroll"}}>
        <View className='w-full justify-center items-center min-h-[85vh] px-4'>
            <Image
              source={images.maplite}
              className='w-[200px] h-[200px]'
              resizeMode='contain'

            />
            
            <View className='relative mt-5'>
                <Text className='text-3xl text-white font-bold text-center'>Discover Endless Possibilities with&nbsp;<Text className='text-orange-400'>maplite</Text>
                </Text>
                <Image
                  source={images.path}
                  className='w-[136px] h-[15px] absolute -bottom-2 -right-8'
                  resizeMode='contain'
                />
            </View>
            <View className='flex justify-center items-center'>
                <Text className='text-sm mb-2 font-pregular text-gray-100 mt-7 text-center'>Where creativity meets innovation: embark on a journey of limitless exploration with Aora</Text>
                <CustomButton
                    title='Continue with Email'
                    handlePress={()=>router.push("/(auth)/sign-in")}
                    containerStyles='w-full mt-7'  
                />
                <StatusBar backgroundColor='#161622' style='light' />
            </View>
            {/* <View className='flex justify-center items-center mt-5'>
                <CustomButton
                    title='Map View'
                    handlePress={()=>router.push("/(map)/test-map")}
                    containerStyles='w-full mb-2'  
                />
                <StatusBar backgroundColor='#161622' style='light' />
            </View> */}
             <View className='flex justify-around flex-row w-80 items-center mt-5'>
                <CustomButton
                    title='Test Map'
                    handlePress={()=>router.push("/(map)/map-kafka")}
                    containerStyles='mb-2'  
                />
                <CustomButton
                    title='Sign Out'
                    handlePress={handleSignOut}
                    containerStyles='mb-2'  
                />
                <StatusBar backgroundColor='#161622' style='light' />
            </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}