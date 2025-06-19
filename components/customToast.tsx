import React, { useEffect } from 'react';
import { View, Text, Animated, StyleSheet, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface ToastProps {
  visible: boolean;
  message: string;
  type: 'success' | 'warning' | 'error';
  onHide: () => void;
  duration?: number;
  position?: 'top' | 'bottom'; // Nueva prop para controlar la posición
}

const { width, height } = Dimensions.get('window'); // Añadimos height para calcular la posición

const CustomToast: React.FC<ToastProps> = ({
  visible,
  message,
  type = 'success',
  onHide,
  duration = 5000,
  position = 'top', // Por defecto arriba, pero ahora es opcional
}) => {
  // Usamos valor inicial diferente según la posición
  const translateY = new Animated.Value(position === 'top' ? -90 : 100);

  const getToastStyle = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: '#10B981',
          icon: 'check-circle' as const,
        };
      case 'warning':
        return {
          backgroundColor: '#F59E0B',
          icon: 'warning' as const,
        };
      case 'error':
        return {
          backgroundColor: '#EF4444',
          icon: 'error-outline' as const,
        };
      default:
        return {
          backgroundColor: '#10B981',
          icon: 'check-circle' as const,
        };
    }
  };

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();

      const timer = setTimeout(() => {
        Animated.timing(translateY, {
          toValue: position === 'top' ? -90 : 100, // Animación de salida según la posición
          duration: 300,
          useNativeDriver: true,
        }).start(() => onHide());
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, position]);

  if (!visible) return null;

  const toastStyle = getToastStyle();

  return (
    <Animated.View
      style={[
        styles.container,
        position === 'top' 
          ? { top: 50 } 
          : { bottom: 50 }, // Ajustamos la posición según la prop
        { transform: [{ translateY }] },
        { backgroundColor: toastStyle.backgroundColor },
      ]}
    >
      <View style={styles.content}>
        <MaterialIcons
          name={toastStyle.icon}
          size={24}
          color="#ffffff"
        />
        <Text style={styles.message}>{message}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: width - 10, // Ajustado para márgenes
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 5,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 9999,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  message: {
    color: '#ffffff',
    fontSize: 12,
    marginLeft: 12,
    marginRight: 8,
    fontWeight: '500',
  },
});

export default CustomToast;