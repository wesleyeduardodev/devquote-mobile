import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { COLORS } from '../constants';

import { 
  ProjectListScreen, 
  ProjectCreateScreen, 
  ProjectEditScreen 
} from '../screens/projects';

const Stack = createStackNavigator<RootStackParamList>();

const ProjectStackNavigator: React.FC = () => {
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
        name="ProjectList"
        component={ProjectListScreen}
        options={{
          title: 'Projetos',
        }}
      />
      <Stack.Screen
        name="ProjectCreate"
        component={ProjectCreateScreen}
        options={{
          title: 'Novo Projeto',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="ProjectEdit"
        component={ProjectEditScreen}
        options={{
          title: 'Editar Projeto',
          headerShown: true,
        }}
      />
    </Stack.Navigator>
  );
};

export default ProjectStackNavigator;