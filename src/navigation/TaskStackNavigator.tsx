import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { COLORS } from '../constants';

import { 
  TaskListScreen, 
  TaskCreateScreen, 
  TaskEditScreen 
} from '../screens/tasks';

const Stack = createStackNavigator<RootStackParamList>();

const TaskStackNavigator: React.FC = () => {
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
        name="TaskList"
        component={TaskListScreen}
        options={{
          title: 'Tarefas',
        }}
      />
      <Stack.Screen
        name="TaskCreate"
        component={TaskCreateScreen}
        options={{
          title: 'Nova Tarefa',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="TaskEdit"
        component={TaskEditScreen}
        options={{
          title: 'Editar Tarefa',
          headerShown: true,
        }}
      />
    </Stack.Navigator>
  );
};

export default TaskStackNavigator;