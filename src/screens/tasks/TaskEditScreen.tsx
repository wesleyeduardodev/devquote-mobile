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
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

import { taskService } from '../../services/taskService';
import { requesterService } from '../../services/requesterService';
import { Task, UpdateTaskData, TaskPriority, TaskType, CreateTaskData, SubTask, CreateSubTaskData } from '../../types/task.types';
import { Requester } from '../../types/requester.types';
import { Input, Button, Card, LoadingSpinner, SelectModal } from '../../components/ui';
import FilePicker from '../../components/ui/FilePicker';
import { COLORS, SPACING } from '../../constants';
import { showToast } from '../../utils/toast';
import * as DocumentPicker from 'expo-document-picker';

const schema = yup.object().shape({
  code: yup
    .string()
    .required('Código é obrigatório')
    .max(100, 'Código deve ter no máximo 100 caracteres'),
  title: yup
    .string()
    .required('Título é obrigatório')
    .max(200, 'Título deve ter no máximo 200 caracteres'),
  description: yup
    .string()
    .optional(),
  requesterId: yup
    .number()
    .required('Solicitante é obrigatório'),
  priority: yup
    .string()
    .required('Prioridade é obrigatória')
    .max(20, 'Prioridade deve ter no máximo 20 caracteres'),
  taskType: yup
    .string()
    .optional()
    .max(50, 'Tipo de tarefa deve ter no máximo 50 caracteres'),
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
  link: yup
    .string()
    .optional()
    .url('Link da tarefa deve ser uma URL válida')
    .max(200, 'Link deve ter no máximo 200 caracteres'),
  amount: yup
    .number()
    .optional()
    .nullable()
    .min(0, 'Valor deve ser maior ou igual a zero'),
  hasSubTasks: yup.boolean().optional(),
  subTasks: yup.array().when('hasSubTasks', {
    is: true,
    then: (schema) => schema.of(
      yup.object().shape({
        title: yup.string().required('Título da subtarefa é obrigatório').max(200, 'Máximo 200 caracteres'),
        description: yup.string().optional(),
        amount: yup.number().required('Valor da subtarefa é obrigatório').min(0, 'Valor deve ser maior ou igual a zero'),
      })
    ).min(1, 'Quando "Esta tarefa possui subtarefas" estiver marcado, você deve adicionar pelo menos uma subtarefa'),
    otherwise: (schema) => schema.optional(),
  }),
});

interface FormData {
  code: string;
  title: string;
  description?: string;
  requesterId: number;
  priority: TaskPriority;
  taskType?: TaskType | '';
  systemModule?: string;
  serverOrigin?: string;
  meetingLink?: string;
  link?: string;
  hasSubTasks?: boolean;
  amount?: number;
  subTasks?: CreateSubTaskData[];
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
  const [selectedFiles, setSelectedFiles] = useState<DocumentPicker.DocumentPickerAsset[]>([]);
  const [totalSubTasksValue, setTotalSubTasksValue] = useState(0);

