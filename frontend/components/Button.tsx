import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle, TextStyle } from 'react-native'
import React from 'react'

interface CustomButtonProps {
    title: string,
    handlePress: () => void,
    containerStyles?: ViewStyle | ViewStyle[],
    textStyles?: TextStyle | TextStyle[],
    isLoading?: boolean
}

const Button: React.FC<CustomButtonProps> = ({ 
    title, 
    handlePress, 
    containerStyles, 
    textStyles, 
    isLoading 
}) => {
  return (
    <TouchableOpacity 
        onPress={handlePress}
        activeOpacity={0.7}
        style={[
          styles.button, 
          containerStyles, 
          isLoading && styles.disabled
        ]}
        disabled={isLoading}
    >
        {isLoading ? (
            <ActivityIndicator size="small" color="#161622" />
        ) : (
            <Text style={[styles.buttonText, textStyles]}>
                {title}
            </Text>
        )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#FFA001',
    padding: 16,
    borderRadius: 12,
    minHeight: 62,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: '#161622',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.6,
  }
})

export default Button;