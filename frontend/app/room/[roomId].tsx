import {
  View,
  StyleSheet,
  Alert,
  Animated,
  TouchableOpacity,
  Text,
  Dimensions,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import RoomTab from "@/components/RoomTab";
import { useEffect, useState, useRef } from "react";
import { getProtectedData } from "@/lib/apiBackend";
import MapRoom from "@/components/MapRoom";
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MapPin, MessageCircleMore } from "lucide-react-native";
import MapRoomTest from "@/components/MapRoomTest";

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type ActiveTab = 'map' | 'chat';

const Room = () => {
  const { roomId } = useLocalSearchParams() as { roomId: string };
  const [user, setUser] = useState("");
  const [activeTab, setActiveTab] = useState<ActiveTab>('map');
  const [isLoading, setIsLoading] = useState(true);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const tabIndicatorAnim = useRef(new Animated.Value(0)).current;
  const mapOpacity = useRef(new Animated.Value(1)).current;
  const chatOpacity = useRef(new Animated.Value(0)).current;

  console.log("Room ID = ", roomId);

  useEffect(() => {
    async function getData() {
      try {
        const userData = await getProtectedData();
        const { id, name, email } = userData.user;
        setUser(name);
        
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]).start(() => setIsLoading(false));
        
      } catch (error) {
        Alert.alert("Invalid User", "Please sign in to continue");
        router.push("/(auth)/sign-in");
      }
    }

    getData();
  }, []);

  // Animate tab transitions
  useEffect(() => {
    if (activeTab === 'map') {
      Animated.parallel([
        Animated.spring(tabIndicatorAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 150,
          friction: 20,
        }),
        Animated.timing(mapOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(chatOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(tabIndicatorAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 150,
          friction: 20,
        }),
        Animated.timing(mapOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(chatOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [activeTab]);

  const tabIndicatorTranslateX = tabIndicatorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, SCREEN_WIDTH / 2 - 40],
  });

  const handleTabPress = (tab: ActiveTab) => {
    setActiveTab(tab);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={['#161622', '#1a1a2e', '#16213e']}
          style={StyleSheet.absoluteFill}
        />
        <Animated.View style={[styles.loadingContent, { opacity: fadeAnim }]}>
          <View style={styles.loadingSpinner}>
            <Text style={styles.loadingEmoji}>🗺️</Text>
          </View>
          <Text style={styles.loadingText}>Loading Room...</Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={['#161622', '#1a1a2e', '#16213e']}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <BlurView intensity={25} tint="dark" style={styles.header}>
        <Animated.View 
          style={[
            styles.headerContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.roomInfo}>
            <Text style={styles.roomTitle}>Room</Text>
            <Text style={styles.roomId} numberOfLines={1} ellipsizeMode="middle">
              {roomId}
            </Text>
            <Text style={styles.userInfo}>Welcome, {user}</Text>
          </View>
          
          {/* Tab Navigation */}
          <View style={styles.tabContainer}>
            <View style={styles.tabBackground}>
              <Animated.View 
                style={[
                  styles.tabIndicator,
                  { transform: [{ translateX: tabIndicatorTranslateX }] }
                ]} 
              />
              
              <TouchableOpacity
                style={styles.tabButton}
                onPress={() => handleTabPress('map')}
                activeOpacity={0.7}
              >
                <View style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  columnGap: 5
                }}>
                <MapPin color="#64748b" />
                <Text style={[
                  styles.tabText,
                  activeTab === 'map' && styles.tabTextActive
                ]}>
                  Map
                </Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.tabButton}
                onPress={() => handleTabPress('chat')}
                activeOpacity={0.7}
              >
                <View
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    columnGap: 5
                  }}
                >
                <MessageCircleMore color="white" />
                <Text style={[
                  styles.tabText,
                  activeTab === 'chat' && styles.tabTextActive
                ]}>
                  Chat
                </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </BlurView>

      {/* Content Area - Both components always mounted but opacity animated */}
      <View style={styles.content}>
        {/* Map Room - Always mounted but opacity controlled */}
        <Animated.View 
          style={[
            styles.tabContent,
            { 
              opacity: mapOpacity,
              display: activeTab === 'map' ? 'flex' : 'none'
            }
          ]}
          pointerEvents={activeTab === 'map' ? 'auto' : 'none'}
        >
          {roomId && user && (
            // <MapRoom roomId={roomId} username={user} />
            <MapRoomTest roomId={roomId} username={user} />
          )}
        </Animated.View>
        
        {/* Room Tab - Always mounted but opacity controlled */}
        <Animated.View 
          style={[
            styles.tabContent,
            { 
              opacity: chatOpacity,
              display: activeTab === 'chat' ? 'flex' : 'none'
            }
          ]}
          pointerEvents={activeTab === 'chat' ? 'auto' : 'none'}
        >
          {roomId && (
            <RoomTab sender={user} roomId={roomId} />
          )}
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#161622',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingSpinner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  loadingEmoji: {
    fontSize: 36,
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerContent: {
    alignItems: 'center',
  },
  roomInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  roomTitle: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '500',
    marginBottom: 4,
  },
  roomId: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
    maxWidth: '80%',
  },
  userInfo: {
    fontSize: 14,
    color: '#FFA001',
    fontWeight: '500',
  },
  tabContainer: {
    width: '100%',
    alignItems: 'center',
  },
  tabBackground: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 4,
    width: SCREEN_WIDTH - 80,
    maxWidth: 300,
    position: 'relative',
  },
  tabIndicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    width: (SCREEN_WIDTH - 80) / 2 - 8,
    maxWidth: 142,
    backgroundColor: '#FFA001',
    borderRadius: 12,
    shadowColor: '#FFA001',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  tabTextActive: {
    color: '#161622',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  tabContent: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    bottom: 16,
    borderRadius: 20,
    overflow: 'scroll',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
});

export default Room;