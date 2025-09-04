import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Card, LoadingSpinner } from '../../components/ui';
import { COLORS, SPACING, TYPOGRAPHY } from '../../constants';
import { Project } from '../../types';
import { projectService } from '../../services/api';

const ProjectListScreen: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadProjects = async () => {
    try {
      const response = await projectService.getAllProjects({
        page: 0,
        size: 50,
        sort: 'name,asc',
      });

      if (response.success && response.data) {
        setProjects(response.data.content);
      } else {
        Alert.alert('Erro', 'Não foi possível carregar os projetos');
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      Alert.alert('Erro', 'Erro ao carregar projetos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadProjects();
  };

  const getStatusColor = (active: boolean): string => {
    return active ? COLORS.success : COLORS.gray400;
  };

  const getStatusLabel = (active: boolean): string => {
    return active ? 'Ativo' : 'Inativo';
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <LoadingSpinner
          size="large"
          text="Carregando projetos..."
          testID="project-loading"
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[COLORS.primary]}
          tintColor={COLORS.primary}
        />
      }
      testID="project-scroll"
    >
      <View style={styles.header}>
        <Text style={styles.title}>Projetos</Text>
        <Text style={styles.subtitle}>
          {projects.length} {projects.length === 1 ? 'projeto encontrado' : 'projetos encontrados'}
        </Text>
      </View>

      {projects.length === 0 ? (
        <Card variant="elevated" style={styles.emptyCard}>
          <View style={styles.emptyContainer}>
            <Ionicons name="folder-outline" size={48} color={COLORS.gray400} />
            <Text style={styles.emptyTitle}>Nenhum projeto encontrado</Text>
            <Text style={styles.emptySubtitle}>
              Os projetos aparecerão aqui quando forem criados
            </Text>
          </View>
        </Card>
      ) : (
        <View style={styles.projectList}>
          {projects.map((project) => (
            <TouchableOpacity
              key={project.id}
              activeOpacity={0.7}
              onPress={() => {
                Alert.alert('Info', `Projeto: ${project.name}`);
              }}
            >
              <Card variant="elevated" style={styles.projectCard}>
                <View style={styles.projectHeader}>
                  <View style={styles.projectTitleContainer}>
                    <Text style={styles.projectName} numberOfLines={2}>
                      {project.name}
                    </Text>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(project.active) + '20' }
                    ]}>
                      <View style={[
                        styles.statusDot,
                        { backgroundColor: getStatusColor(project.active) }
                      ]} />
                      <Text style={[
                        styles.statusText,
                        { color: getStatusColor(project.active) }
                      ]}>
                        {getStatusLabel(project.active)}
                      </Text>
                    </View>
                  </View>
                </View>

                {project.description && (
                  <Text style={styles.projectDescription} numberOfLines={3}>
                    {project.description}
                  </Text>
                )}

                {project.repositoryUrl && (
                  <View style={styles.repositoryContainer}>
                    <Ionicons name="logo-github" size={16} color={COLORS.gray600} />
                    <Text style={styles.repositoryText} numberOfLines={1}>
                      {project.repositoryUrl.replace(/^https?:\/\//, '')}
                    </Text>
                  </View>
                )}

                <View style={styles.projectMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="calendar-outline" size={16} color={COLORS.gray500} />
                    <Text style={styles.metaText}>
                      Criado em {formatDate(project.createdAt || new Date().toISOString())}
                    </Text>
                  </View>

                  {project.updatedAt && project.updatedAt !== project.createdAt && (
                    <View style={styles.metaItem}>
                      <Ionicons name="refresh-outline" size={16} color={COLORS.gray500} />
                      <Text style={styles.metaText}>
                        Atualizado em {formatDate(project.updatedAt)}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.projectStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>
                      0
                    </Text>
                    <Text style={styles.statLabel}>
                      Tarefas
                    </Text>
                  </View>

                  <View style={styles.statDivider} />

                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>
                      0
                    </Text>
                    <Text style={styles.statLabel}>
                      Entregas
                    </Text>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray50,
  },
  content: {
    padding: SPACING.lg,
  },
  header: {
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.heading.h2,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gray900,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.gray600,
  },
  emptyCard: {
    marginTop: SPACING.xl,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gray900,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.gray600,
    textAlign: 'center',
  },
  projectList: {
    gap: SPACING.md,
  },
  projectCard: {
    marginBottom: SPACING.sm,
  },
  projectHeader: {
    marginBottom: SPACING.sm,
  },
  projectTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  projectName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gray900,
    flex: 1,
    marginRight: SPACING.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.xs,
  },
  statusText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  projectDescription: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.gray700,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  repositoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  repositoryText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray600,
    marginLeft: SPACING.xs,
    flex: 1,
  },
  projectMeta: {
    marginBottom: SPACING.md,
    gap: SPACING.xs,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray600,
    marginLeft: SPACING.xs,
  },
  projectStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: TYPOGRAPHY.fontSize.heading.h3,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gray600,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.gray200,
  },
});

export default ProjectListScreen;