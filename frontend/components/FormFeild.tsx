import { StyleSheet, Text, TextInput, TouchableOpacity, View, Image } from 'react-native'
import React, { useState } from 'react'
import { Icons } from '../constants/icons'

interface FormFeildProps  {
    title:string;
    value:string;
    placeholder?:string;
    setValue:(value:string) => void;
    otherStyles:string;
    keyboardType?:string;
};

const FormFeild:React.FC<FormFeildProps> = ({title,value,setValue,otherStyles,placeholder,keyboardType}) => {

    const [showPassword,setShowPassword] = useState<boolean>(false);

  return (
    <View className={`space-y-2 ${otherStyles}`}>
      <Text className='text-base text-gray-200 font-pmedium'>{title}</Text>
      <View className='border-2 border-gray-800 w-full h-16 px-4 bg-gray-800 rounded-2xl focus:border-orange-100 items-center flex-row'>
            <TextInput 
                className='flex-1 text-white font-psemibold text-base'
                value={value}
                placeholder={placeholder}
                placeholderTextColor='#7b7b8b'
                onChangeText={setValue}
                secureTextEntry={title === 'Password' && !showPassword}
            />
            {title === 'Password' && (
                <TouchableOpacity
                    onPress={()=>setShowPassword(!showPassword)}
                >
                    <Image 
                        source = {!showPassword ? Icons.eye : Icons.eyeHide}
                        className='h-6 w-6'
                        resizeMode='contain'
                    />
                </TouchableOpacity>
            )}


            
      </View>
    </View>
  )
}

export default FormFeild

const styles = StyleSheet.create({})