import { useAppDispatch } from "@/redux/hooks";
import { setClient } from '@/redux/slices/clientSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as Network from 'expo-network';
import { router } from "expo-router";
import { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";
import { Alert } from 'react-native';
import { ClientResponse } from "./model/auth";
import { getClient } from "./userDataController/authService";

// URL de la API
export const API_URL = 'https://omna.life/api/';

// Tipos
export type AuthResponse = {
  status: 'success' | 'error';
  message: string;
  data?: any;
  access_token?: string;
};

export type SignUpData = {
  first_name: string;
  last_name: string;
  birthdate: string;
  country: string;
  city: string;
  phone: string;
  email: string;
  password: string;
  password_confirmation: string;
  profile_image?: string | null;
};

// Instancia de axios
export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Context inicial
const initialState = {
  isAuthenticated: undefined,
  isLoading: true,
  token: '',
  login: async () => ({ status: 'error' as 'error', message: 'No implementado' }),
  register: async () => ({ status: 'error' as 'error', message: 'No implementado' }),
  registerProfesional: async (data: any, token: string) => ({ status: 'error' as 'error', message: 'No implementado' }),
  logout: async () => {},
  verifySession: async () => false
}

// Tipo del contexto
type AuthContextType = {
  isAuthenticated: boolean | undefined;
  isLoading: boolean;
  token: string;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (data: SignUpData) => Promise<AuthResponse>;
  registerProfesional: (data: any, token: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  verifySession: () => Promise<boolean>;
}

// Crear el contexto
const AuthContext = createContext<AuthContextType>(initialState);

// Definir rutas públicas
export const publicRoutes = ['/', '/forgotPass', '/resetPassword', '/registerSelect', '/registerProfesional', '/registerClient', '/metamap', '/esperarVerificacion', '/verificarEmail', '/termsScree', '/legalScreen', '/protectedScreen', '/splashVideo', '/splashScreen', '/registerSelect', '/registerClient', '/registerProfesional', '/termsScree', '/legalScreen', '/protectedScreen', '/splashVideo', '/splashScreen'];
// Proveedor de autenticación
interface Props extends PropsWithChildren {}

const AuthProvider: React.FC<Props> = ({ children }) => {
  const [token, setToken] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useAppDispatch();
  // Limpiar sesión
  const clearSession = async () => {
    await AsyncStorage.multiRemove(['session', 'profile_image', 'client', 'selectedWallet', 'selectedWalletIndex']);
    setToken('');
    setIsAuthenticated(false);
  };

  // Configurar interceptores
  useEffect(() => {
    // Interceptor de solicitudes
    const requestInterceptor = api.interceptors.request.use(async (config) => {
      try {
        // Verificar conexión a internet
        const networkState = await Network.getNetworkStateAsync();
        if (!networkState.isConnected) {
          Alert.alert('Sin conexión a internet', 'Por favor verifica tu conexión a internet');
          return Promise.reject({ status: 'error', message: 'Sin conexión a internet' });
        }
        
        // Configurar tipo de contenido para FormData
        if (config.data instanceof FormData) {
          config.headers['Content-Type'] = 'multipart/form-data';
        }
        
        // Agregar token de autenticación si está disponible
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
      } catch (error) {
        console.error('Error en la solicitud:', error);
        return Promise.reject({ status: 'error', message: 'Error en la configuración de la solicitud' });
      }
    });

    // Interceptor de respuestas
    const responseInterceptor = api.interceptors.response.use(
      response => response,
      async error => {
        // Verificar errores de autenticación (excepto en endpoints de auth)
        const isAuthEndpoint = 
          error.config?.url?.includes('index') || 
          error.config?.url?.includes('register') ||
          error.config?.url?.includes('otp') ||
          error.config?.url?.includes('metamap') ||
          error.config?.url?.includes('esperarVerificacion') ||
          error.config?.url?.includes('verificarEmail')||
          error.config?.url?.includes('forgotPass') ||
          error.config?.url?.includes('resetPassword') ||
          error.config?.url?.includes('/registerProfesional') ;
        
        if (error.response?.status === 401 && !isAuthEndpoint) {
          await clearSession();
          return Promise.reject({
            status: 'error',
            message: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',
          });
        }
        
        // Formatear otros errores de forma consistente
        const errorMessage = error.response?.data?.message || error.message || 'Ocurrió un error inesperado';
        return Promise.reject({
          status: 'error',
          message: errorMessage,
        });
      }
    );

    // Limpiar interceptores al desmontar
    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [token]);

   // Verificar sesión
   const verifySession = async () => {
    try {
      console.log('Verificando sesión...');
      
      const savedSessionStr = await AsyncStorage.getItem('session');
      if (!savedSessionStr) return false;
  
      const savedSession = JSON.parse(savedSessionStr);
      if (!savedSession?.access_token) return false;
  
      console.log('Usando token:', savedSession.access_token);

       const result = await api.get('/me', {
        headers: {
          Authorization: `Bearer ${savedSession.access_token}`
        }
      });
  
      if (result.status === 200) {
         const clientResponse = result.data.data as ClientResponse;
         dispatch(setClient(clientResponse));
        return true;
      }
      throw new Error('Respuesta inválida');
    } catch (error: any) {
      console.error('Error verificando sesión:', error);
      if (error.response?.status === 401) {
        await clearSession();
      }
      return false;
    }
  };
  

  // Cargar sesión al iniciar
  useEffect(() => {
    const loadSession = async () => {
      setIsLoading(true);
      try {
        const savedSessionStr = await AsyncStorage.getItem('session');
        console.log('Sesión guardada:', savedSessionStr);
        
        if (!savedSessionStr) {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }
    
        const savedSession = JSON.parse(savedSessionStr);
        if (!savedSession?.access_token) {
          throw new Error('Formato de sesión inválido');
        }
        
        console.log('Token cargado:', savedSession.access_token);	
    
        setToken(savedSession.access_token);
        
        // Asegurar que verifySession se ejecute después de establecer el token
        const isValid = await verifySession();
        setIsAuthenticated(isValid);
        setIsLoading(false);
      } catch (error) {
        console.error('Error cargando sesión:', error);
        await AsyncStorage.removeItem('session');
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };    
    
    loadSession();
  }, []);

  // Función de inicio de sesión
  const login = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      
      const response = await fetch(`${API_URL}auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password })    
      });
      
      const data = await response.json();
      console.log('Respuesta de inicio de sesión:', data.data);
      
      // Verificar errores
      if (data.status === "error") {
        return {
          status: 'error',
          message: data.message || 'Error de autenticación'
        };
      }
      
      // Verificar formato de respuesta
      if (!data?.data?.access_token) {
        return {
          status: 'error',
          message: 'Respuesta del servidor inválida'. concat(' - ', data.message || 'No se recibió access_token')
        };
      }
      
      // Manejar estados especiales del usuario
      if (data.user?.state) {

        const userState = data.user.state.slug;
        
        if (userState === 'pending_profile_data') {
          console.log('Estado del usuario pendiente profile data:', data);
          router.push({
            pathname: '/registerProfesional',
            params: {
              user_id: data.user.id,
              email: data.user.email,
              token: data.access_token,
              estado: 'Pendiente de ingresar datos de perfil',
            }
          });
          return { status: 'success', message: 'Perfil incompleto' };
        }
        
        if (userState === 'blocked_by_admin' || userState === '') {
          return { status: 'error', message: 'Usuario bloqueado contacte a soporte' };
        }
        
        if (userState === 'rejected_by_metamap') {
          router.push({
            pathname: '/esperarVerificacion',
            params: {
              estado: 'rechazado',
              password: password,
              email: email,
              token: data.data.access_token
            }
          });
          return { status: 'error', message: 'Su registro fue rechazado' };
        }
      }

      console.log('Inicio de sesión exitoso:', data);

      // Guardar autenticación exitosa
      await AsyncStorage.setItem('session', JSON.stringify({ access_token: data.data.access_token }));
      setToken(data.data.access_token);
      setTimeout(async () => {
        const result = await getClient();
        console.log('Resultado de getClient:', result.data);
         const clientResponse = result.data as ClientResponse;
           dispatch(setClient(clientResponse));
       }, 1800);
      setTimeout( () => {
      setIsAuthenticated(true);
      }, 3000);
      
      return {
        status: 'success',
        message: 'Inicio de sesión exitoso',
        access_token: data.access_token,
      };
    } catch (error: any) {
      return {
        status: 'error',
        message: error.message || 'Error de inicio de sesión',
      };
    }
  };

  // Función de registro
  const register = async (data: SignUpData): Promise<AuthResponse> => {
    const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (key === 'profile_image' && value) {
      // Manejar la imagen de perfil de manera especial para React Native
      if (typeof value === 'object' && value !== null) {
        // Verificar que tenga la estructura correcta para React Native
        const imageObj = value as any;
        if (imageObj.uri) {
          // Crear el objeto correcto para React Native FormData
          formData.append(key, {
            uri: imageObj.uri,
            type: imageObj.type || 'image/jpeg', // Tipo por defecto
            name: imageObj.name || 'profile_image.jpg', // Nombre por defecto
          } as any);
        } else {
          console.warn('Imagen no tiene URI válido:', imageObj);
        }
      }
    } else if (value !== null && value !== undefined) {
      // Para todos los demás campos, convertir a string solo si no son null/undefined
      formData.append(key, String(value));
    }
  });

  // Para debug - mostrar el contenido del FormData
  console.log('Datos a enviar en register función:');
  Object.entries(data).forEach(([key, value]) => {
    if (key === 'profile_image') {
      console.log(`${key}:`, typeof value, value);
    } else {
      console.log(`${key}: ${value}`);
    }
  });

    try {
      const response = await api.post('registerClient', formData);
      const data = response.data;
      console.log('Respuesta de registro:', data);
      if (data?.data) {
        // Guardar autenticación exitosa
        console.log('Registro exitoso:', data);
        await AsyncStorage.setItem('session', JSON.stringify({ access_token: data.access_token }));
        setToken(data.access_token);
        setTimeout(async () => {
          const result = await getClient();
          console.log('Resultado de getClient register:', result.data);
           const clientResponse = result.data as ClientResponse;
             dispatch(setClient(clientResponse));
         }, 2800);
        setTimeout( () => {
        setIsAuthenticated(true);
        }, 3000);
        
        return {
          status: 'success',
          data: response.data.data.user,
          message: 'Registro exitoso',
        };
      } 
      
      return {
        status: 'error',
        message: response.data?.message || 'Error durante el registro',
      };
    } catch (error: any) {
      console.error('Error de registro:', error);
      return {
        status: 'error',
        message: error.response?.data?.message || error.message || 'Error de registro',
      };
    }
  };

  // Modificación de la función registerProfesional
const registerProfesional = async (data: any, token: string): Promise<AuthResponse> => {
  const formData = new FormData();

  // Agregar todos los campos de datos del usuario al FormData
  Object.entries(data).forEach(([key, value]) => {
    if (key === 'images' && Array.isArray(value)) {
      value.forEach((image, index) => {
        formData.append(`images[${index}]`, image);
      });
    } else if (key !== 'phone' && key !== 'password' && key !== 'password_confirmation') {
      formData.append(key, value as string);
    }
  });
  
  console.log('Datos a enviar en register profesional función: ', formData);
  
  try {
    // Usar directamente fetch en lugar de api.post para evitar interceptores
    const response = await fetch(`${API_URL}/registerProfesional`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data'
      },
      body: formData
    });
    
    const responseData = await response.json();
    console.log('Respuesta completa:', responseData);
    
    if (responseData.status === 'error') {
      return {
        status: 'error',
        message: responseData.message || 'Error durante el registro'
      };
    }
    
    if (responseData.data) {
      // Guardar autenticación exitosa
      console.log('Registro exitoso:', responseData.data);
      await AsyncStorage.setItem('session', JSON.stringify({ 
        access_token: token 
      }));
      setToken(token);
      
      setTimeout(async () => {
        const result = await getClient();
        const clientResponse = result.data as ClientResponse;
        dispatch(setClient(clientResponse));
      }, 2000);
      
      setTimeout(() => {
        setIsAuthenticated(true);
      }, 3000);
      
      return {
        status: 'success',
        data: responseData.data.user,
        message: 'Registro exitoso',
        access_token: responseData.data.access_token
      };
    }
    
    return {
      status: 'error',
      message: responseData.message || 'Error durante el registro',
    };
  } catch (error: any) {
    console.error('Error de registro profesional:', error);
    return {
      status: 'error',
      message: error.message || 'Error de conexión durante el registro',
    };
  }
};

  // Función de cierre de sesión
const logout = async () => {
    await clearSession();
};

  // Proporcionar el contexto
  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      isLoading,
      token,
      login,
      register,
      registerProfesional,
      logout,
      verifySession
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

// Hook para usar el contexto de autenticación
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser accesible dentro del AuthProvider');
  }
  return context;
};