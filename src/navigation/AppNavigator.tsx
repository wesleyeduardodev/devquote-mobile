import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';

import { RootStackParamList, BottomTabParamList } from '../types';
import { useAuthStore } from '../store/authStore';
import { COLORS } from '../constants';
import { LoadingSpinner } from '../components/ui';
import CustomDrawerContent from '../components/navigation/CustomDrawerContent';

// Import screens (to be created)
import LoginScreen from '../screens/auth/LoginScreen';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import DeliveryListScreen from '../screens/deliveries/DeliveryListScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import RequesterStackNavigator from './RequesterStackNavigator';
import ProjectStackNavigator from './ProjectStackNavigator';
import TaskStackNavigator from './TaskStackNavigator';

const Stack = createStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator<BottomTabParamList>();

// Drawer Navigator
const DrawerNavigator: React.FC = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={({ navigation }) => ({
        headerStyle: {
          backgroundColor: COLORS.white,
          elevation: 3,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        headerTintColor: COLORS.gray900,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
        drawerStyle: {
          backgroundColor: COLORS.gray50,
          width: 300,
        },
        drawerActiveTintColor: COLORS.primary,
        drawerInactiveTintColor: COLORS.gray600,
        drawerActiveBackgroundColor: 'rgba(59, 130, 246, 0.1)',
        drawerItemStyle: {
          borderRadius: 10,
          marginVertical: 2,
          marginHorizontal: 10,
          paddingHorizontal: 8,
        },
        drawerLabelStyle: {
          fontSize: 16,
          fontWeight: '500',
          marginLeft: -10,
        },
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.openDrawer()}
            style={{ marginLeft: 16 }}
          >
            <Ionicons name="menu" size={28} color={COLORS.gray900} />
          </TouchableOpacity>
        ),
        headerRight: () => (
          <TouchableOpacity
            style={{ marginRight: 16 }}
            onPress={() => {}}
          >
            <Ionicons name="notifications-outline" size={26} color={COLORS.gray700} />
          </TouchableOpacity>
        ),
      })}
    >
      <Drawer.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
          drawerIcon: ({ color, size }) => (
            <Ionicons 
              name="speedometer" 
              size={size - 2} 
              color={color} 
              style={{ marginRight: 8, width: 24, textAlign: 'center' }}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="Requesters"
        component={RequesterStackNavigator}
        options={{
          title: 'Solicitantes',
          drawerIcon: ({ color, size }) => (
            <Ionicons 
              name="people" 
              size={size - 2} 
              color={color}
              style={{ marginRight: 8, width: 24, textAlign: 'center' }}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="Projects"
        component={ProjectStackNavigator}
        options={{
          title: 'Projetos',
          drawerIcon: ({ color, size }) => (
            <Ionicons 
              name="folder" 
              size={size - 2} 
              color={color}
              style={{ marginRight: 8, width: 24, textAlign: 'center' }}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="Tasks"
        component={TaskStackNavigator}
        options={{
          title: 'Tarefas',
          drawerIcon: ({ color, size }) => (
            <MaterialIcons 
              name="task-alt" 
              size={size - 2} 
              color={color}
              style={{ marginRight: 8, width: 24, textAlign: 'center' }}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="Deliveries"
        component={DeliveryListScreen}
        options={{
          title: 'Entregas',
          drawerIcon: ({ color, size }) => (
            <MaterialIcons 
              name="local-shipping" 
              size={size - 2} 
              color={color}
              style={{ marginRight: 8, width: 24, textAlign: 'center' }}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Perfil',
          drawerIcon: ({ color, size }) => (
            <Ionicons 
              name="person" 
              size={size - 2} 
              color={color}
              style={{ marginRight: 8, width: 24, textAlign: 'center' }}
            />
          ),
          drawerItemStyle: { display: 'none' }, // Oculta do menu pois já tem no header
        }}
      />
    </Drawer.Navigator>
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
              component={DrawerNavigator}
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