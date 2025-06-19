import { useAppSelector } from '@/redux/hooks';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import React from 'react';
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CustomHeaderProps {
  userName?: string;
  avatarUri?: string;
  onMenuPress?: () => void;
}

const CustomHeader: React.FC<CustomHeaderProps> = ({
  userName = 'Daniel',
  avatarUri,
  onMenuPress
}) => {
  // Icono de estado online (punto verde)
  const OnlineStatusDot = () => (
    <View style={styles.onlineStatus} />
  );
  
  const navigation = useNavigation();
  const { user, userData} = useAppSelector(state => state.client);
  
  return (
    <View style={styles.header}>
      {/* Menú Hamburguesa */}
      <TouchableOpacity 
        onPress={()=>{navigation.dispatch(DrawerActions.toggleDrawer())}} 
        style={styles.menuButton}
      >
        <Image
          source={require('@/assets/images/principal/drawer.png')}
          style={styles.menuIconHeader}
        />
      </TouchableOpacity>
      
      {/* Texto de bienvenida centrado */}
      <View style={styles.welcomeTextContainer}>
        <Text style={styles.welcomeText}>Bienvenid@: </Text>
        <Text style={styles.userName}>{userData.first_name}</Text>
      </View>
      
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require('@/assets/images/principal/logo.png')}
          style={styles.logo}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  menuIconHeader: {
    width: 33,
    height: 33,
    resizeMode: 'contain',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAF6ED',
    paddingHorizontal: 10,
    paddingVertical: 8,
    height: 70,
    paddingBottom: 10,
    marginTop: Platform.OS === 'android' ? 36 : 0
  },
  menuButton: {
    padding: 5,
    width: 43, // Ancho fijo para equilibrar con el logo
  },
  logoContainer: {
    width: 64,
    alignItems: 'flex-end',
  },
  logo: {
    marginTop: -15,
    width: 54,
    height: 54,
    resizeMode: 'contain',
    alignSelf: 'center'
  },
  welcomeTextContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Centra horizontalmente
  },
  welcomeText: {
    fontSize: 16,
    color: '#E6A902',
  },
  userName: {
    fontSize: 16,
    color: '#333',
    marginLeft: 4, // Pequeño espacio entre "Bienvenid@:" y el nombre
  },
  onlineStatus: {
    position: 'absolute',
    bottom: 0,
    right: 6,
    width: 13,
    height: 13,
    borderRadius: 50,
    backgroundColor: '#4CAF50',
    borderWidth: 1,
    borderColor: 'white',
  },
});

export default CustomHeader;