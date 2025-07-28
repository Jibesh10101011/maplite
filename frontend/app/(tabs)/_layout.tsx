import { Tabs } from 'expo-router';
import React from 'react';
import { Text, Image, View } from 'react-native';

import { useColorScheme } from '@/hooks/useColorScheme';
import { Icons } from '../../constants/icons';

interface TabIconProps {
  icon:any,
  color:string,
  name:string,
  focused:boolean
}

const TabIcon = ({icon,color,name,focused} : TabIconProps ) => {
    return (
      <View className='items-center justify-center gap-2'>
        <Image
          source={icon}
          resizeMode='contain'
          tintColor={color}
          className='w-6 h-6'

        />
        <Text className={`${focused ? "font-psemibold" : "font-pregular"} text-xs w-full`} style={{color:color}}>
          {name}
        </Text>
      </View>
    )
}

export default function TabLayout() {

  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#FFA001',
        tabBarInactiveTintColor: '#CDCDE0',
        tabBarStyle : {
          backgroundColor: '#161622',
          borderTopWidth : 1,
          borderTopColor: '#232533',
          height:54,
          paddingTop:10,
          display:"flex",
          justifyContent:"space-between",
          alignItems:"center"
        }
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title:"Home",
          headerShown: false,
          tabBarIcon: ({color,focused}) => (
            <TabIcon 
              icon={Icons.home} 
              color={color}
              name="Home"
              focused={focused}
            />
          )
        }}
      />
      <Tabs.Screen
        name="bookmark"
        options={{
          title:"Bookmark",
          headerShown: false,
          tabBarIcon: ({color,focused}) => (
            <TabIcon 
              icon={Icons.bookmark} 
              color={color}
              name="Bookmark"
              focused={focused}
            />
          )
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title:"Create",
          headerShown: false,
          tabBarIcon: ({color,focused}) => (
            <TabIcon 
              icon={Icons.plus} 
              color={color}
              name="Create"
              focused={focused}
            />
          )
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title:"Profile",
          headerShown: false,
          tabBarIcon: ({color,focused}) => (
            <TabIcon 
              icon={Icons.profile} 
              color={color}
              name="Profile"
              focused={focused}
            />
          )
        }}
      />
      
    </Tabs>
  );
}