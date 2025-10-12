import {
  ScrollView,
  StyleSheet,
  View,
  SafeAreaView,
  Image,
  Alert,
  Animated,
  Easing,
  Dimensions,
  Text,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { images } from "../../constants/Images";
import FormFeild from "@/components/FormFeild";
import Button from "@/components/Button";
import { router } from "expo-router";
import { getProtectedData, handleCreateRoom, handleGenerateRoomId, handleSignIn, handleValidateRoomAndJoin } from "@/lib/apiBackend";
import Dialog from "@/components/Dialog";
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const Create = () => {
  const [isJoining, setIsJoining] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [roomId, setRoomId] = useState<string>("");
  const [isCreating, setIsCreating] = useState({ room: false, generating: false });

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance animations
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

    const fetchUser = async () => {
      try {
        const userData = await getProtectedData();
        console.log("User Data = ", userData);
      } catch (error) {
        router.replace("/(auth)/sign-in");
      }
    };
    fetchUser();
  }, []);

  const animateButtonPress = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleJoinRoom = async () => {
    animateButtonPress();
    try {
      setIsJoining(true);
      const success = await handleValidateRoomAndJoin(roomId);
      setIsJoining(false);
      if (success)
        return router.push(`/room/${roomId}`);
      else
        return router.push(`/(tabs)/create`);
    } catch (error) {
      setIsJoining(false);
      Alert.alert("Invalid Room ID", "Please check the room ID and try again.");
      return router.push("/(tabs)/create");
    }
  };

  const generateRoomId = async () => {
    try {
      setIsCreating({ ...isCreating, generating: true });
      const generatedRoomId = await handleGenerateRoomId();
      setRoomId(generatedRoomId);
      setIsCreating({ ...isCreating, generating: false });
    } catch (error) {
      setRoomId("Error Occurred");
      setIsCreating({ ...isCreating, generating: false });
    }
  };

  const createRoom = async () => {
    try {
      setIsCreating({ ...isCreating, room: true });
      const success = await handleCreateRoom(roomId);
      console.log("Success = ", success);
      setIsCreating({ ...isCreating, room: false });
      if (success) {
        return router.push(`/room/${roomId}`);
      } else {
        Alert.alert("Room ID Taken", "This Room ID is already in use. Please create a different Room ID.");
        return router.push('/(tabs)/create');
      }
    } catch (error) {
      setIsCreating({ ...isCreating, room: false });
      Alert.alert("Error", "Something went wrong! Please try again.");
      return router.push('/(tabs)/create');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={['#161622', '#1a1a2e', '#16213e']}
        style={StyleSheet.absoluteFill}
      />

      {/* Animated Background Elements */}
      <View style={styles.backgroundElements}>
        <Animated.View
          style={[
            styles.floatingCircle,
            styles.circle1,
            {
              opacity: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 0.6]
              })
            }
          ]}
        />
        <Animated.View
          style={[
            styles.floatingCircle,
            styles.circle2,
            {
              opacity: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.2, 0.4]
              })
            }
          ]}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentWrapper}>
          
          {/* Header Section */}
          <Animated.View
            style={[
              styles.headerSection,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { scale: scaleAnim }
                ]
              }
            ]}
          >
            <View style={styles.logoContainer}>
              <Image
                source={images.maplite}
                resizeMode="contain"
                style={styles.logo}
              />
              <View style={styles.logoGlow} />
            </View>

            <View style={styles.titleContainer}>
              <Text style={styles.title}>Create or Join Room</Text>
              <Text style={styles.subtitle}>
                Collaborate in real-time with your team
              </Text>
              <View style={styles.titleUnderline} />
            </View>
          </Animated.View>

          {/* Form Section */}
          <Animated.View
            style={[
              styles.formSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View style={styles.formCard}>
              <FormFeild
                title="Room ID"
                value={roomId}
                setValue={(e) => setRoomId(e)}
                otherStyles="mt-2"
                placeholder="Enter room ID or generate one"
                keyboardType="default"
              />

              {/* Quick Actions Row */}
              <View style={styles.quickActions}>
                <Button
                  title="Generate ID"
                  handlePress={generateRoomId}
                  containerStyles={styles.generateButton}
                  textStyles={styles.generateButtonText}
                  isLoading={isCreating.generating}
                />
                <View style={styles.quickActionDivider}>
                  <Text style={styles.dividerText}>OR</Text>
                </View>
                <Text style={styles.quickActionHint}>
                  Enter an existing room ID to join
                </Text>
              </View>

              {/* Main Action Buttons */}
              <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                <Button
                  title="Join Room"
                  handlePress={handleJoinRoom}
                  containerStyles={styles.joinButton}
                  textStyles={styles.joinButtonText}
                  isLoading={isJoining}
                />
              </Animated.View>

              <View style={styles.buttonDivider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>Create New Room</Text>
                <View style={styles.dividerLine} />
              </View>

              <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                <Button
                  title="✨ Create Room"
                  handlePress={() => setShowDialog(true)}
                  containerStyles={styles.createButton}
                  textStyles={styles.createButtonText}
                  isLoading={false}
                />
              </Animated.View>
            </View>
          </Animated.View>

          {/* Features Grid */}
          <Animated.View
            style={[
              styles.featuresSection,
              { opacity: fadeAnim }
            ]}
          >
            <Text style={styles.featuresTitle}>Why Use Rooms?</Text>
            <View style={styles.featuresGrid}>
              <View style={styles.featureCard}>
                <View style={[styles.featureIcon, { backgroundColor: 'rgba(34, 197, 94, 0.2)' }]}>
                  <Text style={[styles.featureIconText, { color: '#22c55e' }]}>👥</Text>
                </View>
                <Text style={styles.featureTitle}>Real-time Collaboration</Text>
                <Text style={styles.featureDescription}>Work together seamlessly</Text>
              </View>

              <View style={styles.featureCard}>
                <View style={[styles.featureIcon, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
                  <Text style={[styles.featureIconText, { color: '#3b82f6' }]}>🔒</Text>
                </View>
                <Text style={styles.featureTitle}>Secure Rooms</Text>
                <Text style={styles.featureDescription}>Private and protected</Text>
              </View>

              <View style={styles.featureCard}>
                <View style={[styles.featureIcon, { backgroundColor: 'rgba(168, 85, 247, 0.2)' }]}>
                  <Text style={[styles.featureIconText, { color: '#a855f7' }]}>⚡</Text>
                </View>
                <Text style={styles.featureTitle}>Instant Setup</Text>
                <Text style={styles.featureDescription}>Get started in seconds</Text>
              </View>
            </View>
          </Animated.View>
        </View>
      </ScrollView>

      {/* Dialog Component */}
      <Dialog
        visible={showDialog}
        title="Create New Room"
        message="Ready to create your collaboration space?"
        onDismiss={() => setShowDialog(false)}
        buttons={[
          {
            text: "Cancel",
            onPress: () => console.log("Room creation canceled"),
            // style: "cancel"
          },
          {
            text: "Create Room",
            onPress: () => createRoom(),
            // style: "confirm"
          },
        ]}
        generateRoomId={generateRoomId}
        roomId={roomId}
        setRoomId={setRoomId}
        isCreating={isCreating}
        setIsCreating={setIsCreating}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#161622',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  backgroundElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  floatingCircle: {
    position: 'absolute',
    borderRadius: 500,
  },
  circle1: {
    top: -100,
    right: -80,
    width: 300,
    height: 300,
    backgroundColor: '#FF6B00',
  },
  circle2: {
    bottom: -120,
    left: -100,
    width: 250,
    height: 250,
    backgroundColor: '#8B5CF6',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  logo: {
    width: 120,
    height: 120,
  },
  logoGlow: {
    position: 'absolute',
    top: '25%',
    left: '25%',
    width: '50%',
    height: '50%',
    backgroundColor: '#FFA001',
    borderRadius: 60,
    opacity: 0.3,
    // blurRadius: 20,
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 22,
  },
  titleUnderline: {
    width: 60,
    height: 4,
    backgroundColor: '#FFA001',
    borderRadius: 2,
  },
  formSection: {
    width: '100%',
    maxWidth: 400,
  },
  formCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  quickActions: {
    marginTop: 16,
    marginBottom: 24,
  },
  generateButton: {
    backgroundColor: 'rgba(255, 160, 1, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 160, 1, 0.3)',
    paddingVertical: 12,
    borderRadius: 12,
  },
  generateButtonText: {
    color: '#FFA001',
    fontSize: 14,
    fontWeight: '600',
  },
  quickActionDivider: {
    alignItems: 'center',
    marginVertical: 16,
  },
  buttonDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  dividerText: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '500',
    marginHorizontal: 12,
    textTransform: 'uppercase',
  },
  quickActionHint: {
    color: '#94a3b8',
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  joinButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  joinButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  createButton: {
    backgroundColor: '#FFA001',
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: '#FFA001',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  featuresSection: {
    width: '100%',
    maxWidth: 400,
    marginTop: 40,
    marginBottom: 100
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  featuresGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  featureCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  featureIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  featureIconText: {
    fontSize: 20,
  },
  featureTitle: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  featureDescription: {
    color: '#94a3b8',
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 14,
  },
});

export default Create;