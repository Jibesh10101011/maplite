import { ScrollView, StyleSheet, Text, View, Image, Alert} from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

import {images} from '../../constants/Images'
import FormFeild from '@/components/FormFeild'
import CustomButton from '@/components/CustomButton'
import {createUser} from "../../lib/apiBackend";

import { Link } from 'expo-router'

const SignUp = () => {

  const [form,setForm] = useState({
    username:'',
    email:'',
    password:''
  });

  const [isSubmitting,setIsSubmitting] = useState<boolean>(false);


  const submit = ()=> {
    try {
      setIsSubmitting(true);
      createUser(form.username,form.email,form.password);
    } catch(error:any) {
      console.log("Error occured during submitting : ",error.message);
      Alert.alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView>
      <ScrollView>
        <View  className='w-full justify-center min-h-[85vh] px-4 my-6 '>
          <View className='flex items-center justify-center'>
            <Image source={images.maplite} 
              resizeMode='contain'
              className='w-[100px] h-[100px]'
            />
          </View>
          <Text className='text-2xl text-white text-semibold mt-10 font-psemibold'>Sign Up to maplite</Text>
          <FormFeild
            title='Username'
            value={form.username}
            setValue={(e)=>setForm({...form,username:e})}
            otherStyles='mt-7'
            keyboardType='username'
          />
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
            title="Sign Up"
            handlePress={submit}
            containerStyles='mt-7'
            isLoading={isSubmitting}
          />

          <View className='justify-center pt-5 flex-row gap-2'>
              <Text className='text-lg text-gray-100 font-pregular'>Already have an account ?</Text>
              <Link href="/(auth)/sign-in" className='text-lg font-psemibold text-orange-400'>
                Sign In
              </Link>

          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default SignUp;
const styles = StyleSheet.create({})