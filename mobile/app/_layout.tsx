import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { DataProvider } from '../context/DataContext';
import { DynamicIslandProvider } from '../context/DynamicIslandContext';
import { DynamicIslandBanner } from '../components/DynamicIslandBanner';
import { View, ActivityIndicator } from 'react-native';
import { C } from '../constants/colors';
import { useRouter, useSegments } from 'expo-router';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;
    const inTabs = segments[0] === '(tabs)';
    if (!isLoggedIn && inTabs) {
      router.replace('/');
    } else if (isLoggedIn && !inTabs) {
      router.replace('/(tabs)');
    }
  }, [isLoggedIn, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={C.primary} size="large" />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <DataProvider>
        <DynamicIslandProvider>
        <StatusBar style="light" />
        <AuthGuard>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: C.bg },
              animation: 'fade',
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="(tabs)" />
          </Stack>
        </AuthGuard>
        <DynamicIslandBanner />
        </DynamicIslandProvider>
      </DataProvider>
    </AuthProvider>
  );
}
