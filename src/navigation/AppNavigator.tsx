import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../contexts/AuthContext';
import { ActivityIndicator, View } from 'react-native';
import { Icon } from 'react-native-paper';

// Auth Screens
import { LoginScreen } from '../screens/LoginScreen';
import { SignUpScreen } from '../screens/SignUpScreen';

// Main Screens
import { HomeScreen } from '../screens/HomeScreen';
import { CompeteScreen } from '../screens/CompeteScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

// Tournament Screens
import { CreateTournamentScreen } from '../screens/CreateTournamentScreen';
import { TournamentDetailScreen } from '../screens/TournamentDetailScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="SignUp" component={SignUpScreen} />
  </Stack.Navigator>
);

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName: string;

        switch (route.name) {
          case 'Home':
            iconName = focused ? 'home' : 'home-outline';
            break;
          case 'Compete':
            iconName = focused ? 'trophy' : 'trophy-outline';
            break;
          case 'Notifications':
            iconName = focused ? 'bell' : 'bell-outline';
            break;
          case 'Profile':
            iconName = focused ? 'account' : 'account-outline';
            break;
          default:
            iconName = 'circle';
        }

        return <Icon source={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#1E90FF',
      tabBarInactiveTintColor: '#757575',
    })}
  >
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{ headerShown: false }}
    />
    <Tab.Screen
      name="Compete"
      component={CompeteScreen}
      options={{ headerShown: false }}
    />
    <Tab.Screen
      name="Notifications"
      component={NotificationsScreen}
      options={{ headerShown: false }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{ headerShown: false }}
    />
  </Tab.Navigator>
);

const MainStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="MainTabs"
      component={MainTabs}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="CreateTournament"
      component={CreateTournamentScreen}
      options={{
        title: 'Create Tournament',
        presentation: 'modal',
      }}
    />
    <Stack.Screen
      name="TournamentDetail"
      component={TournamentDetailScreen}
      options={{ title: 'Tournament' }}
    />
  </Stack.Navigator>
);

export const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1E90FF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
};
