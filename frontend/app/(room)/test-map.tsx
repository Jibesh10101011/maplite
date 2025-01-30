import { ScrollView, StyleSheet, Text, View, Image} from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

import {images} from '../../constants/Images'
import FormFeild from '@/components/FormFeild'
import CustomButton from '@/components/CustomButton'

import { Link } from 'expo-router'

const TestMap = () => {

  const [form,setForm] = useState({
    email:'',
    password:''
  });

  const [isSubmitting,setIsSubmitting] = useState<boolean>(false);


  const submit = ()=> {

  }

  return (
    <SafeAreaView>
      <ScrollView>
        <View  className='w-full justify-center min-h-[85vh] px-4 my-6 '>
            <Text className='text-gray-100'>Nice to meet you</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default TestMap;

const styles = StyleSheet.create({})