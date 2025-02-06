import { TouchableOpacity , Text } from 'react-native'
import React from 'react'
import { isLoading } from 'expo-font'

interface CustomButtonProps {
    title:string,
    handlePress : () => void,
    containerStyles?:string,
    textStyles?:string,
    isLoading?:boolean

};

const CustomButton:React.FC<CustomButtonProps> = ({title,handlePress,containerStyles,textStyles,isLoading}) => {
  return (
    <TouchableOpacity 
        onPress={handlePress}
        activeOpacity={0.7}
        className={`bg-orange-400 p-3 rounded-xl min-h-[62px] justify-center items-center ${containerStyles} ${isLoading ? 'opacity-50' : ''}`}
        disabled={isLoading}
        >
        <Text className={`text-primary font-psemibold text-lg  ${textStyles}`}>{isLoading ? "loading..." : title}</Text>
    </TouchableOpacity>
  )
}

export default CustomButton

