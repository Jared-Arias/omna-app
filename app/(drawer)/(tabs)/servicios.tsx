import CustomHeader from '@/components/customHeader'
import React from 'react'
import { SafeAreaView, StyleSheet, Text, View } from 'react-native'

const ServiciosScreen = () => {
  return (
    <SafeAreaView style={styles.maincontainer}>
      <CustomHeader />
      <View style={styles.container}>
        <Text style={styles.title}>ServiciosScreen</Text>
      </View>
    </SafeAreaView>
  )
}

export default ServiciosScreen

const styles = StyleSheet.create({
    maincontainer: {
        flex: 1,
        backgroundColor: '#FAF6ED',
    },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAF6ED',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
})