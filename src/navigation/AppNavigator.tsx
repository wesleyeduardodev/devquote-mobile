import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { RootStackParamList, BottomTabParamList } from '../types';
import { useAuthStore } from '../store/authStore';
import { COLORS } from '../constants';
import { LoadingSpinner } from '../components/ui';

// Import screens (to be created)
import LoginScreen from '../screens/auth/LoginScreen';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import TaskListScreen from '../screens/tasks/TaskListScreen';
import DeliveryListScreen from '../screens/deliveries/DeliveryListScreen';
import ProjectListScreen from '../screens/projects/ProjectListScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<BottomTabParamList>();

// Bottom Tab Navigator
const BottomTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Tasks':
              iconName = focused ? 'list' : 'list-outline';
              break;
            case 'Deliveries':
              iconName = focused ? 'cube' : 'cube-outline';
              break;
            case 'Projects':
              iconName = focused ? 'folder' : 'folder-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'help-circle-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray500,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopWidth: 1,
          borderTopColor: COLORS.gray200,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.white,
        headerTitleStyle: {
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
        }}
      />
      <Tab.Screen
        name="Tasks"
        component={TaskListScreen}
        options={{
          title: 'Tarefas',
        }}
      />
      <Tab.Screen
        name="Deliveries"
        component={DeliveryListScreen}
        options={{
          title: 'Entregas',
        }}
      />
      <Tab.Screen
        name="Projects"
        component={ProjectListScreen}
        options={{
          title: 'Projetos',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Perfil',
        }}
      />
    </Tab.Navigator>
  );
};

// Main App Navigator
const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading, loadStoredAuth } = useAuthStore();

  // Load stored authentication on app start
  useEffect(() => {
    loadStoredAuth();
  }, [loadStoredAuth]);

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <LoadingSpinner
        overlay
        size="large"
        text="Carregando..."
        testID="app-loading"
      />
    );
  }

  return (
    <>
      <StatusBar style={isAuthenticated ? 'light' : 'dark'} />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: COLORS.primary,
            },
            headerTintColor: COLORS.white,
            headerTitleStyle: {
              fontWeight: '600',
            },
          }}
        >
          {!isAuthenticated ? (
            // Auth Stack
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{
                headerShown: false,
                animationTypeForReplace: 'pop',
              }}
            />
          ) : (
            // Main App Stack
            <Stack.Screen
              name="MainTabs"
              component={BottomTabNavigator}
              options={{
                headerShown: false,
              }}
            />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
};

export default AppNavigator;