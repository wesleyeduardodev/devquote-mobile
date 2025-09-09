import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Switch,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

import { taskService } from '../../services/taskService';
import { requesterService } from '../../services/requesterService';
import { CreateTaskData, TaskPriority, TaskType, CreateSubTaskData } from '../../types/task.types';
import { Requester } from '../../types/requester.types';
import { Input, Button, Card, LoadingSpinner, SelectModal, FilePicker } from '../../components/ui';
import { COLORS, SPACING } from '../../constants';
import { showToast } from '../../utils/toast';
import * as DocumentPicker from 'expo-document-picker';

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
    .max(500, 'Descrição deve ter no máximo 500 caracteres'),
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
    .url('Link da tarefa deve ser uma URL válida')
    .max(500, 'Link deve ter no máximo 500 caracteres'),
  amount: yup
    .number()
    .optional()
    .min(0, 'Valor deve ser maior ou igual a zero'),
  hasSubTasks: yup.boolean().optional(),
  subTasks: yup.array().when('hasSubTasks', {
    is: true,
    then: (schema) => schema.of(
      yup.object().shape({
        title: yup.string().required('Título da subtarefa é obrigatório'),
        description: yup.string().optional(),
        amount: yup.number().required('Valor da subtarefa é obrigatório').min(0, 'Valor deve ser maior ou igual a zero'),
      })
    ).min(1, 'Adicione pelo menos uma subtarefa'),
    otherwise: (schema) => schema.optional(),
  }),
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
  amount?: number;
  hasSubTasks?: boolean;
  subTasks?: CreateSubTaskData[];
}

