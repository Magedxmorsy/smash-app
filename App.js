import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet } from 'react-native';
import CompeteScreen from './src/screens/compete/CompeteScreen';
import { Colors } from './src/constants/Colors';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <CompeteScreen />
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
