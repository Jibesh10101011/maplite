import React from 'react';
import { Tabs } from 'expo-router';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ImageSourcePropType,
  Animated,
  Dimensions,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Icons } from '../../constants/icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface TabIconProps {
  icon: ImageSourcePropType;
  color: string;
  label: string;
  focused: boolean;
  iconScale: Animated.Value;
  labelOpacity: Animated.Value;
}

const TabIcon: React.FC<TabIconProps> = ({ 
  icon, 
  color, 
  label, 
  focused, 
  iconScale, 
  labelOpacity 
}) => (
  <View style={styles.tabItem}>
    <Animated.View style={{ transform: [{ scale: iconScale }] }}>
      <Image
        source={icon}
        resizeMode="contain"
        style={[styles.icon, { tintColor: color }]}
      />
    </Animated.View>
    <Animated.Text
      style={[
        styles.tabLabel,
        { 
          color, 
          opacity: labelOpacity,
          fontFamily: focused ? 'Poppins-SemiBold' : 'Poppins-Regular',
        },
      ]}
      numberOfLines={1}
    >
      {label}
    </Animated.Text>
    
    {/* Active indicator dot */}
    {focused && (
      <Animated.View 
        style={[
          styles.activeDot,
          { 
            opacity: labelOpacity,
            transform: [{ scale: iconScale }] 
          }
        ]} 
      />
    )}
  </View>
);

/** Custom Bottom Tab Bar */
const CustomTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  return (
    <View style={styles.tabBarContainer}>
      {/* Background blur effect */}
      <View style={styles.blurBackground} />
      
      <View style={styles.tabBar}>
        <View style={styles.tabRow}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const label = options.title ?? route.name;
            const isFocused = state.index === index;

            const iconScale = React.useRef(new Animated.Value(1)).current;
            const labelOpacity = React.useRef(new Animated.Value(1)).current;

            const onPress = () => {
              // Animation for tab press
              Animated.sequence([
                Animated.timing(iconScale, {
                  toValue: 0.8,
                  duration: 80,
                  useNativeDriver: true,
                }),
                Animated.timing(iconScale, {
                  toValue: 1,
                  duration: 120,
                  useNativeDriver: true,
                }),
              ]).start();

              Animated.timing(labelOpacity, {
                toValue: isFocused ? 1 : 0.7,
                duration: 200,
                useNativeDriver: true,
              }).start();

              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            const color = isFocused ? '#FFA001' : '#8E8E93';
            
            // Icon mapping for all tabs
            const icon =
              route.name === 'index'
                ? Icons.home
                : route.name === 'create'
                ? Icons.plus
                : route.name === 'bookmark'
                ? Icons.bookmark
                : Icons.profile;

            return (
              <TouchableOpacity
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                onPress={onPress}
                style={[
                  styles.tabButton,
                  route.name === 'create' && styles.createTabButton
                ]}
                activeOpacity={0.7}
              >
                <TabIcon 
                  icon={icon} 
                  color={color} 
                  label={label} 
                  focused={isFocused} 
                  iconScale={iconScale}
                  labelOpacity={labelOpacity}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
      
      {/* Safe area spacer */}
      <View style={styles.safeArea} />
    </View>
  );
};

/** Main Tabs Layout */
export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ 
        headerShown: false,
        tabBarHideOnKeyboard: true 
      }}
    >
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Home',
        }} 
      />
      <Tabs.Screen 
        name="create" 
        options={{ 
          title: 'Create',
        }} 
      />
      <Tabs.Screen 
        name="bookmark" 
        options={{ 
          title: 'Saved',
        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{ 
          title: 'Profile',
        }} 
      />
    </Tabs>
  );
}

/** Enhanced Professional Styles */
const styles = StyleSheet.create({
  // Main container with safe area handling
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  
  // Blur background effect
  blurBackground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 90,
    backgroundColor: 'rgba(22, 22, 34, 0.92)',
    backdropFilter: 'blur(20px)',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },

  // Main bar container
  tabBar: {
    backgroundColor: 'transparent',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },

  // Horizontal row of tabs
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },

  // Individual button
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },

  // Create tab special styling (optional)
  createTabButton: {
    // Add any special styling for create tab if needed
  },

  // Icon + label container
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  icon: {
    width: 26,
    height: 26,
    marginBottom: 4,
  },

  tabLabel: {
    fontSize: 11,
    letterSpacing: 0.2,
    marginTop: 2,
  },

  // Active indicator dot
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFA001',
    marginTop: 4,
  },

  // Safe area spacer for devices with notches
  safeArea: {
    height: 20,
    backgroundColor: 'transparent',
  },
});