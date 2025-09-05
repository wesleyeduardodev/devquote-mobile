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
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { FAB, Portal, Provider } from 'react-native-paper';

import { projectService } from '../../services/projectService';
import { Project } from '../../types/project.types';
import { LoadingSpinner, Card } from '../../components/ui';
import { COLORS, SPACING } from '../../constants';
import { showToast } from '../../utils/toast';

const ProjectListScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);

  const loadProjects = useCallback(async () => {
    try {
      const response = await projectService.getAll({
        page: 0,
        size: 100,
        sort: [{ field: 'name', direction: 'asc' }],
      });
      setProjects(response.content);
      setFilteredProjects(response.content);
    } catch (error) {
      showToast('error', 'Erro ao carregar projetos');
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProjects();
    }, [loadProjects])
  );

  useEffect(() => {
    if (searchQuery) {
      const filtered = projects.filter(
        (project) =>
          project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          project.repositoryUrl?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProjects(filtered);
    } else {
      setFilteredProjects(projects);
    }
  }, [searchQuery, projects]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadProjects();
  };

  const handleEdit = (project: Project) => {
    navigation.navigate('ProjectEdit', { id: project.id });
  };

  const handleDelete = (project: Project) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Deseja realmente excluir o projeto "${project.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await projectService.delete(project.id);
              showToast('success', 'Projeto excluído com sucesso');
              loadProjects();
            } catch (error) {
              showToast('error', 'Erro ao excluir projeto');
              console.error('Error deleting project:', error);
            }
          },
        },
      ]
    );
  };

  const renderProject = ({ item }: { item: Project }) => {
    return (
      <Card style={styles.projectCard}>
        <TouchableOpacity
          onPress={() => handleEdit(item)}
          style={styles.projectContent}
          activeOpacity={0.7}
        >
          <View style={styles.projectHeader}>
            <View style={styles.projectInfo}>
              <Text style={styles.projectName}>{item.name}</Text>
              {item.repositoryUrl && (
                <View style={styles.projectDetails}>
                  <Ionicons name="link-outline" size={14} color={COLORS.gray600} />
                  <Text style={styles.repositoryUrl} numberOfLines={1}>
                    {item.repositoryUrl}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEdit(item)}
          >
            <MaterialIcons name="edit" size={20} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDelete(item)}
          >
            <MaterialIcons name="delete" size={20} color={COLORS.danger} />
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="folder-outline" size={64} color={COLORS.gray400} />
      <Text style={styles.emptyText}>Nenhum projeto encontrado</Text>
      <Text style={styles.emptySubtext}>
        {searchQuery
          ? 'Tente buscar por outro termo'
          : 'Adicione um novo projeto para começar'}
      </Text>
    </View>
  );

  if (loading) {
    return <LoadingSpinner overlay size="large" text="Carregando projetos..." />;
  }

  return (
    <Provider>
      <View style={styles.container}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={COLORS.gray500} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por nome ou URL do repositório..."
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
        </View>

        {/* List */}
        <FlatList
          data={filteredProjects}
          renderItem={renderProject}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[COLORS.primary]}
            />
          }
        />

        {/* FAB */}
        <Portal>
          <FAB
            style={styles.fab}
            icon="plus"
            onPress={() => navigation.navigate('ProjectCreate')}
            color={COLORS.white}
          />
        </Portal>
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
  projectCard: {
    marginBottom: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 0,
    elevation: 2,
  },
  projectContent: {
    padding: SPACING.md,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  projectInfo: {
    flex: 1,
  },
  projectName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.gray900,
    marginBottom: 4,
  },
  projectDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  repositoryUrl: {
    fontSize: 14,
    color: COLORS.gray600,
    marginLeft: 6,
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  actionButton: {
    padding: SPACING.sm,
    marginLeft: SPACING.sm,
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
});

export default ProjectListScreen;