import { View, Text, ScrollView, Image, Animated, Easing } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { images } from '../../constants/Images';
import CustomButton from '@/components/CustomButton';
import { Link, Redirect, router } from 'expo-router';
import { handleSignOut } from '@/lib/apiBackend';
import { useEffect, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

export default function HomeScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Staggered animations on mount
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();

    // Subtle floating animation for the logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '5deg'],
  });

  const floatingInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  return (
    <SafeAreaView className='bg-primary h-full'>
      <LinearGradient
        colors={['#161622', '#1a1a2e', '#16213e']}
        className='absolute top-0 left-0 right-0 bottom-0'
      />
      
      {/* Animated Background Elements */}
      <View className='absolute top-0 left-0 right-0 bottom-0 overflow-hidden'>
        <Animated.View 
          style={{ 
            opacity: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.3, 0.6]
            }) 
          }}
          className='absolute -top-20 -right-20 w-60 h-60 bg-orange-400 rounded-full'
        />
        <Animated.View 
          style={{ 
            opacity: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.2, 0.4]
            }) 
          }}
          className='absolute -bottom-32 -left-32 w-80 h-80 bg-purple-500 rounded-full'
        />
      </View>

      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View className='w-full justify-center items-center min-h-[85vh] px-6 py-8'>
          
          {/* Logo Section with Animation */}
          <Animated.View 
            style={{
              opacity: fadeAnim,
              transform: [
                { translateY: floatingInterpolate },
                { scale: scaleAnim },
                { rotate: rotateInterpolate }
              ]
            }}
            className='mb-8'
          >
            <View className='relative'>
              <Image
                source={images.maplite}
                className='w-[180px] h-[180px]'
                resizeMode='contain'
              />
              {/* Glow effect */}
              <View className='absolute inset-0 bg-orange-400 rounded-full opacity-20 blur-xl' />
            </View>
          </Animated.View>

          {/* Hero Text Section */}
          <Animated.View 
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }}
            className='relative mb-8'
          >
            <View className='relative'>
              <Text className='text-4xl text-white font-bold text-center leading-tight'>
                Discover Endless{'\n'}
                Possibilities with{' '}
                <Text className='text-orange-400'>maplite</Text>
              </Text>
              
              {/* Animated underline */}
              <Animated.View 
                style={{ opacity: fadeAnim }}
                className='absolute -bottom-4 -right-4'
              >
                <Image
                  source={images.path}
                  className='w-[160px] h-[18px]'
                  resizeMode='contain'
                />
              </Animated.View>
            </View>
          </Animated.View>

          {/* Description Text */}
          <Animated.View 
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }}
            className='mb-8'
          >
            <Text className='text-lg text-gray-300 font-pregular text-center leading-6 max-w-[320px]'>
              Where creativity meets innovation: embark on a journey of limitless exploration with Maplite
            </Text>
          </Animated.View>

          {/* Main CTA Button */}
          <Animated.View 
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }}
            className='w-full mb-6'
          >
            <CustomButton
              title='Continue with Email'
              handlePress={() => router.push("/(auth)/sign-in")}
              containerStyles='w-full py-4 rounded-2xl shadow-2xl shadow-orange-400/30'
              textStyles='text-lg font-psemibold'
            />
          </Animated.View>

          {/* Feature Cards Section */}
          <Animated.View 
            style={{ opacity: fadeAnim }}
            className='w-full mb-8'
          >
            <View className='flex-row justify-between space-x-4 gap-1'>
              <View className='flex-1 bg-white/5 rounded-2xl p-4 border border-white/10'>
                <View className='w-10 h-10 bg-orange-400/20 rounded-lg mb-3 items-center justify-center'>
                  <Text className='text-orange-400 text-lg'>🗺️</Text>
                </View>
                <Text className='text-white font-psemibold text-sm mb-1'>Smart Maps</Text>
                <Text className='text-gray-400 text-xs'>Intelligent navigation</Text>
              </View>

              <View className='flex-1 bg-white/5 rounded-2xl p-4 border border-white/10'>
                <View className='w-10 h-10 bg-purple-500/20 rounded-lg mb-3 items-center justify-center'>
                  <Text className='text-purple-400 text-lg'>⚡</Text>
                </View>
                <Text className='text-white font-psemibold text-sm mb-1'>Fast & Reliable</Text>
                <Text className='text-gray-400 text-xs'>Lightning quick results</Text>
              </View>

              <View className='flex-1 bg-white/5 rounded-2xl p-4 border border-white/10'>
                <View className='w-10 h-10 bg-blue-500/20 rounded-lg mb-3 items-center justify-center'>
                  <Text className='text-blue-400 text-lg'>🔍</Text>
                </View>
                <Text className='text-white font-psemibold text-sm mb-1'>Explore</Text>
                <Text className='text-gray-400 text-xs'>Discover new places</Text>
              </View>
            </View>
          </Animated.View>

          {/* Action Buttons */}
          <Animated.View 
            style={{ opacity: fadeAnim }}
            className='w-full'
          >
            <View className='bg-white/5 rounded-3xl p-6 border border-white/10'>
              <Text className='text-white font-psemibold text-center mb-4 text-lg'>
                Quick Actions
              </Text>
              
              <View className='space-y-3 gap-2'>
                <CustomButton
                  title='Explore Map'
                  handlePress={() => router.push("/(tabs)/profile")}
                  containerStyles='bg-orange-400/20 border border-orange-400/30 py-3 rounded-xl'
                  textStyles='text-orange-400 font-psemibold'
                />
                
                <CustomButton
                  title='Sign Out'
                  handlePress={handleSignOut}
                  containerStyles='bg-white/10 border border-white/20 py-3 rounded-xl'
                  textStyles='text-white font-psemibold'
                />
              </View>
            </View>
          </Animated.View>

          {/* Footer Text */}
          <Animated.View 
            style={{ opacity: fadeAnim }}
            className='mt-8'
          >
            <Text className='text-gray-500 text-sm text-center'>
              Join thousands exploring with Maplite
            </Text>
          </Animated.View>
        </View>
      </ScrollView>

      <StatusBar backgroundColor='#161622' style='light' />
    </SafeAreaView>
  );
}