import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { COLORS } from '../constants';

import { 
  RequesterListScreen, 
  RequesterCreateScreen, 
  RequesterEditScreen 
} from '../screens/requesters';

const Stack = createStackNavigator<RootStackParamList>();

const RequesterStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.white,
          elevation: 2,
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
        headerShown: false, // Deixa o drawer header handle isso
      }}
    >
      <Stack.Screen
        name="RequesterList"
        component={RequesterListScreen}
        options={{
          title: 'Solicitantes',
        }}
      />
      <Stack.Screen
        name="RequesterCreate"
        component={RequesterCreateScreen}
        options={{
          title: 'Novo Solicitante',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="RequesterEdit"
        component={RequesterEditScreen}
        options={{
          title: 'Editar Solicitante',
          headerShown: true,
        }}
      />
    </Stack.Navigator>
  );
};

export default RequesterStackNavigator;