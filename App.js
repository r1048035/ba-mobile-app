import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { Montserrat_600SemiBold, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import { Roboto_400Regular } from '@expo-google-fonts/roboto';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CartProvider } from './context/CartContext';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import HomeScreen from './screens/HomeScreen';
import ProductDetail from './screens/ProductDetail';
import NewsDetail from './screens/NewsDetail';
import CampusDetail from './screens/CampusDEtail';
import Campuses from './screens/Campuses';
import Products from './screens/Products';
import StaticPage from './screens/StaticPage';
import NewsList from './screens/NewsList';
import StudyFinder from './screens/StudyFinder';
import { theme } from './theme';

const Stack = createNativeStackNavigator();

export default function App() {
  const [fontsLoaded] = useFonts({
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Roboto_400Regular,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <CartProvider>
        <NavigationContainer>
        <StatusBar style="dark" />
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: { backgroundColor: theme.colors.background },
            headerShadowVisible: false,
            headerTitleStyle: {
              fontFamily: theme.typography.subtitle,
              color: theme.colors.text,
            },
            contentStyle: { backgroundColor: theme.colors.background },
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} options={{ headerTitle: 'BA App' }} />
          <Stack.Screen name="Campuses" component={Campuses} options={{ title: 'Campussen' }} />
          <Stack.Screen name="StudyFinder" component={StudyFinder} options={{ title: 'Study Finder' }} />
          <Stack.Screen name="Products" component={Products} options={{ title: 'Producten' }} />
          <Stack.Screen name="NewsList" component={NewsList} options={{ title: 'Nieuws' }} />
          <Stack.Screen name="ProductDetail" component={ProductDetail} options={{ title: 'Product' }} />
          <Stack.Screen name="NewsDetail" component={NewsDetail} options={{ title: 'Nieuws' }} />
          <Stack.Screen name="CampusDetail" component={CampusDetail} options={{ title: 'Campus' }} />
          <Stack.Screen name="StaticPage" component={StaticPage} options={{ title: '' }} />
        </Stack.Navigator>
        </NavigationContainer>
      </CartProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
  },
});