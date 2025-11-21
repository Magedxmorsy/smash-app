import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { useState } from 'react';
import CompeteScreen from './src/screens/compete/CompeteScreen';
import BottomTabBar from './src/components/ui/BottomTabBar';
import { Colors } from './src/constants/Colors';

export default function App() {
  const [activeTab, setActiveTab] = useState('compete');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <CompeteScreen />
      </View>
      <BottomTabBar activeTab={activeTab} onTabPress={setActiveTab} />
      <StatusBar style="dark" />
    </SafeAreaView>
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