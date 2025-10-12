import React from 'react';
import { Tabs } from 'expo-router';
import {
  View,
  Image,
  StyleSheet,
  ImageSourcePropType,
  Animated,
} from 'react-native';

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

export default TabIcon;

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