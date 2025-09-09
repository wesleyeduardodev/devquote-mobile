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

import { taskService } from '../../services/taskService';
import { requesterService } from '../../services/requesterService';
import { Task, UpdateTaskData, TaskPriority, TaskType } from '../../types/task.types';
import { Requester } from '../../types/requester.types';
import { Input, Button, Card, LoadingSpinner } from '../../components/ui';
import { COLORS, SPACING } from '../../constants';
import { showToast } from '../../utils/toast';

const schema = yup.object().shape({
  code: yup
    .string()
    .required('Código é obrigatório')
    .max(50, 'Código deve ter no máximo 50 caracteres'),
  title: yup
    .string()
    .required('Título é obrigatório')
    .min(3, 'Título deve ter pelo menos 3 caracteres')
    .max(200, 'Título deve ter no máximo 200 caracteres'),
  description: yup
    .string()
    .optional()
    .max(200, 'Descrição deve ter no máximo 200 caracteres'),
  requesterId: yup
    .number()
    .required('Solicitante é obrigatório'),
  priority: yup
    .string()
    .required('Prioridade é obrigatória'),
  taskType: yup.string().optional(),
  systemModule: yup
    .string()
    .optional()
    .max(100, 'Módulo deve ter no máximo 100 caracteres'),
  serverOrigin: yup
    .string()
    .optional()
    .max(100, 'Servidor deve ter no máximo 100 caracteres'),
  meetingLink: yup
    .string()
    .optional()
    .url('Link da reunião deve ser uma URL válida')
    .max(500, 'Link deve ter no máximo 500 caracteres'),
  notes: yup
    .string()
    .optional()
    .max(256, 'Notas devem ter no máximo 256 caracteres'),
  link: yup
    .string()
    .optional()
    .url('Link deve ser uma URL válida'),
});

interface FormData {
  code: string;
  title: string;
  description?: string;
  requesterId: number;
  priority?: TaskPriority;
  taskType?: TaskType;
  systemModule?: string;
  serverOrigin?: string;
  meetingLink?: string;
  notes?: string;
  link?: string;
}

type RouteParams = {
  TaskEdit: {
    id: string | number;
  };
};

const TaskEditScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'TaskEdit'>>();
  const { id } = route.params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [task, setTask] = useState<Task | null>(null);
  const [requesters, setRequesters] = useState<Requester[]>([]);
  const [showRequesterDropdown, setShowRequesterDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [showTaskTypeDropdown, setShowTaskTypeDropdown] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid, isDirty },
    reset,
  } = useForm<FormData>({
    defaultValues: {
      code: '',
      title: '',
      description: '',
      requesterId: 0,
      priority: 'MEDIUM',
      taskType: '',
      systemModule: '',
      serverOrigin: '',
      meetingLink: '',
      notes: '',
      link: '',
    },
    mode: 'onChange',
    resolver: yupResolver(schema),
  });

  const selectedRequesterId = watch('requesterId');
  const selectedPriority = watch('priority');
  const selectedTaskType = watch('taskType');

  useEffect(() => {
    loadTask();
    loadRequesters();
  }, []);

  const loadTask = async () => {
    try {
      setLoading(true);
      const data = await taskService.getById(id);
      setTask(data);
      
      reset({
        code: data.code || '',
        title: data.title || '',
        description: data.description || '',
        requesterId: Number(data.requesterId) || 0,
        priority: data.priority || 'MEDIUM',
        taskType: data.taskType || '',
        systemModule: data.systemModule || '',
        serverOrigin: data.serverOrigin || '',
        meetingLink: data.meetingLink || '',
        notes: data.notes || '',
        link: data.link || '',
      });
    } catch (error) {
      showToast('error', 'Erro ao carregar dados da tarefa');
      console.error('Error loading task:', error);
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const loadRequesters = async () => {
    try {
      const response = await requesterService.getAll({
        page: 0,
        size: 100,
        sort: [{ field: 'name', direction: 'asc' }],
      });
      setRequesters(response.content);
    } catch (error) {
      console.error('Error loading requesters:', error);
    }
  };

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      const updateData: UpdateTaskData = {
        code: data.code,
        title: data.title,
        description: data.description,
        requesterId: data.requesterId,
        priority: data.priority,
        taskType: data.taskType,
        systemModule: data.systemModule,
        serverOrigin: data.serverOrigin,
        meetingLink: data.meetingLink,
        notes: data.notes,
        link: data.link,
      };

      await taskService.update(id, updateData);
      showToast('success', 'Tarefa atualizada com sucesso!');
      navigation.goBack();
    } catch (error: any) {
      showToast('error', 'Erro ao atualizar tarefa');
      console.error('Error updating task:', error);
    } finally {
      setSaving(false);
    }
  };

  const getSelectedRequesterName = () => {
    if (!selectedRequesterId || selectedRequesterId === 0) return 'Selecione um solicitante';
    const requester = requesters.find(r => r.id === selectedRequesterId);
    return requester ? requester.name : 'Selecione um solicitante';
  };

  const getPriorityDisplay = (priority?: TaskPriority) => {
    const displays = {
      'LOW': { label: 'Baixa', color: COLORS.success, icon: '🟢' },
      'MEDIUM': { label: 'Média', color: '#FFD700', icon: '🟡' },
      'HIGH': { label: 'Alta', color: '#FF8C00', icon: '🟠' },
      'URGENT': { label: 'Urgente', color: COLORS.danger, icon: '🔴' },
    };
    return displays[priority || 'MEDIUM'];
  };

  const getTaskTypeDisplay = (taskType?: TaskType) => {
    const displays = {
      '': { label: 'Selecione um tipo', color: COLORS.gray500, icon: '📝' },
      'BUG': { label: 'Correção (Bug)', color: COLORS.danger, icon: '🐛' },
      'ENHANCEMENT': { label: 'Melhoria', color: '#FF8C00', icon: '⚡' },
      'NEW_FEATURE': { label: 'Nova Funcionalidade', color: COLORS.success, icon: '✨' },
    };
    return displays[taskType || ''];
  };

  if (loading) {
    return <LoadingSpinner overlay size="large" text="Carregando tarefa..." />;
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
        showsVerticalScrollIndicator={false}
      >
        {/* Header Info */}
        <View style={styles.headerInfo}>
          <Ionicons name="create" size={32} color={COLORS.primary} />
          <Text style={styles.headerTitle}>Editar Tarefa</Text>
          <Text style={styles.headerSubtitle}>Modifique os dados da tarefa</Text>
        </View>

        {/* Form Card */}
        <Card style={styles.formCard}>
          {/* Título */}
          <View style={styles.fieldContainer}>
            <Controller
              control={control}
              name="title"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Título *"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.title?.message}
                  leftIcon={<Ionicons name="document-text-outline" size={20} color={COLORS.primary} />}
                  placeholder="Digite o título da tarefa"
                  returnKeyType="next"
                  style={styles.input}
                />
              )}
            />
          </View>

          {/* Descrição */}
          <View style={styles.fieldContainer}>
            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Descrição"
                  value={value || ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.description?.message}
                  leftIcon={<Ionicons name="text-outline" size={20} color={COLORS.primary} />}
                  placeholder="Descreva brevemente a tarefa"
                  multiline
                  numberOfLines={3}
                  returnKeyType="next"
                  style={[styles.input, styles.textArea]}
                />
              )}
            />
          </View>

          {/* Solicitante */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Solicitante *</Text>
            <TouchableOpacity 
              style={[styles.selectButton, errors.requesterId && styles.selectButtonError]}
              onPress={() => setShowRequesterDropdown(true)}
            >
              <Ionicons name="person-outline" size={20} color={COLORS.primary} />
              <Text style={[styles.selectButtonText, selectedRequesterId === 0 && styles.selectButtonPlaceholder]}>
                {getSelectedRequesterName()}
              </Text>
              <Ionicons name="chevron-down" size={20} color={COLORS.gray400} />
            </TouchableOpacity>
            {errors.requesterId && (
              <Text style={styles.errorText}>{errors.requesterId.message}</Text>
            )}
          </View>

          {/* Prioridade */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Prioridade</Text>
            <TouchableOpacity 
              style={styles.selectButton}
              onPress={() => setShowPriorityDropdown(true)}
            >
              <Text style={styles.priorityIcon}>{getPriorityDisplay(selectedPriority).icon}</Text>
              <Text style={[styles.selectButtonText, { color: getPriorityDisplay(selectedPriority).color }]}>
                {getPriorityDisplay(selectedPriority).label}
              </Text>
              <Ionicons name="chevron-down" size={20} color={COLORS.gray400} />
            </TouchableOpacity>
          </View>

          {/* Link */}
          <View style={styles.fieldContainer}>
            <Controller
              control={control}
              name="link"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Link (opcional)"
                  value={value || ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.link?.message}
                  leftIcon={<Ionicons name="link-outline" size={20} color={COLORS.primary} />}
                  placeholder="https://exemplo.com"
                  keyboardType="url"
                  autoCapitalize="none"
                  returnKeyType="done"
                  style={styles.input}
                />
              )}
            />
          </View>
        </Card>

        {/* Requester Picker */}
        {showRequesterDropdown && (
          <Card style={styles.dropdownCard}>
            <View style={styles.dropdownHeader}>
              <Text style={styles.dropdownTitle}>Selecionar Solicitante</Text>
              <TouchableOpacity onPress={() => setShowRequesterDropdown(false)}>
                <Ionicons name="close" size={24} color={COLORS.gray500} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.dropdownList} nestedScrollEnabled>
              {requesters.map((requester) => (
                <TouchableOpacity
                  key={requester.id}
                  style={[
                    styles.dropdownItem, 
                    selectedRequesterId === requester.id && styles.dropdownItemSelected
                  ]}
                  onPress={() => {
                    setValue('requesterId', Number(requester.id));
                    setShowRequesterDropdown(false);
                  }}
                >
                  <Ionicons name="person" size={20} color={COLORS.primary} />
                  <Text style={[
                    styles.dropdownItemText,
                    selectedRequesterId === requester.id && styles.dropdownItemTextSelected
                  ]}>
                    {requester.name}
                  </Text>
                  {selectedRequesterId === requester.id && (
                    <Ionicons name="checkmark" size={20} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Card>
        )}

        {/* Priority Picker */}
        {showPriorityDropdown && (
          <Card style={styles.dropdownCard}>
            <View style={styles.dropdownHeader}>
              <Text style={styles.dropdownTitle}>Selecionar Prioridade</Text>
              <TouchableOpacity onPress={() => setShowPriorityDropdown(false)}>
                <Ionicons name="close" size={24} color={COLORS.gray500} />
              </TouchableOpacity>
            </View>
            <View>
              {(['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as TaskPriority[]).map((priority) => {
                const display = getPriorityDisplay(priority);
                return (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.dropdownItem, 
                      selectedPriority === priority && styles.dropdownItemSelected
                    ]}
                    onPress={() => {
                      setValue('priority', priority);
                      setShowPriorityDropdown(false);
                    }}
                  >
                    <Text style={styles.priorityIcon}>{display.icon}</Text>
                    <Text style={[
                      styles.dropdownItemText,
                      selectedPriority === priority && styles.dropdownItemTextSelected,
                      { color: display.color }
                    ]}>
                      {display.label}
                    </Text>
                    {selectedPriority === priority && (
                      <Ionicons name="checkmark" size={20} color={COLORS.primary} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </Card>
        )}

        {/* Informações adicionais */}
        {task && (
          <Card style={styles.infoCard}>
            <Text style={styles.infoTitle}>Informações do Sistema</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>ID:</Text>
              <Text style={styles.infoValue}>{task.id}</Text>
            </View>
            {task.code && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Código:</Text>
                <Text style={styles.infoValue}>{task.code}</Text>
              </View>
            )}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Criado em:</Text>
              <Text style={styles.infoValue}>
                {task.createdAt ? new Date(task.createdAt).toLocaleDateString('pt-BR') : 'N/A'}
              </Text>
            </View>
            {task.updatedAt && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Atualizado em:</Text>
                <Text style={styles.infoValue}>
                  {new Date(task.updatedAt).toLocaleDateString('pt-BR')}
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
  
  // Header styles
  headerInfo: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.white,
    marginBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.gray900,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.gray600,
    textAlign: 'center',
  },

  // Form styles
  formCard: {
    margin: SPACING.md,
    padding: SPACING.lg,
  },
  fieldContainer: {
    marginBottom: SPACING.lg,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray800,
    marginBottom: SPACING.sm,
  },
  input: {
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },

  // Custom select button styles
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    minHeight: 56,
  },
  selectButtonError: {
    borderColor: COLORS.danger,
  },
  selectButtonText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.gray900,
    marginLeft: SPACING.sm,
  },
  selectButtonPlaceholder: {
    color: COLORS.gray400,
  },

  // Dropdown styles
  dropdownCard: {
    margin: SPACING.md,
    marginTop: 0,
    padding: 0,
    maxHeight: 300,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  dropdownTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.gray800,
  },
  dropdownList: {
    maxHeight: 200,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  dropdownItemSelected: {
    backgroundColor: COLORS.primary + '10',
  },
  dropdownItemText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.gray800,
    marginLeft: SPACING.sm,
  },
  dropdownItemTextSelected: {
    fontWeight: '600',
    color: COLORS.primary,
  },

  // Priority specific styles
  priorityIcon: {
    fontSize: 18,
    marginRight: SPACING.xs,
  },

  // Error text
  errorText: {
    fontSize: 14,
    color: COLORS.danger,
    marginTop: SPACING.xs,
    fontWeight: '500',
  },

  // Info card styles
  infoCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    padding: SPACING.lg,
    backgroundColor: COLORS.blue50,
  },
  infoTitle: {
    fontSize: 18,
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
    fontWeight: '500',
  },

  // Bottom actions
  bottomActions: {
    flexDirection: 'row',
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
    gap: SPACING.sm,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 2,
  },
});

export default TaskEditScreen;