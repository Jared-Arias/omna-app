import { usePathname, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Animated, Dimensions, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const CustomTabBar = () => {
  const [isCentralMenuOpen, setIsCentralMenuOpen] = useState(false);
  const router = useRouter();
  const currentPath = usePathname();
  
  const toggleCentralMenu = () => {
    setIsCentralMenuOpen(!isCentralMenuOpen);
  };

  // Función para navegar reemplazando la vista actual en lugar de apilarla
  const navigateToScreen = (screenPath: string) => {
    try {
      // Usar replace en lugar de push para evitar apilar vistas
      router.replace(screenPath);
      
      // Si el menú central está abierto, cerrarlo
      if (isCentralMenuOpen) {
        setIsCentralMenuOpen(false);
      }
    } catch (error) {
      console.error('Error al navegar:', error);
    }
  };

  const centralBorder = () => (
    <>
    <View style={{position: 'absolute',
   bottom: Platform.OS === 'ios' ? 4 : 0,
   left: 10,
   right: 0,
   width: '95%',
   backgroundColor: 'transparent',
   borderRadius: 10,}}>
     <Image
          source={require('@/assets/images/principal/tab.png')}
          style={{ 
            width: '100%', 
            height: 120, 
            resizeMode: 'stretch' 
          }}
        />
      </View>
    </>
  );



  const rotateAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: isCentralMenuOpen ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isCentralMenuOpen]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });


  // Función para determinar si un tab está activo basado en la ruta actual
  const isActiveTab = (path: string) => {
    return currentPath.includes(path);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#FFFAEF' }]}>
       
      <View style={[styles.tabBar, { backgroundColor: '#FFFAEF', borderTopColor: '#FFFAEF' }]}>
        <TouchableOpacity
          style={[
            styles.tabItem, 
            isActiveTab('homeScreen') && styles.activeTab
          ]}
          onPress={() => navigateToScreen('/(drawer)/(tabs)/homeScreen')}
        >
          <Image
            source={require('@/assets/images/principal/home.png')}
            style={styles.icon}
          />
          <Text style={[
            styles.tabText, 
            isActiveTab('homeScreen') && styles.activeTabText
          ]}>Inicio</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabItem,
            isActiveTab('agenda') && styles.activeTab
          ]}
          onPress={() => navigateToScreen('/(drawer)/(tabs)/agenda')}
        >
          <Image
            source={require('@/assets/images/principal/agenda.png')}
            style={styles.icon}
          />
          <Text style={[
            styles.tabText, 
            isActiveTab('agenda') && styles.activeTabText
          ]}>Agenda</Text>
        </TouchableOpacity>

        {/* Central Button */}
        <TouchableOpacity
          style={styles.centralButton}
          onPress={() => navigateToScreen('/(drawer)/(tabs)/servicios')}
        >
         

          <View style={styles.centralButtonInner}>
             <Image
            source={require('@/assets/images/principal/tab.png')}
            style={{width: 100, height: 'auto', resizeMode: 'stretch', zIndex: -1, position: 'absolute', top: -30}}
          />
              <Image
                source={require('@/assets/images/principal/servicios.png')}
                style={styles.centralButtonIcon}
              />
               <Text style={[
            styles.tabText, 
            isActiveTab('servicios') && styles.activeTabText
          ]}>Sesiones</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabItem,
            isActiveTab('escuela') && styles.activeTab
          ]}
          onPress={() => navigateToScreen('/(drawer)/(tabs)/escuela')}
        >
          <Image
            source={require('@/assets/images/principal/escuela.png')}
            style={styles.icon}
          />
          <Text style={[
            styles.tabText, 
            isActiveTab('escuela') && styles.activeTabText
          ]}>Escuela</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabItem,
            isActiveTab('perfil') && styles.activeTab
          ]}
          onPress={() => navigateToScreen('/(drawer)/(tabs)/perfil')}
        >
          <Image
            source={require('@/assets/images/principal/perfil.png')}
            style={styles.icon}
          />
          <Text style={[
            styles.tabText, 
            isActiveTab('perfil') && styles.activeTabText
          ]}>Perfil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
   backgroundCurve: {
      position: 'absolute',
      bottom: 0,
      left: '2.5%',
      width: '100%',
      overflow: 'hidden',
      elevation: 5,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: -2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3,
    },
  container: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    left: 0,
    paddingBottom: Platform.OS === 'ios' ? -9 : 5,
    paddingTop: Platform.OS === 'ios' ? -45 : -40,
  },
  overlay: {
    position: 'absolute',
    top: -Dimensions.get('window').height,
    left: 0,
    width: '100%',
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  tabBar: {
    width: '95%',
    left: '2.5%',
    borderRadius: 100,
    marginTop: -5,
    flexDirection: 'row',
    height: 60,
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    // Puedes agregar estilos para los tabs activos aquí
  },
  activeTabText: {
    color: '#B89D6A', // Color verde para el texto del tab activo
  },
  icon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  tabText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: 'bold',
    color: '#B89D6A',
  },
  centralButton: {
    width: 70,
    height: 70,
    borderRadius: 100,
    backgroundColor: '#FEF7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1,
    borderWidth: 2,
  },
  centralButtonInner: {
    width: 70,
    height: 70,
    borderRadius: 100,
    backgroundColor: '#FEF7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centralButtonIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  centralMenuContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 84 : 66,
    left: 10,
    right: 0,
    width: '95%',
    backgroundColor: 'transparent',
    borderRadius: 10,
  },
  centralMenu: {
    backgroundColor: '#7fb733',
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 10,
  },
  centralMenuItem: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 1,
  },
  centralMenuIcon: {
    width: 27,
    height: 27,
    resizeMode: 'contain',
  },
  centralMenuText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 4,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  menuConnector: {
    position: 'absolute',
    bottom: -10,
    left: -5,
    width: 60,
    height: 95,
    backgroundColor: '#7fb733',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    zIndex: -1,
  },
  menuConnectorBorder: {
    position: 'absolute',
    bottom: 32,
    left: -15,
    width: 33,
    height: 35,
    backgroundColor: '#7fb733',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 100,
    transform: [{ rotate: '89deg' }],
    zIndex: -1,
  },
  menuConnectorBorder1: {
    position: 'absolute',
    bottom: 32,
    left: 29,
    width: 33,
    height: 35,
    backgroundColor: '#7fb733',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 100,
    transform: [{ rotate: '29deg' }],
    zIndex: -1,
  }
});

export default CustomTabBar;