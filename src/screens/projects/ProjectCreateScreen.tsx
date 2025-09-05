import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

import { projectService } from '../../services/projectService';
import { CreateProjectData } from '../../types/project.types';
import { Input, Button, Card } from '../../components/ui';
import { COLORS, SPACING } from '../../constants';
import { showToast } from '../../utils/toast';

const schema = yup.object().shape({
  name: yup
    .string()
    .required('Nome é obrigatório')
    .min(2, 'Nome deve ter pelo menos 2 caracteres'),
  repositoryUrl: yup.string().optional(),
});

interface FormData {
  name: string;
  repositoryUrl?: string;
}

const ProjectCreateScreen: React.FC = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormData>({
    defaultValues: {
      name: '',
      repositoryUrl: '',
    },
    mode: 'onChange',
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const createData: CreateProjectData = {
        ...data,
        repositoryUrl: data.repositoryUrl || undefined,
      };

      await projectService.create(createData);
      showToast('success', 'Projeto criado com sucesso!');
      navigation.goBack();
    } catch (error: any) {
      showToast('error', 'Erro ao criar projeto');
      console.error('Error creating project:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Form */}
        <Card style={styles.formCard}>
          
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Nome *"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.name?.message}
                leftIcon={<Ionicons name="folder-outline" size={20} color={COLORS.gray500} />}
                placeholder="Digite o nome do projeto"
                autoCapitalize="words"
                returnKeyType="next"
              />
            )}
          />

          <Controller
            control={control}
            name="repositoryUrl"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="URL do Repositório"
                value={value || ''}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.repositoryUrl?.message}
                leftIcon={<Ionicons name="link-outline" size={20} color={COLORS.gray500} />}
                placeholder="https://github.com/usuario/repositorio"
                keyboardType="url"
                autoCapitalize="none"
                returnKeyType="done"
              />
            )}
          />
        </Card>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <Button
          title="Cancelar"
          variant="outline"
          onPress={() => navigation.goBack()}
          style={styles.cancelButton}
          disabled={loading}
        />
        <Button
          title="Criar Projeto"
          onPress={handleSubmit(onSubmit)}
          loading={loading}
          disabled={!isValid}
          style={styles.submitButton}
          leftIcon={<MaterialIcons name="add" size={20} color={COLORS.white} />}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray50,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  formCard: {
    margin: SPACING.md,
    padding: SPACING.md,
  },
  bottomActions: {
    flexDirection: 'row',
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
  },
  cancelButton: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  submitButton: {
    flex: 2,
  },
});

export default ProjectCreateScreen;