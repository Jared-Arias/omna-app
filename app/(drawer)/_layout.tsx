import { useAppSelector } from '@/redux/hooks';
import { useAuth } from '@/services/auth/ctx';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { router } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Define valid route types
type AppRoutes = 
  | "perfil"
  | "agenda"
  | "servicios"
  | "escuela"
  | "homeScreen"

type CustomDrawerContentProps = {
  navigation: any;
  state: any;
  descriptors: any;
};

const CustomDrawerContent = (props: CustomDrawerContentProps) => {
  const { logout } = useAuth();
  const { user } = useAppSelector(state => state.client);
  // Define drawer items based on the new design
  const drawerItems = [
    {
      label: 'Mi Perfil',
      iconSource: require('@/assets/images/principal/perfil.png'),
      screen:  'perfil' as AppRoutes
    },
    {
      label: 'Agenda',
      iconSource: require('@/assets/images/principal/agenda.png'),
      screen: 'agenda' as AppRoutes
    },
    {
      label:  'Servicios',
      iconSource: require('@/assets/images/principal/servicios.png'),
      screen: 'servicios' as AppRoutes
    },
    {
      label: 'Escuela',
      iconSource: require('@/assets/images/principal/escuela.png'),
      screen: 'escuela' as AppRoutes
    },
  ];

  return (
    <View style={[styles.mainContainer, { backgroundColor: '#FFECD5' }]}>
      <DrawerContentScrollView {...props} style={styles.container}>
        {/* Drawer Items */}
        <View style={styles.drawerContent}>
          {drawerItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.drawerItem}
              onPress={() => router.push(item.screen as any)}
            >
              <View style={styles.itemContainer}>
                <Image source={item.iconSource} style={[styles.menuIcon]} />
                <Text style={styles.drawerLabel}>{item.label}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Cerrar Sesión Button */}
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={() => logout()}
        >
          <Image 
            source={require('@/assets/images/principal/cerrar.png')}
            style={[styles.menuIcon, {tintColor: '#000000'}]}
          />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>

        {/* Bottom Logo Section */}
        <View style={styles.bottomSection}>
          <Image
            source={require('@/assets/images/principal/logo-vertical.webp')}
            style={styles.logo}
          /> 
        </View>
      </DrawerContentScrollView>
    </View>
  );
};

export default function Layout() {
  
  return (
    <ThemeProvider value={DefaultTheme}>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerShown: false,
          drawerStyle: styles.drawer,
          drawerInactiveTintColor: '#FFFFFF',
        }}
      >
        <Drawer.Screen name="(tabs)"  />
      </Drawer>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  drawer: {
    width: 280,
    backgroundColor: '#1C222E',
  },
  drawerContent: {
    flex: 1,
    paddingVertical: 15,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  drawerLabel: {
    fontSize: 14,
    color: '#000000',
    marginLeft: 15,
  },
  menuIcon: {
    width: 18,
    height: 18,
    marginLeft: 15,
    resizeMode: 'contain',
  },
  drawerItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(10, 10, 10, 0.21)',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    marginTop: 20,
  },
  logoutText: {
    fontSize: 18,
    color: '#000000',
    marginLeft: 15,
  },
  bottomSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  logo: {
    width: 160,
    height: 160,
    resizeMode: 'contain',
  },
});