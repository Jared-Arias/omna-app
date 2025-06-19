// File: app/(drawer)/(tabs)/_layout.tsx
import CustomTabBar from '@/components/CustomTabBar';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="homeScreen" options={{ href: '/homeScreen' }} />
      <Tabs.Screen name="servicios" options={{ href: '/serviciosScreen' }} />
      <Tabs.Screen name="perfil" options={{ href: '/perfilScreen' }} />
      <Tabs.Screen name="escuela" options={{ href: '/escuelaScreen' }} />
      <Tabs.Screen name="agenda" options={{ href: '/agendaScreen' }} />
      <Tabs.Screen name="details_sesiones/[id]" options={{ href: '/details_sesiones/[id]' }} />
      <Tabs.Screen name="details_escuela/[id]" options={{ href: '/details_escuela/[id]' }} />
    </Tabs>
  );
}