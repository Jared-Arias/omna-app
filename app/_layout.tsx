import { DarkTheme, DefaultTheme } from "@react-navigation/native";
import { router, Stack, usePathname } from "expo-router";
//import { useColorScheme } from "@/components/useColorScheme";
import AuthProvider, { publicRoutes, useAuth } from "@/services/auth/ctx";
import { useURL } from "expo-linking";
import { useEffect, useState } from 'react';
//import { publicRoutes } from "@/services/auth/model/auth";
import { useAppSelector } from "@/redux/hooks";
import { store } from "@/redux/store";
import { EventEmitter } from 'events';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PaperProvider } from "react-native-paper";
import { Provider } from "react-redux";
import SplashVideo from "./splashVideo";
// Fix EventEmitter warning
EventEmitter.defaultMaxListeners = 20;

// Custom dark theme configuration
export const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#your-primary-color',
    background: '#1F1F1F',
    card: '#your-card-color',
    text: '#your-text-color',
    border: '#your-border-color',
    notification: '#your-notification-color'
  }
};

export const CustomWhiteTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#your-primary-color',
    background: 'white',
    card: '#your-card-color',
    text: '#your-text-color',
    border: '#your-border-color',
    notification: '#your-notification-color'
  }
};

function NavigationGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const { user, userData } = useAppSelector(state => state.client);
  const redirectLinking = useURL();
  console.log("Linking URL:", redirectLinking);
  const [splashVideoCompleted, setSplashVideoCompleted] = useState(false);

  const [fontsLoaded, setFontsLoaded] = useState(false);

  const loadFonts = async () => {
    await Font.loadAsync({
      // Poppins fonts
      'Poppins-Black': require('@/assets/fonts/Poppins-Black.ttf'),
      'Poppins-BlackItalic': require('@/assets/fonts/Poppins-BlackItalic.ttf'),
      'Poppins-Bold': require('@/assets/fonts/Poppins-Bold.ttf'),
      'Poppins-BoldItalic': require('@/assets/fonts/Poppins-BoldItalic.ttf'),
      'Poppins-ExtraBold': require('@/assets/fonts/Poppins-ExtraBold.ttf'),
      'Poppins-ExtraBoldItalic': require('@/assets/fonts/Poppins-ExtraBoldItalic.ttf'),
      'Poppins-ExtraLight': require('@/assets/fonts/Poppins-ExtraLight.ttf'),
      'Poppins-ExtraLightItalic': require('@/assets/fonts/Poppins-ExtraLightItalic.ttf'),
      'Poppins-Italic': require('@/assets/fonts/Poppins-Italic.ttf'),
      'Poppins-Light': require('@/assets/fonts/Poppins-Light.ttf'),
      'Poppins-LightItalic': require('@/assets/fonts/Poppins-LightItalic.ttf'),
      'Poppins-Medium': require('@/assets/fonts/Poppins-Medium.ttf'),
      'Poppins-MediumItalic': require('@/assets/fonts/Poppins-MediumItalic.ttf'),
      'Poppins-Regular': require('@/assets/fonts/Poppins-Regular.ttf'),
      'Poppins-SemiBold': require('@/assets/fonts/Poppins-SemiBold.ttf'),
      'Poppins-SemiBoldItalic': require('@/assets/fonts/Poppins-SemiBoldItalic.ttf'),
      'Poppins-Thin': require('@/assets/fonts/Poppins-Thin.ttf'),
      'Poppins-ThinItalic': require('@/assets/fonts/Poppins-ThinItalic.ttf'),
      'BrushScript': require('@/assets/fonts/BrushScriptOpti-Regular.otf'),
      'Ebrima': require('@/assets/fonts/ebrima.ttf'),
      'FontAwesomeBrands': require('@/assets/fonts/Font Awesome 6 Brands-Regular-400.otf'),
      'FontAwesomeFree': require('@/assets/fonts/Font Awesome 6 Free-Regular-400.otf'),
      'FontAwesomeSolid': require('@/assets/fonts/Font Awesome 6 Free-Solid-900.otf'),
    });
    setFontsLoaded(true);
  };


  useEffect(() => {
    const handleNavigation = async () => {
      if (isLoading) {
        loadFonts();
        await SplashScreen.hide();
        return;
      }

      const isPublicRoute = publicRoutes.includes(pathname);

      if (isAuthenticated === undefined) return;

      console.log("Estado de autenticación:", isAuthenticated, "Ruta:", pathname);

      if (isAuthenticated) {
        if (pathname === '/' || isPublicRoute) {
         router.replace('/(drawer)/(tabs)/homeScreen');
        }
      } else {
        if (!isPublicRoute) {
          console.log("Redirigiendo al login porque no es ruta pública");
          router.replace('/');
        }
      }

    };

    handleNavigation();
  }, [isAuthenticated, splashVideoCompleted, isLoading, pathname]);

  return isLoading || !splashVideoCompleted ? <SplashVideo onFinish={() => setSplashVideoCompleted(true)} /> : <>{children}</>; 
}

export default function RootLayout() {



  return (
    <Provider store={store}>
      <GestureHandlerRootView>
        <PaperProvider>
          <AuthProvider>
            <NavigationGuard>
              <Stack screenOptions={{
                headerShown: false
              }}>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="registerClient" options={{ headerShown: false }} />
                <Stack.Screen name="splashScreen" options={{ headerShown: false, animation: 'fade', animationTypeForReplace: 'pop' }} />
                <Stack.Screen name="forgotPassword" options={{ headerShown: false }} />
                <Stack.Screen name="homeScreen" options={{ headerShown: false }} />

              </Stack>
            </NavigationGuard>
          </AuthProvider>
        </PaperProvider>
      </GestureHandlerRootView>
    </Provider>
  );
}