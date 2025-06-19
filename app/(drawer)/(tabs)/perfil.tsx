import CustomHeader from '@/components/customHeader'
import PerfilUsuario from '@/components/perfilUsuario'
import React from 'react'
import { SafeAreaView, StyleSheet } from 'react-native'

const PerfilScreen = () => {
  return (
    <SafeAreaView style={styles.maincontainer}>
      <CustomHeader />
     <PerfilUsuario />
    </SafeAreaView>
  )
}

export default PerfilScreen

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