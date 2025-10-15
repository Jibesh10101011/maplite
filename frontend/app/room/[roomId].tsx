import {
  View,
  StyleSheet,
  Alert,
  Animated,
  TouchableOpacity,
  Text,
  Dimensions,
  Platform, // Import Platform
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import RoomTab from "@/components/RoomTab";
import { useEffect, useState, useRef } from "react";
import { getProtectedData } from "@/lib/apiBackend";
import MapRoom from "@/components/MapRoom"; // Assuming this is defined
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MapPin, MessageCircleMore, Bot, Users, Sparkles } from "lucide-react-native";
import MapRoomTest from "@/components/MapRoomTest"; // Assuming this is defined
import Chatbot from "@/components/Chatbot"; // Assuming this is defined

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type ActiveTab = 'map' | 'chat' | 'AI Bot';

const Room = () => {
  const { roomId } = useLocalSearchParams() as { roomId: string };
  const [user, setUser] = useState("");
  const [activeTab, setActiveTab] = useState<ActiveTab>('map');
  const [isLoading, setIsLoading] = useState(true);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const tabIndicatorAnim = useRef(new Animated.Value(0)).current;

  // Separate opacity values for each tab
  const mapOpacity = useRef(new Animated.Value(1)).current;
  const chatOpacity = useRef(new Animated.Value(0)).current;
  const aiBotOpacity = useRef(new Animated.Value(0)).current;

  // Initial tab index calculation (for tab indicator on load)
  useEffect(() => {
    if (activeTab === 'map') tabIndicatorAnim.setValue(0);
    if (activeTab === 'chat') tabIndicatorAnim.setValue(1);
    if (activeTab === 'AI Bot') tabIndicatorAnim.setValue(2);
  }, []);

  useEffect(() => {
    async function getData() {
      try {
        const userData = await getProtectedData();
        const { username } = userData;
        setUser(username);

        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 100,
            friction: 8,
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
    let activeOpacity: Animated.Value;
    let otherOpacities: Animated.Value[] = [];
    let tabIndex: number;

    if (activeTab === 'map') {
      activeOpacity = mapOpacity;
      otherOpacities = [chatOpacity, aiBotOpacity];
      tabIndex = 0;
    } else if (activeTab === 'chat') {
      activeOpacity = chatOpacity;
      otherOpacities = [mapOpacity, aiBotOpacity];
      tabIndex = 1;
    } else {
      activeOpacity = aiBotOpacity;
      otherOpacities = [mapOpacity, chatOpacity];
      tabIndex = 2;
    }

    Animated.parallel([
      // Animate the active tab to full opacity
      Animated.timing(activeOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      // Animate the other tabs to zero opacity
      ...otherOpacities.map(opacity =>
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        })
      ),
      // Animate the indicator
      Animated.spring(tabIndicatorAnim, {
        toValue: tabIndex,
        useNativeDriver: true,
        tension: 200,
        friction: 25,
      }),
    ]).start();
  }, [activeTab]);

  const tabIndicatorTranslateX = tabIndicatorAnim.interpolate({
    inputRange: [0, 1, 2],
    // Calculate output ranges based on the tabBackground width (SCREEN_WIDTH - 80) / 3
    outputRange: [0, (SCREEN_WIDTH - 80) / 3 - 12, ((SCREEN_WIDTH - 80) / 3 - 12) * 2],
  });

  const handleTabPress = (tab: ActiveTab) => {
    setActiveTab(tab);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={['#0f0f23', '#161632', '#1e1e42']}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.backgroundOrbs}>
          <View style={[styles.orb, styles.orb1]} />
          <View style={[styles.orb, styles.orb2]} />
          <View style={[styles.orb, styles.orb3]} />
        </View>

        <Animated.View style={[
          styles.loadingContent,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}>
          <View style={styles.loadingSpinner}>
            <Animated.View style={styles.spinnerRing}>
              <Sparkles size={32} color="#FFA001" />
            </Animated.View>
            <Text style={styles.loadingEmoji}>🗺️</Text>
          </View>
          <Text style={styles.loadingText}>Preparing Your Room</Text>
          <Text style={styles.loadingSubtext}>Just a moment...</Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0f0f23', '#161632', '#1e1e42']}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.backgroundOrbs}>
        <View style={[styles.orb, styles.orb1]} />
        <View style={[styles.orb, styles.orb2]} />
        <View style={[styles.orb, styles.orb3]} />
      </View>

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
            <View style={styles.roomTitleContainer}>
              <Text style={styles.roomTitle}>Room Session</Text>
              <View style={styles.activeIndicator}>
                <View style={styles.activeDot} />
                <Text style={styles.activeText}>Live</Text>
              </View>
            </View>
            <View style={styles.roomIdContainer}>
              <Text style={styles.roomId} numberOfLines={1} ellipsizeMode="middle">
                {roomId}
              </Text>
              <TouchableOpacity style={styles.copyButton}>
                <Text style={styles.copyText}>Copy</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.userInfoContainer}>
              <Users size={16} color="#94a3b8" />
              <Text style={styles.userInfo}>Welcome back, {user}</Text>
            </View>
          </View>

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
                activeOpacity={0.8}
              >
                <View style={styles.tabButtonContent}>
                  <MapPin
                    size={18}
                    color={activeTab === 'map' ? '#161622' : '#64748b'}
                  />
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
                activeOpacity={0.8}
              >
                <View style={styles.tabButtonContent}>
                  <MessageCircleMore
                    size={18}
                    color={activeTab === 'chat' ? '#161622' : 'white'}
                  />
                  <Text style={[
                    styles.tabText,
                    activeTab === 'chat' && styles.tabTextActive
                  ]}>
                    Chat
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.tabButton}
                onPress={() => handleTabPress('AI Bot')}
                activeOpacity={0.8}
              >
                <View style={styles.tabButtonContent}>
                  <Bot
                    size={18}
                    color={activeTab === 'AI Bot' ? '#161622' : 'white'}
                  />
                  <Text style={[
                    styles.tabText,
                    activeTab === 'AI Bot' && styles.tabTextActive
                  ]}>
                    AI Bot
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </BlurView>

      <View style={styles.content}>
        {/* Map Room */}
        <Animated.View
          style={[
            StyleSheet.absoluteFillObject,
            styles.tabOuterWrapper, // Apply the decorative styles and padding here
            {
              opacity: mapOpacity,
              transform: [{
                scale: mapOpacity.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.95, 1]
                })
              }],
              zIndex: activeTab === 'map' ? 10 : 1, // Z-index controls visibility order
            }
          ]}
          pointerEvents={activeTab === 'map' ? 'auto' : 'none'}
        >
          <View style={styles.tabInnerContainer}>
            {roomId && user && (
              // Use the actual components here
              // <MapRoom roomId={roomId} username={user} /> 
              // <MapRoomTest roomId={roomId} username={user} />
              <View style={styles.placeholderContent}>
                <MapPin size={48} color="#FFA001" />
                <Text style={styles.placeholderTitle}>Interactive Map</Text>
                <Text style={styles.placeholderText}>Room: {roomId}</Text>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Chat Room (The target for keyboard fix) */}
        <Animated.View
          style={[
            StyleSheet.absoluteFillObject,
            styles.tabOuterWrapper,
            {
              opacity: chatOpacity,
              transform: [{
                scale: chatOpacity.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.95, 1]
                })
              }],
              zIndex: activeTab === 'chat' ? 10 : 1,
            }
          ]}
          pointerEvents={activeTab === 'chat' ? 'auto' : 'none'}
        >
          <View style={styles.tabInnerContainer}>
            {roomId && (
              // RoomTab must have flex: 1 and KeyboardAvoidingView inside it
              <RoomTab sender={user} roomId={roomId} />
            )}
          </View>
        </Animated.View>

        {/* AI Bot */}
        <Animated.View
          style={[
            StyleSheet.absoluteFillObject,
            styles.tabOuterWrapper,
            {
              opacity: aiBotOpacity,
              transform: [{
                scale: aiBotOpacity.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.95, 1]
                })
              }],
              zIndex: activeTab === 'AI Bot' ? 10 : 1,
            }
          ]}
          pointerEvents={activeTab === 'AI Bot' ? 'auto' : 'none'}
        >
          <View style={styles.tabInnerContainer}>
            {roomId && (<Chatbot/>)}
          </View>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f23',
  },
  // --- Loading Styles --- (Omitted for brevity, assume they are correct)
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', },
  backgroundOrbs: { ...StyleSheet.absoluteFillObject, },
  orb: { position: 'absolute', borderRadius: 500, opacity: 0.1, },
  orb1: { width: 300, height: 300, backgroundColor: '#FFA001', top: -100, right: -100, },
  orb2: { width: 200, height: 200, backgroundColor: '#6366f1', bottom: -50, left: -50, },
  orb3: { width: 150, height: 150, backgroundColor: '#10b981', top: '40%', right: '20%', },
  loadingContent: { alignItems: 'center', zIndex: 10, },
  loadingSpinner: { width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255, 255, 255, 0.05)', justifyContent: 'center', alignItems: 'center', marginBottom: 24, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', shadowColor: '#FFA001', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8, },
  spinnerRing: { position: 'absolute', width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: 'rgba(255, 160, 1, 0.3)', justifyContent: 'center', alignItems: 'center', },
  loadingEmoji: { fontSize: 42, },
  loadingText: { color: 'white', fontSize: 22, fontWeight: '700', marginBottom: 8, textShadowColor: 'rgba(255, 255, 255, 0.2)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4, },
  loadingSubtext: { color: '#94a3b8', fontSize: 16, fontWeight: '500', },
  // --- Header Styles ---
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 101,
  },
  headerContent: { alignItems: 'center', },
  roomInfo: { alignItems: 'center', marginBottom: 24, },
  roomTitleContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 12, },
  roomTitle: { fontSize: 14, color: '#94a3b8', fontWeight: '600', letterSpacing: 1, },
  activeIndicator: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(34, 197, 94, 0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, gap: 4, },
  activeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#22c55e', },
  activeText: { fontSize: 10, color: '#22c55e', fontWeight: '700', letterSpacing: 0.5, },
  roomIdContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 12, },
  roomId: { fontSize: 28, fontWeight: 'bold', color: 'white', textAlign: 'center', maxWidth: '60%', textShadowColor: 'rgba(255, 255, 255, 0.1)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4, },
  copyButton: { backgroundColor: 'rgba(255, 255, 255, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.2)', },
  copyText: { color: '#94a3b8', fontSize: 12, fontWeight: '600', },
  userInfoContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, },
  userInfo: { fontSize: 14, color: '#FFA001', fontWeight: '600', },
  tabContainer: { width: '100%', alignItems: 'center', },
  tabBackground: { flexDirection: 'row', backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: 20, padding: 6, width: SCREEN_WIDTH - 80, maxWidth: 350, position: 'relative', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8, },
  tabIndicator: { position: 'absolute', top: 6, bottom: 6, width: (SCREEN_WIDTH - 80) / 3 - 12, maxWidth: 110, backgroundColor: '#FFA001', borderRadius: 14, shadowColor: '#FFA001', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8, },
  tabButton: { flex: 1, paddingVertical: 10, alignItems: 'center', justifyContent: 'center', zIndex: 1, },
  tabButtonContent: { flexDirection: 'row', alignItems: 'center', gap: 6, },
  tabText: { fontSize: 15, fontWeight: '600', color: 'rgba(255, 255, 255, 0.7)', letterSpacing: 0.5, },
  tabTextActive: { color: '#161622', fontWeight: '700', },
  // --- Content Styles (FIXED) ---
  content: {
    flex: 1, // Must take up remaining space
    position: 'relative', // Necessary for absoluteFillObject on children
    // Removed padding from here
  },
  tabOuterWrapper: {
    padding: 16, // Pushes the content away from the edges
  },
  tabInnerContainer: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 24,
    overflow: 'hidden', // Crucial for clipping children (like Map/Chat content)
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  // --- Placeholder Content (Example of child content) ---
  placeholderContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  placeholderTitle: { fontSize: 24, fontWeight: 'bold', color: 'white', marginTop: 16, marginBottom: 8, },
  placeholderText: { fontSize: 16, color: '#94a3b8', textAlign: 'center', },
});

export default Room;