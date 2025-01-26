import { ScrollView, StyleSheet, Text, View, Image, Alert} from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

import {images} from '../../constants/Images'
import FormFeild from '@/components/FormFeild'
import CustomButton from '@/components/CustomButton'

import { Link, router } from 'expo-router'
import { handleSignIn } from '@/lib/apiBackend'

const SignIn = () => {

  const [form,setForm] = useState({
    email:'',
    password:''
  });

  const [isSubmitting,setIsSubmitting] = useState<boolean>(false);


  const submit = async()=> {
    try {
      setIsSubmitting(true);
      if(!form.email.length && !form.password.length) {
        Alert.alert("Fill all the Input Field correctly");
        return;
      }
      await handleSignIn(form.email,form.password);
    } catch(error) {
      setIsSubmitting(false);
      Alert.alert("Error during SignIn");
    } finally { 
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView>
      <ScrollView>
        <View  className='w-full justify-center min-h-[85vh] px-4 my-6 '>
          <View className='flex items-center justify-center'>
            <Image 
              source={images.maplite} 
              resizeMode='contain'
              className='w-[100px] h-[100px]'
            />
          </View>
          <Text className='text-2xl text-white text-semibold mt-10 font-psemibold'>Log in to maplite</Text>
          <FormFeild
            title='Email'
            value={form.email}
            setValue={(e)=>setForm({...form,email:e})}
            otherStyles='mt-7'
            keyboardType='email-address'
          />
          <FormFeild
            title='Password'
            value={form.password}
            setValue={(e)=>setForm({...form,password:e})}
            otherStyles='mt-7'
          />
          <CustomButton
            title="Sign In"
            handlePress={submit}
            containerStyles='mt-7'
            isLoading={isSubmitting}
          />

          <View className='justify-center pt-5 flex-row gap-2'>
              <Text className='text-lg text-gray-100 font-pregular'>Don't have account ?</Text>
              <Link href="/(auth)/sign-up" className='text-lg font-psemibold text-orange-400'>
                Sign Up
              </Link>

          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default SignIn;

const styles = StyleSheet.create({})