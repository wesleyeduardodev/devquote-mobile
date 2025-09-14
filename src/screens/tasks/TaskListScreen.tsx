import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { FAB, Portal, Provider } from 'react-native-paper';

import { taskService } from '../../services/taskService';
import { Task, TaskPriority } from '../../types/task.types';
import { LoadingSpinner, Card, SelectModal } from '../../components/ui';
import { COLORS, SPACING } from '../../constants';
import { showToast } from '../../utils/toast';

interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
  label: string;
}

interface FilterState {
  priority?: TaskPriority | '';
  hasSubTasks?: boolean | '';
  dateFrom?: string;
  dateTo?: string;
}

const TaskListScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [filters, setFilters] = useState<FilterState>({});
  const [sortBy, setSortBy] = useState<SortOption>({
    field: 'id',
    direction: 'desc',
    label: 'Mais Recentes'
  });
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    total: 0,
    hasMore: true,
  });

  const sortOptions: SortOption[] = [
    { field: 'id', direction: 'desc', label: 'Mais Recentes' },
    { field: 'id', direction: 'asc', label: 'Mais Antigas' },
    { field: 'title', direction: 'asc', label: 'Título (A-Z)' },
    { field: 'title', direction: 'desc', label: 'Título (Z-A)' },
    { field: 'priority', direction: 'desc', label: 'Prioridade (Alta-Baixa)' },
    { field: 'priority', direction: 'asc', label: 'Prioridade (Baixa-Alta)' },
  ];

  const loadTasks = useCallback(async (page = 0, resetList = false) => {
    try {
      if (page === 0) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await taskService.getAll({
        page,
        size: pagination.size,
        sort: [{ field: sortBy.field, direction: sortBy.direction }],
        filters: {
          ...(searchQuery && { title: searchQuery }),
          ...(filters.priority && { priority: filters.priority }),
        },
      });

      const newTasks = resetList ? response.content : [...tasks, ...response.content];
      const hasMore = response.content.length === pagination.size;
      
      setTasks(newTasks);
      setFilteredTasks(newTasks);
      setPagination(prev => ({
        ...prev,
        page,
        total: response.totalElements || response.content.length,
        hasMore,
      }));
    } catch (error) {
      showToast('error', 'Erro ao carregar tarefas');
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [pagination.size, sortBy, searchQuery, filters]); // Removido 'tasks' para evitar loop infinito

  useFocusEffect(
    useCallback(() => {
      // Reset da lista quando a tela ganha foco
      setPagination(prev => ({ ...prev, page: 0, hasMore: true }));
      setTasks([]);
      setFilteredTasks([]);
      loadTasks(0, true);
    }, [loadTasks])
  );

  // Debounce para busca e reload das tarefas  
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery !== '' || Object.keys(filters).length > 0) {
        // Reset paginação quando há filtros/busca
        setPagination(prev => ({ ...prev, page: 0, hasMore: true }));
        loadTasks(0, true);
      }
    }, 500); // Debounce de 500ms

    return () => clearTimeout(timeoutId);
  }, [searchQuery, filters, loadTasks]);

  // Effect separado para mudança de ordenação
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 0, hasMore: true }));
    loadTasks(0, true);
  }, [sortBy, loadTasks]);

  // Aplicar filtros locais (além dos filtros da API)
  useEffect(() => {
    let filtered = [...tasks];

    if (filters.hasSubTasks !== undefined && filters.hasSubTasks !== '') {
      filtered = filtered.filter(task => 
        filters.hasSubTasks ? 
          (task.subTasks && task.subTasks.length > 0) : 
          (!task.subTasks || task.subTasks.length === 0)
      );
    }

    setFilteredTasks(filtered);
  }, [tasks, filters]);

  const handleRefresh = () => {
    setRefreshing(true);
    setPagination(prev => ({ ...prev, page: 0, hasMore: true }));
    loadTasks(0, true); // Reset da lista no refresh
  };

  const handleLoadMore = () => {
    if (pagination.hasMore && !loadingMore && !loading) {
      const nextPage = pagination.page + 1;
      loadTasks(nextPage, false);
    }
  };

  const handleEdit = (task: Task) => {
    navigation.navigate('TaskEdit', { id: task.id });
  };

  const handleDelete = (task: Task) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Deseja realmente excluir a tarefa "${task.title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await taskService.delete(task.id);
              showToast('success', 'Tarefa excluída com sucesso');
              loadTasks();
            } catch (error) {
              showToast('error', 'Erro ao excluir tarefa');
              console.error('Error deleting task:', error);
            }
          },
        },
      ]
    );
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'URGENT':
        return COLORS.danger;
      case 'HIGH':
        return '#FF8C00';
      case 'MEDIUM':
        return '#FFD700';
      case 'LOW':
        return COLORS.success;
      default:
        return COLORS.gray500;
    }
  };

  const getPriorityLabel = (priority?: string) => {
    switch (priority) {
      case 'URGENT':
        return 'Urgente';
      case 'HIGH':
        return 'Alta';
      case 'MEDIUM':
        return 'Média';
      case 'LOW':
        return 'Baixa';
      default:
        return '';
    }
  };

  const getTaskTypeDisplay = (taskType?: TaskPriority | string) => {
    const displays = {
      '': { label: 'Tipo não definido', color: COLORS.gray500, icon: '📝' },
      'BUG': { label: 'Correção', color: COLORS.danger, icon: '🐛' },
      'ENHANCEMENT': { label: 'Melhoria', color: '#FF8C00', icon: '⚡' },
      'NEW_FEATURE': { label: 'Nova Funcionalidade', color: COLORS.success, icon: '✨' },
    };
    return displays[taskType || ''] || displays[''];
  };

  const calculateTaskTotal = (task: Task): number => {
    if (task.subTasks && task.subTasks.length > 0) {
      return task.subTasks.reduce((total, subtask) => total + (subtask.amount || 0), 0);
    }
    return 0;
  };

  const renderTask = ({ item }: { item: Task }) => {
    const taskType = getTaskTypeDisplay(item.taskType);
    const totalAmount = calculateTaskTotal(item);
    
    return (
      <Card style={styles.taskCard}>
        <TouchableOpacity
          onPress={() => handleEdit(item)}
          style={styles.taskContent}
          activeOpacity={0.7}
        >
          {/* Header com checkbox, ID, código e prioridade */}
          <View style={styles.taskHeader}>
            <View style={styles.taskHeaderLeft}>
              <View style={styles.checkboxContainer}>
                <View style={styles.checkbox} />
              </View>
              <View style={styles.taskIdBadge}>
                <Text style={styles.taskIdText}>#{item.id}</Text>
              </View>
              {item.code && (
                <View style={styles.taskCodeBadge}>
                  <Text style={styles.taskCodeText}>{item.code}</Text>
                </View>
              )}
              <Text style={styles.taskPlatform}>mobile</Text>
            </View>
            {item.priority && (
              <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
                <Text style={styles.priorityText}>{getPriorityLabel(item.priority)}</Text>
              </View>
            )}
          </View>

          {/* Título da tarefa */}
          <Text style={styles.taskTitle} numberOfLines={1} ellipsizeMode="tail">
            {item.title}
          </Text>

          {/* Tipo de tarefa */}
          {item.taskType && (
            <View style={styles.taskTypeContainer}>
              <Text style={styles.taskTypeIcon}>{taskType.icon}</Text>
              <Text style={[styles.taskTypeText, { color: taskType.color }]}>
                {taskType.label}
              </Text>
            </View>
          )}

          {/* Ícones de ações */}
          <View style={styles.taskIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="eye-outline" size={20} color={COLORS.gray600} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="cash-outline" size={20} color={COLORS.gray600} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="mail-outline" size={20} color={COLORS.gray600} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="create-outline" size={20} color={COLORS.gray600} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="trash-outline" size={20} color={COLORS.gray600} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="person-outline" size={20} color={COLORS.gray600} />
            </TouchableOpacity>
          </View>

          {/* Solicitante */}
          {item.requesterName && (
            <View style={styles.requesterContainer}>
              <Ionicons name="person" size={16} color={COLORS.warning} />
              <Text style={styles.requesterName}>{item.requesterName}</Text>
            </View>
          )}

          {/* Projetos - placeholder por enquanto */}
          <View style={styles.projectsContainer}>
            <View style={styles.projectItem}>
              <View style={styles.projectFolder}>
                <Ionicons name="folder" size={16} color={COLORS.warning} />
              </View>
              <Text style={styles.projectName}>Teste</Text>
            </View>
            <View style={styles.projectItem}>
              <View style={styles.projectFolder}>
                <Ionicons name="folder" size={16} color={COLORS.info} />
              </View>
              <Text style={styles.projectName}>Bdbd</Text>
            </View>
          </View>

          {/* Footer com subtarefas e valor */}
          <View style={styles.taskFooter}>
            <View style={styles.subtaskInfo}>
              <Ionicons name="checkmark-circle-outline" size={16} color={COLORS.gray600} />
              <Text style={styles.subtaskText}>
                {item.subTasks ? item.subTasks.length : 0} subtarefa(s)
              </Text>
            </View>
            <Text style={styles.taskValue}>R$ {totalAmount.toFixed(2).replace('.', ',')}</Text>
          </View>
        </TouchableOpacity>
      </Card>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="clipboard-outline" size={64} color={COLORS.gray400} />
      <Text style={styles.emptyText}>Nenhuma tarefa encontrada</Text>
      <Text style={styles.emptySubtext}>
        {searchQuery
          ? 'Tente buscar por outro termo'
          : 'Adicione uma nova tarefa para começar'}
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    
    return (
      <View style={styles.footerLoading}>
        <LoadingSpinner size="small" text="Carregando mais tarefas..." />
      </View>
    );
  };

  if (loading) {
    return <LoadingSpinner overlay size="large" text="Carregando tarefas..." />;
  }

  return (
    <Provider>
      <View style={styles.container}>
        {/* Search and Filter Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={COLORS.gray500} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por título, código, solicitante..."
              placeholderTextColor={COLORS.gray400}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={COLORS.gray500} />
              </TouchableOpacity>
            ) : null}
          </View>
          
          {/* Filter and Sort Controls */}
          <View style={styles.controlsRow}>
            <TouchableOpacity
              style={[styles.controlButton, Object.keys(filters).length > 0 && styles.controlButtonActive]}
              onPress={() => setShowFilterModal(true)}
            >
              <Ionicons name="funnel-outline" size={18} color={Object.keys(filters).length > 0 ? COLORS.white : COLORS.gray600} />
              <Text style={[styles.controlButtonText, Object.keys(filters).length > 0 && styles.controlButtonTextActive]}>
                Filtros{Object.keys(filters).length > 0 ? ` (${Object.keys(filters).length})` : ''}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => setShowSortModal(true)}
            >
              <Ionicons name="swap-vertical-outline" size={18} color={COLORS.gray600} />
              <Text style={styles.controlButtonText}>{sortBy.label}</Text>
            </TouchableOpacity>
          </View>
          
          {/* Task Counter */}
          {filteredTasks.length > 0 && (
            <View style={styles.counterContainer}>
              <Text style={styles.counterText}>
                {filteredTasks.length} tarefa{filteredTasks.length > 1 ? 's' : ''}
                {pagination.hasMore && ' (carregando...)'}
              </Text>
            </View>
          )}
        </View>

        {/* List */}
        <FlatList
          data={filteredTasks}
          renderItem={renderTask}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.2}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[COLORS.primary]}
            />
          }
          initialNumToRender={10}
          maxToRenderPerBatch={5}
          windowSize={10}
          removeClippedSubviews={true}
        />

        {/* FAB */}
        <Portal>
          <FAB
            style={styles.fab}
            icon="plus"
            onPress={() => navigation.navigate('TaskCreate')}
            color={COLORS.white}
          />
        </Portal>

        {/* Modal de Filtros */}
        <Modal
          visible={showFilterModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowFilterModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.filterModalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Filtros</Text>
                <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                  <Ionicons name="close" size={24} color={COLORS.gray700} />
                </TouchableOpacity>
              </View>

              {/* Filtro de Prioridade */}
              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>Prioridade</Text>
                <TouchableOpacity
                  style={styles.filterSelect}
                  onPress={() => {
                    // Implementar seleção de prioridade
                  }}
                >
                  <Text style={styles.filterSelectText}>
                    {filters.priority ? getPriorityLabel(filters.priority) : 'Todas'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color={COLORS.gray400} />
                </TouchableOpacity>
              </View>

              {/* Filtro de Subtarefas */}
              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>Subtarefas</Text>
                <View style={styles.filterOptions}>
                  <TouchableOpacity
                    style={[
                      styles.filterOption,
                      filters.hasSubTasks === '' && styles.filterOptionActive,
                    ]}
                    onPress={() => setFilters(prev => ({ ...prev, hasSubTasks: '' }))}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      filters.hasSubTasks === '' && styles.filterOptionTextActive,
                    ]}>Todas</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.filterOption,
                      filters.hasSubTasks === true && styles.filterOptionActive,
                    ]}
                    onPress={() => setFilters(prev => ({ ...prev, hasSubTasks: true }))}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      filters.hasSubTasks === true && styles.filterOptionTextActive,
                    ]}>Com Subtarefas</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.filterOption,
                      filters.hasSubTasks === false && styles.filterOptionActive,
                    ]}
                    onPress={() => setFilters(prev => ({ ...prev, hasSubTasks: false }))}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      filters.hasSubTasks === false && styles.filterOptionTextActive,
                    ]}>Sem Subtarefas</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.filterActions}>
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() => {
                    setFilters({});
                    setShowFilterModal(false);
                  }}
                >
                  <Text style={styles.clearButtonText}>Limpar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.applyButton}
                  onPress={() => setShowFilterModal(false)}
                >
                  <Text style={styles.applyButtonText}>Aplicar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Modal de Ordenação */}
        <SelectModal
          visible={showSortModal}
          onClose={() => setShowSortModal(false)}
          title="Ordenar por"
          options={sortOptions.map(option => ({
            id: `${option.field}-${option.direction}`,
            label: option.label,
            value: option,
            icon: <Ionicons 
              name={option.direction === 'desc' ? 'arrow-down-outline' : 'arrow-up-outline'} 
              size={20} 
              color={COLORS.primary} 
            />,
          }))}
          selectedValue={sortBy}
          onSelect={(option) => {
            setSortBy(option.value);
          }}
        />
      </View>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray50,
  },
  searchContainer: {
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray50,
    borderRadius: 10,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: 16,
    color: COLORS.gray900,
  },
  listContent: {
    padding: SPACING.md,
    paddingBottom: 80,
  },
  taskCard: {
    marginBottom: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 0,
    elevation: 2,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  taskContent: {
    padding: SPACING.md,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  taskHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkboxContainer: {
    marginRight: SPACING.sm,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 2,
    borderColor: COLORS.gray300,
    borderRadius: 3,
    backgroundColor: COLORS.white,
  },
  taskIdBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: SPACING.xs,
  },
  taskIdText: {
    fontSize: 12,
    color: COLORS.white,
    fontWeight: '600',
  },
  taskCodeBadge: {
    backgroundColor: '#4A5568',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: SPACING.sm,
  },
  taskCodeText: {
    fontSize: 12,
    color: COLORS.white,
    fontWeight: '600',
  },
  taskPlatform: {
    fontSize: 12,
    color: COLORS.gray600,
    fontWeight: '500',
    marginRight: SPACING.sm,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 12,
    color: COLORS.white,
    fontWeight: '600',
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.gray900,
    marginBottom: SPACING.sm,
    flex: 1,
  },
  taskTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  taskTypeIcon: {
    fontSize: 16,
    marginRight: SPACING.xs,
  },
  taskTypeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  taskIcons: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
    flexWrap: 'wrap',
  },
  iconButton: {
    padding: SPACING.xs,
    marginRight: SPACING.sm,
  },
  requesterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  requesterName: {
    fontSize: 14,
    color: COLORS.gray700,
    marginLeft: SPACING.xs,
    fontWeight: '500',
  },
  projectsContainer: {
    marginBottom: SPACING.sm,
  },
  projectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  projectFolder: {
    marginRight: SPACING.xs,
  },
  projectName: {
    fontSize: 14,
    color: COLORS.gray700,
    fontWeight: '500',
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
  },
  subtaskInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subtaskText: {
    fontSize: 12,
    color: COLORS.gray600,
    marginLeft: SPACING.xs,
  },
  taskValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.success,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.gray700,
    marginTop: SPACING.md,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.gray500,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  footerLoading: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  counterContainer: {
    marginTop: SPACING.sm,
    alignItems: 'center',
  },
  counterText: {
    fontSize: 14,
    color: COLORS.gray600,
    fontWeight: '500',
  },
  
  // Controls styles
  controlsRow: {
    flexDirection: 'row',
    marginTop: SPACING.sm,
    gap: SPACING.sm,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    backgroundColor: COLORS.white,
  },
  controlButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  controlButtonText: {
    fontSize: 14,
    color: COLORS.gray600,
    marginLeft: SPACING.xs,
    fontWeight: '500',
  },
  controlButtonTextActive: {
    color: COLORS.white,
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  filterModalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: SPACING.lg,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.gray900,
  },
  filterGroup: {
    marginBottom: SPACING.lg,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray800,
    marginBottom: SPACING.sm,
  },
  filterSelect: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    borderRadius: 12,
    backgroundColor: COLORS.white,
  },
  filterSelectText: {
    fontSize: 16,
    color: COLORS.gray800,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  filterOption: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    backgroundColor: COLORS.white,
  },
  filterOptionActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterOptionText: {
    fontSize: 14,
    color: COLORS.gray600,
    fontWeight: '500',
  },
  filterOptionTextActive: {
    color: COLORS.white,
  },
  filterActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.lg,
  },
  clearButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    backgroundColor: COLORS.white,
  },
  clearButtonText: {
    fontSize: 16,
    color: COLORS.gray600,
    fontWeight: '600',
  },
  applyButton: {
    flex: 2,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: COLORS.primary,
  },
  applyButtonText: {
    fontSize: 16,
    color: COLORS.white,
    fontWeight: '600',
  },
});

export default TaskListScreen;