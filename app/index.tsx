import CustomToast from '@/components/customToast';
import { useToast } from '@/hooks/useToast';
import { useAppDispatch } from "@/redux/hooks";
import { useAuth } from '@/services/auth/ctx';
import { extractFirstErrorMessage } from '@/services/auth/userDataController/authService';
import { Feather } from '@expo/vector-icons';
import { router, useNavigation } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const { width, height } = Dimensions.get('window');

const Login = () => {
  const { login } = useAuth();
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
   const { toast, showToast, hideToast } = useToast();
   const dispatch = useAppDispatch();
  useEffect(() => {
    navigation.setOptions({ headerShown: false });
    
    // Configuramos el StatusBar para que sea transparente
    StatusBar.setBarStyle('light-content');
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('transparent');
      StatusBar.setTranslucent(true);
    }
  }, []);
  
  const forgotPassword = () => {
    //router.replace('/forgotPassword'); 
  }; 

  const handleLogin = async () => {
     if (!email || !password) {
      showToast('Por favor, completa todos los campos', 'error');
      return;
     }

    setIsLoading(true);
    try {
      const response = await login(email, password);
      if (response.status === 'error') {
        showToast(`${extractFirstErrorMessage(response.message)}`, 'error');
        setIsLoading(false);
        return;
      }
      setTimeout(() => {
      setIsLoading(false);
      }, 2000);
    } catch (error) {
      showToast('Ocurrió un error inesperado al iniciar sesión', 'error');
      setIsLoading(false);
    }
  };

  // Función para alternar la visibilidad de la contraseña
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <View style={styles.mainContainer}>
      {/* Ocultamos el status bar nativo */}
      <StatusBar hidden={true} backgroundColor="#FAF6ED" />

      {/* Fondo degradado */}
      <ImageBackground 
        source={require('@/assets/images/principal/nuestra-app.webp')}
        style={styles.backgroundImage}
        resizeMode="cover" // Cambiamos a "cover" para asegurar que cubra toda la pantalla
      >
        <View style={styles.overlay}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
          >
            <ScrollView 
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.logoContainer}>
                <Image 
                  source={require('@/assets/images/principal/logo-vertical.webp')} 
                  style={styles.logo} 
                />
              </View>

              <View style={styles.formContainer}>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="E-Mail"
                    placeholderTextColor="rgb(138, 135, 135)"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Contraseña"
                    placeholderTextColor="rgb(138, 135, 135)"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity 
                    style={styles.eyeIcon}
                    onPress={togglePasswordVisibility}
                  >
                    <Feather 
                      name={showPassword ? "eye" : "eye-off"} 
                      size={24} 
                      color="rgb(138, 135, 135)" 
                    />
                  </TouchableOpacity>
                </View>


                <TouchableOpacity style={styles.forgotPasswordButton} onPress={forgotPassword}>
                  <Text style={styles.forgotPasswordText}>¿Olvidaste tu Contraseña?</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.loginButton} 
                  onPress={handleLogin}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.loginButtonText}>INGRESAR A MI CUENTA</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity style={styles.signupButton} onPress={()=>{router.push('/registerClient')}}> 
                  <Text style={styles.signupText}>ERES NUEV@? REGISTRATE</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
             <CustomToast
              visible={toast.visible}
              message={toast.message}
              type={toast.type}
              onHide={hideToast}
            /> 
          </KeyboardAvoidingView>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomContainer: {
    marginBottom: Platform.OS === 'ios' ? 10 : 5
  },
  mainContainer: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: width,
    height: height + (Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0), // Ajustamos la altura para que cubra el status bar
    position: 'absolute', // Posicionamos absolutamente para cubrir toda la pantalla
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlay: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight, // Añadimos padding para compensar el StatusBar
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20, // Ajustamos padding superior
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
    // Damos más espacio arriba para compensar el status bar
  },
  logo: {
    width: 165,
    height: 165,
    resizeMode: 'contain',
  },
  formContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  inputContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginHorizontal: -10,
  },
  input: {
    flex: 1,
    color: 'grey',
    fontSize: 16,
    paddingVertical: 15,
  },
  eyeIcon: {
    padding: 10,
  },
  forgotPasswordButton: {
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  forgotPasswordText: {
    color: 'white',
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#DF9D0E',
    padding: 15,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signupButton: {
    backgroundColor: '#003399',
    padding: 15,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
  },
  signupText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default Login;