  // Estados para controlar o texto de entrada dos campos monetários
  const [amountText, setAmountText] = useState('');
  const [subtaskAmountTexts, setSubtaskAmountTexts] = useState<{[key: number]: string}>({});

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
    reset,
  } = useForm<FormData>({
    defaultValues: {
      code: '',
      title: '',
      description: '',
      requesterId: 0,
      priority: 'MEDIUM' as TaskPriority,
      taskType: '' as TaskType | '',
      systemModule: '',
      serverOrigin: '',
      meetingLink: '',
      link: '',
      hasSubTasks: false,
      amount: 0,
      subTasks: [],
    },
    mode: 'onChange',
  });

  const selectedRequesterId = watch('requesterId');
  const selectedPriority = watch('priority');
  const selectedTaskType = watch('taskType');
  const hasSubTasks = watch('hasSubTasks');
  const subTasks = watch('subTasks');

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'subTasks'
  });

  useEffect(() => {
    loadTask();
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

  // Funções de formatação monetária (igual ao create)
  const formatCurrencyDisplay = (value: string): string => {
    if (!value || value === '') return '';
    const cleaned = value.replace(/[^\d,\.]/g, '');
    if (/^\d+$/.test(cleaned)) {
      const num = parseFloat(cleaned);
      return num.toFixed(2).replace('.', ',');
    }
    return cleaned;
  };

  const parseTextToNumber = (text: string): number | undefined => {
    if (!text || text.trim() === '') return undefined;
    const cleaned = text.replace(/[^\d,\.]/g, '');
    if (cleaned === '') return undefined;
    const normalized = cleaned.replace(',', '.');
    const num = parseFloat(normalized);
    return isNaN(num) ? undefined : Math.round(num * 100) / 100;
  };

  const loadTask = async () => {
    try {
      setLoading(true);
      const data = await taskService.getById(id);
      setTask(data);
      
      // Calcula o valor total se não há subtarefas (valor deve estar na própria tarefa)
      const taskAmount = (!data.subTasks || data.subTasks.length === 0)
        ? (data.subTasks?.[0]?.amount || 0) // Se não tem subtarefas, pode ter valor
        : undefined;

      // Inicializa os textos dos valores monetários
      if (taskAmount && taskAmount > 0) {
        setAmountText(taskAmount.toFixed(2).replace('.', ','));
      }

      // Inicializa textos das subtarefas
      if (data.subTasks && data.subTasks.length > 0) {
        const initialSubtaskTexts: {[key: number]: string} = {};
        data.subTasks.forEach((subtask, index) => {
          if (subtask.amount && subtask.amount > 0) {
            initialSubtaskTexts[index] = subtask.amount.toFixed(2).replace('.', ',');
          }
        });
        setSubtaskAmountTexts(initialSubtaskTexts);
      }

      // Popula o formulário com os dados da tarefa
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
        link: data.link || '',
        hasSubTasks: data.subTasks && data.subTasks.length > 0,
        amount: taskAmount,
        subTasks: data.subTasks?.map(st => ({
          title: st.title,
          description: st.description || '',
          amount: st.amount || 0
        })) || [],
      });
    } catch (error) {
      showToast('error', 'Erro ao carregar tarefa');
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

  const getTaskTypeDisplay = (taskType?: TaskType | '') => {
    const displays = {
      '': { label: 'Não especificado', color: COLORS.gray600, icon: '📝' },
      'BUG': { label: 'Correção (Bug)', color: COLORS.danger, icon: '🐛' },
      'ENHANCEMENT': { label: 'Melhoria', color: '#FF8C00', icon: '⚡' },
      'NEW_FEATURE': { label: 'Nova Funcionalidade', color: COLORS.success, icon: '✨' },
    };
    return displays[taskType || ''];
  };

  const handleAddSubTask = () => {
    append({ title: '', description: '', amount: 0 } as CreateSubTaskData);
  };

  const handleRemoveSubTask = (index: number) => {
    remove(index);
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
        link: data.link,
        subTasks: data.hasSubTasks ? data.subTasks : undefined,
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
          {/* Solicitante - Primeiro campo */}
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
                      placeholder="Digite o título da subtarefa&#10;Máximo 200 caracteres"
                      multiline
                      numberOfLines={2}
                      style={[styles.input, styles.textArea]}
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
                      placeholder="Descreva a subtarefa em detalhes (opcional)&#10;Sem limite de caracteres..."
                      multiline
                      numberOfLines={4}
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

        {/* Seção de Anexos */}
        <Card style={styles.attachmentsCard}>
          <View style={styles.attachmentsHeader}>
            <Ionicons name="attach" size={24} color={COLORS.primary} />
            <Text style={styles.attachmentsTitle}>Anexos</Text>
            <Text style={styles.attachmentsSubtitle}>
              Você pode adicionar arquivos que serão anexados à tarefa
            </Text>
          </View>
          
          <FilePicker
            files={selectedFiles}
            onFilesChange={setSelectedFiles}
            maxFiles={10}
            maxFileSize={10}
            disabled={saving}
          />
        </Card>

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
          disabled={saving}
        />
        <Button
          title="Salvar Alterações"
          onPress={handleSubmit(onSubmit)}
          loading={saving}
          disabled={!isValid}
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
  headerInfo: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.white,
    marginBottom: SPACING.md,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.gray900,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.gray600,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },

  // Form styles
  formCard: {
    margin: SPACING.md,
    padding: SPACING.lg,
  },
  attachmentsCard: {
    margin: SPACING.md,
    padding: SPACING.lg,
  },
  attachmentsHeader: {
    marginBottom: SPACING.md,
  },
  attachmentsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.gray900,
    marginTop: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  attachmentsSubtitle: {
    fontSize: 14,
    color: COLORS.gray600,
    lineHeight: 20,
  },
  switchContainer: {
    marginBottom: SPACING.lg,
  },
  switchLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.gray900,
    marginLeft: SPACING.md,
  },
  subTasksCard: {
    margin: SPACING.md,
    padding: SPACING.lg,
  },
  subTasksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  subTasksTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.gray900,
  },
  subTasksTotal: {
    alignItems: 'flex-end',
  },
  subTasksTotalLabel: {
    fontSize: 14,
    color: COLORS.gray600,
  },
  subTasksTotalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.success,
  },
  subTaskItem: {
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.gray50,
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
    borderColor: COLORS.primary,
    backgroundColor: 'transparent',
  },
  currencyIcon: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  fieldContainer: {
    marginBottom: SPACING.lg,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray900,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.white,
  },
  textArea: {
    minHeight: 80,
  },

  // Select styles
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
    color: COLORS.gray500,
  },
  priorityIcon: {
    fontSize: 20,
  },
  errorText: {
    fontSize: 14,
    color: COLORS.danger,
    marginTop: SPACING.xs,
  },

  // Bottom actions
  bottomActions: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
    gap: SPACING.md,
  },
  cancelButton: {
    flex: 1,
    borderColor: COLORS.gray400,
  },
  submitButton: {
    flex: 1,
  },
});

export default TaskEditScreen;