import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useFonts } from 'expo-font';
import HomeScreen from './src/screens/home/HomeScreen';
import CompeteScreen from './src/screens/compete/CompeteScreen';
import BottomTabBar from './src/components/ui/BottomTabBar';
import { Colors } from './src/constants/Colors';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');

  const [fontsLoaded] = useFonts({
    'GeneralSans-Regular': require('./assets/fonts/GeneralSans-Regular.otf'),
    'GeneralSans-Medium': require('./assets/fonts/GeneralSans-Medium.otf'),
    'GeneralSans-Semibold': require('./assets/fonts/GeneralSans-Semibold.otf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen />;
      case 'compete':
        return <CompeteScreen />;
      case 'updates':
        return <View style={{ flex: 1 }} />;
      case 'profile':
        return <View style={{ flex: 1 }} />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          {renderScreen()}
        </View>
        <BottomTabBar activeTab={activeTab} onTabPress={setActiveTab} />
        <StatusBar style="dark" />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
  },
});