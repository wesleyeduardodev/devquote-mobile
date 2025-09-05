import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

import { projectService } from '../../services/projectService';
import { Project, UpdateProjectData } from '../../types/project.types';
import { Input, Button, Card, LoadingSpinner } from '../../components/ui';
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

type RouteParams = {
  ProjectEdit: {
    id: string | number;
  };
};

const ProjectEditScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'ProjectEdit'>>();
  const { id } = route.params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [project, setProject] = useState<Project | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    reset,
  } = useForm<FormData>({
    defaultValues: {
      name: '',
      repositoryUrl: '',
    },
    mode: 'onChange',
    resolver: yupResolver(schema),
  });

  // Carrega os dados do projeto
  useEffect(() => {
    loadProject();
  }, []);

  const loadProject = async () => {
    try {
      setLoading(true);
      const data = await projectService.getById(id);
      setProject(data);
      
      // Preenche o formulário com os dados carregados
      reset({
        name: data.name || '',
        repositoryUrl: data.repositoryUrl || '',
      });
    } catch (error) {
      showToast('error', 'Erro ao carregar dados do projeto');
      console.error('Error loading project:', error);
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      const updateData: UpdateProjectData = {
        ...data,
        repositoryUrl: data.repositoryUrl || undefined,
      };

      await projectService.update(id, updateData);
      showToast('success', 'Projeto atualizado com sucesso!');
      navigation.goBack();
    } catch (error: any) {
      showToast('error', 'Erro ao atualizar projeto');
      console.error('Error updating project:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner overlay size="large" text="Carregando projeto..." />;
  }

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

        {/* Informações adicionais */}
        {project && (
          <Card style={styles.infoCard}>
            <Text style={styles.infoTitle}>Informações do Sistema</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>ID:</Text>
              <Text style={styles.infoValue}>{project.id}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Criado em:</Text>
              <Text style={styles.infoValue}>
                {project.createdAt ? new Date(project.createdAt).toLocaleDateString('pt-BR') : 'N/A'}
              </Text>
            </View>
            {project.updatedAt && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Atualizado em:</Text>
                <Text style={styles.infoValue}>
                  {new Date(project.updatedAt).toLocaleDateString('pt-BR')}
                </Text>
              </View>
            )}
          </Card>
        )}
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <Button
          title="Cancelar"
          variant="outline"
          onPress={() => navigation.goBack()}
          style={styles.cancelButton}
          disabled={saving}
        />
        <Button
          title="Salvar Alterações"
          onPress={handleSubmit(onSubmit)}
          loading={saving}
          disabled={!isValid || !isDirty}
          style={styles.submitButton}
          leftIcon={<MaterialIcons name="save" size={20} color={COLORS.white} />}
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
  infoCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.gray50,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray900,
    marginBottom: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.gray600,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.gray900,
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

export default ProjectEditScreen;