const TaskCreateScreen: React.FC = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [loadingRequesters, setLoadingRequesters] = useState(true);
  const [requesters, setRequesters] = useState<Requester[]>([]);
  const [showRequesterDropdown, setShowRequesterDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [showTaskTypeDropdown, setShowTaskTypeDropdown] = useState(false);
  const [totalSubTasksValue, setTotalSubTasksValue] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<DocumentPicker.DocumentPickerAsset[]>([]);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
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
      amount: 0,
      hasSubTasks: false,
      subTasks: [],
    },
    mode: 'onChange',
    resolver: yupResolver(schema),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'subTasks',
  });

  const selectedRequesterId = watch('requesterId');
  const selectedPriority = watch('priority');
  const selectedTaskType = watch('taskType');
  const hasSubTasks = watch('hasSubTasks');
  const subTasks = watch('subTasks');

  useEffect(() => {
    loadRequesters();
  }, []);

  useEffect(() => {
    if (subTasks && subTasks.length > 0) {
      const total = subTasks.reduce((sum, subtask) => sum + (subtask.amount || 0), 0);
      setTotalSubTasksValue(total);
    } else {
      setTotalSubTasksValue(0);
    }
  }, [subTasks]);

  const loadRequesters = async () => {
    try {
      setLoadingRequesters(true);
      const response = await requesterService.getAll({
        page: 0,
        size: 100,
        sort: [{ field: 'name', direction: 'asc' }],
      });
      setRequesters(response.content);
    } catch (error) {
      showToast('error', 'Erro ao carregar solicitantes');
      console.error('Error loading requesters:', error);
    } finally {
      setLoadingRequesters(false);
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

  const handleAddSubTask = () => {
    append({ title: '', description: '', amount: 0 });
  };

  const handleRemoveSubTask = (index: number) => {
    Alert.alert(
      'Remover Subtarefa',
      'Tem certeza que deseja remover esta subtarefa?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Remover', style: 'destructive', onPress: () => remove(index) },
      ]
    );
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const createData: CreateTaskData = {
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
        subTasks: data.hasSubTasks ? data.subTasks : undefined,
      };

      // Se houver arquivos, usar a API com anexos
      if (selectedFiles.length > 0) {
        await taskService.createWithFiles(createData, selectedFiles);
        showToast('success', `Tarefa criada com ${selectedFiles.length} arquivo(s) anexado(s)!`);
      } else {
        await taskService.create(createData);
        showToast('success', 'Tarefa criada com sucesso!');
      }
      
      navigation.goBack();
    } catch (error: any) {
      showToast('error', 'Erro ao criar tarefa');
      console.error('Error creating task:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loadingRequesters) {
    return <LoadingSpinner overlay size="large" text="Carregando..." />;
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
          <Ionicons name="add-circle" size={32} color={COLORS.primary} />
          <Text style={styles.headerTitle}>Nova Tarefa</Text>
          <Text style={styles.headerSubtitle}>Preencha os dados da nova tarefa</Text>
        </View>

        {/* Form Card */}
        <Card style={styles.formCard}>
          {/* Código */}
          <View style={styles.fieldContainer}>
            <Controller
              control={control}
              name="code"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Código *"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.code?.message}
                  leftIcon={<Ionicons name="pricetag-outline" size={20} color={COLORS.primary} />}
                  placeholder="Ex: TASK-001, BUG-123"
                  returnKeyType="next"
                  style={styles.input}
                />
              )}
            />
          </View>

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
            <Text style={styles.fieldLabel}>Prioridade *</Text>
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

          {/* Tipo de Tarefa */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Tipo de Tarefa</Text>
            <TouchableOpacity 
              style={styles.selectButton}
              onPress={() => setShowTaskTypeDropdown(true)}
            >
              <Text style={styles.priorityIcon}>{getTaskTypeDisplay(selectedTaskType).icon}</Text>
              <Text style={[styles.selectButtonText, { color: getTaskTypeDisplay(selectedTaskType).color }]}>
                {getTaskTypeDisplay(selectedTaskType).label}
              </Text>
              <Ionicons name="chevron-down" size={20} color={COLORS.gray400} />
            </TouchableOpacity>
          </View>

          {/* Módulo do Sistema */}
          <View style={styles.fieldContainer}>
            <Controller
              control={control}
              name="systemModule"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Módulo do Sistema"
                  value={value || ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.systemModule?.message}
                  leftIcon={<Ionicons name="cube-outline" size={20} color={COLORS.primary} />}
                  placeholder="Ex: Usuários, Relatórios, Dashboard"
                  returnKeyType="next"
                  style={styles.input}
                />
              )}
            />
          </View>

          {/* Servidor de Origem */}
          <View style={styles.fieldContainer}>
            <Controller
              control={control}
              name="serverOrigin"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Servidor de Origem"
                  value={value || ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.serverOrigin?.message}
                  leftIcon={<Ionicons name="server-outline" size={20} color={COLORS.primary} />}
                  placeholder="Ex: Produção, Homologação, Local"
                  returnKeyType="next"
                  style={styles.input}
                />
              )}
            />
          </View>

          {/* Link da Reunião */}
          <View style={styles.fieldContainer}>
            <Controller
              control={control}
              name="meetingLink"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Link da Reunião"
                  value={value || ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.meetingLink?.message}
                  leftIcon={<Ionicons name="videocam-outline" size={20} color={COLORS.primary} />}
                  placeholder="https://meet.google.com/..."
                  keyboardType="url"
                  autoCapitalize="none"
                  returnKeyType="next"
                  style={styles.input}
                />
              )}
            />
          </View>

          {/* Notas */}
          <View style={styles.fieldContainer}>
            <Controller
              control={control}
              name="notes"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Notas / Observações"
                  value={value || ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.notes?.message}
                  leftIcon={<Ionicons name="document-outline" size={20} color={COLORS.primary} />}
                  placeholder="Informações adicionais sobre a tarefa"
                  multiline
                  numberOfLines={2}
                  returnKeyType="next"
                  style={[styles.input, styles.textArea]}
                />
              )}
            />
          </View>

          {/* Link da Tarefa */}
          <View style={styles.fieldContainer}>
            <Controller
              control={control}
              name="link"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Link da Tarefa"
                  value={value || ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.link?.message}
                  leftIcon={<Ionicons name="link-outline" size={20} color={COLORS.primary} />}
                  placeholder="https://exemplo.com (opcional)"
                  keyboardType="url"
                  autoCapitalize="none"
                  returnKeyType="next"
                  style={styles.input}
                />
              )}
            />
          </View>

          {/* Checkbox de Subtarefas */}
          <View style={styles.switchContainer}>
            <View style={styles.switchLeft}>
              <Controller
                control={control}
                name="hasSubTasks"
                render={({ field: { onChange, value } }) => (
                  <Switch
                    value={value}
                    onValueChange={(val) => {
                      onChange(val);
                      if (!val) {
                        setValue('subTasks', []);
                      }
                    }}
                    trackColor={{ false: COLORS.gray300, true: COLORS.primary }}
                    thumbColor={value ? COLORS.white : COLORS.gray100}
                  />
                )}
              />
              <Text style={styles.switchLabel}>Esta tarefa possui subtarefas?</Text>
            </View>
          </View>

          {/* Valor da Tarefa */}
          {!hasSubTasks && (
            <View style={styles.fieldContainer}>
              <Controller
                control={control}
                name="amount"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Valor da Tarefa"
                    value={value?.toString() || '0'}
                    onChangeText={(text) => {
                      const numValue = parseFloat(text.replace(',', '.')) || 0;
                      onChange(numValue);
                    }}
                    onBlur={onBlur}
                    error={errors.amount?.message}
                    leftIcon={<Text style={styles.currencyIcon}>R$</Text>}
                    placeholder="0,00"
                    keyboardType="decimal-pad"
                    returnKeyType="done"
                    style={styles.input}
                  />
                )}
              />
            </View>
          )}
        </Card>

        {/* Seção de Anexos */}
        <Card style={styles.attachmentsCard}>
          <View style={styles.attachmentsHeader}>
            <Ionicons name="attach" size={24} color={COLORS.primary} />
            <Text style={styles.attachmentsTitle}>Anexos</Text>
            <Text style={styles.attachmentsSubtitle}>
              Você pode adicionar arquivos que serão anexados junto com a criação da tarefa
            </Text>
          </View>
          
          <FilePicker
            files={selectedFiles}
            onFilesChange={setSelectedFiles}
            maxFiles={10}
            maxFileSize={10}
            disabled={loading}
          />
        </Card>

        {/* Seção de Subtarefas */}
        {hasSubTasks && (
          <Card style={styles.subTasksCard}>
            <View style={styles.subTasksHeader}>
              <Text style={styles.subTasksTitle}>Subtarefas</Text>
              <View style={styles.subTasksTotal}>
                <Text style={styles.subTasksTotalLabel}>Total:</Text>
                <Text style={styles.subTasksTotalValue}>R$ {totalSubTasksValue.toFixed(2)}</Text>
              </View>
            </View>

            {fields.map((field, index) => (
              <View key={field.id} style={styles.subTaskItem}>
                <View style={styles.subTaskHeader}>
                  <Text style={styles.subTaskNumber}>Subtarefa #{index + 1}</Text>
                  <TouchableOpacity onPress={() => handleRemoveSubTask(index)}>
                    <Ionicons name="trash-outline" size={24} color={COLORS.danger} />
                  </TouchableOpacity>
                </View>

                <Controller
                  control={control}
                  name={`subTasks.${index}.title`}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Título *"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.subTasks?.[index]?.title?.message}
                      placeholder="Digite o título da subtarefa"
                      style={styles.input}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name={`subTasks.${index}.description`}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Descrição"
                      value={value || ''}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="Descreva a subtarefa (opcional)"
                      multiline
                      numberOfLines={2}
                      style={[styles.input, styles.textArea]}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name={`subTasks.${index}.amount`}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Valor"
                      value={value?.toString() || '0'}
                      onChangeText={(text) => {
                        const numValue = parseFloat(text.replace(',', '.')) || 0;
                        onChange(numValue);
                      }}
                      onBlur={onBlur}
                      error={errors.subTasks?.[index]?.amount?.message}
                      leftIcon={<Text style={styles.currencyIcon}>R$</Text>}
                      placeholder="0,00"
                      keyboardType="decimal-pad"
                      style={styles.input}
                    />
                  )}
                />
              </View>
            ))}

            <Button
              title="+ Adicionar Subtarefa"
              variant="outline"
              onPress={handleAddSubTask}
              style={styles.addSubTaskButton}
              leftIcon={<Ionicons name="add-circle-outline" size={20} color={COLORS.primary} />}
            />
          </Card>
        )}

      </ScrollView>

      {/* Modal de Seleção de Solicitante */}
      <SelectModal
        visible={showRequesterDropdown}
        onClose={() => setShowRequesterDropdown(false)}
        title="Selecionar Solicitante"
        searchable={true}
        searchPlaceholder="Buscar solicitante..."
        options={requesters.map(requester => ({
          id: requester.id,
          label: requester.name,
          value: requester.id,
          icon: <Ionicons name="person" size={20} color={COLORS.primary} />,
        }))}
        selectedValue={selectedRequesterId}
        onSelect={(option) => {
          setValue('requesterId', Number(option.value));
        }}
      />

      {/* Modal de Seleção de Prioridade */}
      <SelectModal
        visible={showPriorityDropdown}
        onClose={() => setShowPriorityDropdown(false)}
        title="Selecionar Prioridade"
        options={(['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as TaskPriority[]).map(priority => {
          const display = getPriorityDisplay(priority);
          return {
            id: priority,
            label: display.label,
            value: priority,
            icon: <Text style={{ fontSize: 18 }}>{display.icon}</Text>,
            color: display.color,
          };
        })}
        selectedValue={selectedPriority}
        onSelect={(option) => {
          setValue('priority', option.value);
        }}
      />

      {/* Modal de Seleção de Tipo de Tarefa */}
      <SelectModal
        visible={showTaskTypeDropdown}
        onClose={() => setShowTaskTypeDropdown(false)}
        title="Selecionar Tipo de Tarefa"
        options={(['', 'BUG', 'ENHANCEMENT', 'NEW_FEATURE'] as TaskType[]).map(taskType => {
          const display = getTaskTypeDisplay(taskType);
          return {
            id: taskType || 'none',
            label: display.label,
            value: taskType,
            icon: <Text style={{ fontSize: 18 }}>{display.icon}</Text>,
            color: display.color,
          };
        })}
        selectedValue={selectedTaskType}
        onSelect={(option) => {
          setValue('taskType', option.value);
        }}
      />

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
          title="Criar Tarefa"
          onPress={handleSubmit(onSubmit)}
          loading={loading}
          disabled={!isValid}
          style={styles.submitButton}
          leftIcon={<MaterialIcons name="add-task" size={20} color={COLORS.white} />}
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

  // Switch styles
  switchContainer: {
    marginBottom: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
    paddingTop: SPACING.lg,
  },
  switchLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray800,
    marginLeft: SPACING.md,
  },

  // Currency icon
  currencyIcon: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },

  // SubTasks styles
  subTasksCard: {
    margin: SPACING.md,
    padding: SPACING.lg,
  },
  subTasksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  subTasksTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.gray900,
  },
  subTasksTotal: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subTasksTotalLabel: {
    fontSize: 14,
    color: COLORS.gray600,
    marginRight: SPACING.xs,
  },
  subTasksTotalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  subTaskItem: {
    marginBottom: SPACING.xl,
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  subTaskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  subTaskNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  addSubTaskButton: {
    marginTop: SPACING.md,
  },

  // Attachments styles
  attachmentsCard: {
    margin: SPACING.md,
    padding: SPACING.lg,
  },
  attachmentsHeader: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  attachmentsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.gray900,
    marginTop: SPACING.sm,
  },
  attachmentsSubtitle: {
    fontSize: 14,
    color: COLORS.gray600,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
});

export default TaskCreateScreen;