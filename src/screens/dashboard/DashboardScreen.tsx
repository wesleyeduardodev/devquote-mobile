import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Card, LoadingSpinner } from '../../components/ui';
import { COLORS, SPACING, TYPOGRAPHY } from '../../constants';
import { TaskStatistics, DeliveryStats, ProjectStatistics } from '../../types';
import { taskService, deliveryService, projectService } from '../../services/api';

const { width } = Dimensions.get('window');
const cardWidth = (width - SPACING.lg * 3) / 2;

interface StatCard {
  title: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  subtitle?: string;
}

const DashboardScreen: React.FC = () => {
  const [taskStats, setTaskStats] = useState<TaskStatistics | null>(null);
  const [deliveryStats, setDeliveryStats] = useState<DeliveryStats | null>(null);
  const [projectStats, setProjectStats] = useState<ProjectStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = async () => {
    try {
      const [tasks, deliveries, projects] = await Promise.all([
        taskService.getTaskStatistics(),
        deliveryService.getGlobalStatistics(),
        projectService.getProjectStatistics(),
      ]);

      setTaskStats(tasks);
      setDeliveryStats({
        total: Object.values(deliveries).reduce((sum, count) => sum + count, 0),
        delivered: deliveries.delivered,
        approved: deliveries.approved,
        rejected: deliveries.rejected,
        inProgress: deliveries.development + deliveries.pending + deliveries.homologation,
        byStatus: {
          PENDING: deliveries.pending,
          DEVELOPMENT: deliveries.development,
          DELIVERED: deliveries.delivered,
          HOMOLOGATION: deliveries.homologation,
          APPROVED: deliveries.approved,
          REJECTED: deliveries.rejected,
          PRODUCTION: deliveries.production,
        },
      });
      setProjectStats(projects);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const getStatCards = (): StatCard[] => [
    {
      title: 'Total Tarefas',
      value: taskStats?.total || 0,
      icon: 'list',
      color: COLORS.primary,
      subtitle: 'tarefas cadastradas',
    },
    {
      title: 'Entregas',
      value: deliveryStats?.total || 0,
      icon: 'cube',
      color: COLORS.secondary,
      subtitle: 'entregas criadas',
    },
    {
      title: 'Projetos Ativos',
      value: projectStats?.active || 0,
      icon: 'folder',
      color: COLORS.success,
      subtitle: 'projetos em uso',
    },
    {
      title: 'Aprovadas',
      value: deliveryStats?.approved || 0,
      icon: 'checkmark-circle',
      color: COLORS.success,
      subtitle: 'entregas aprovadas',
    },
  ];

  if (loading) {
    return (
      <View style={styles.container}>
        <LoadingSpinner
          size="large"
          text="Carregando dashboard..."
          testID="dashboard-loading"
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
      testID="dashboard-scroll"
    >
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>
          Visão geral do seu projeto
        </Text>
      </View>

      <View style={styles.statsGrid}>
        {getStatCards().map((card, index) => (
          <Card
            key={index}
            variant="elevated"
            style={[styles.statCard, { width: cardWidth }]}
          >
            <View style={styles.statHeader}>
              <View style={[styles.iconContainer, { backgroundColor: card.color + '20' }]}>
                <Ionicons name={card.icon} size={24} color={card.color} />
              </View>
            </View>
            
            <Text style={styles.statValue}>{card.value}</Text>
            <Text style={styles.statTitle}>{card.title}</Text>
            
            {card.subtitle && (
              <Text style={styles.statSubtitle}>{card.subtitle}</Text>
            )}
          </Card>
        ))}
      </View>

      {taskStats && (
        <Card variant="elevated" style={styles.priorityCard}>
          <Text style={styles.cardTitle}>Tarefas por Prioridade</Text>
          <View style={styles.priorityList}>
            {Object.entries(taskStats.byPriority).map(([priority, count]) => {
              const priorityColors: Record<string, string> = {
                LOW: COLORS.success,
                MEDIUM: '#f59e0b',
                HIGH: '#f97316',
                URGENT: COLORS.error,
              };
              
              const priorityLabels: Record<string, string> = {
                LOW: 'Baixa',
                MEDIUM: 'Média',
                HIGH: 'Alta',
                URGENT: 'Urgente',
              };

              return (
                <View key={priority} style={styles.priorityItem}>
                  <View style={styles.priorityInfo}>
                    <View
                      style={[
                        styles.priorityDot,
                        { backgroundColor: priorityColors[priority] || COLORS.gray400 },
                      ]}
                    />
                    <Text style={styles.priorityLabel}>
                      {priorityLabels[priority] || priority}
                    </Text>
                  </View>
                  <Text style={styles.priorityCount}>{count}</Text>
                </View>
              );
            })}
          </View>
        </Card>
      )}

      {deliveryStats && (
        <Card variant="elevated" style={styles.deliveryCard}>
          <Text style={styles.cardTitle}>Status das Entregas</Text>
          <View style={styles.deliveryStats}>
            <View style={styles.deliveryStat}>
              <Text style={styles.deliveryStatValue}>{deliveryStats.inProgress}</Text>
              <Text style={styles.deliveryStatLabel}>Em Progresso</Text>
            </View>
            <View style={styles.deliveryStat}>
              <Text style={[styles.deliveryStatValue, { color: COLORS.success }]}>
                {deliveryStats.delivered}
              </Text>
              <Text style={styles.deliveryStatLabel}>Entregues</Text>
            </View>
            <View style={styles.deliveryStat}>
              <Text style={[styles.deliveryStatValue, { color: COLORS.error }]}>
                {deliveryStats.rejected}
              </Text>
              <Text style={styles.deliveryStatLabel}>Rejeitadas</Text>
            </View>
          </View>
        </Card>
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  statCard: {
    marginBottom: SPACING.md,
    alignItems: 'center',
  },
  statHeader: {
    width: '100%',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize.heading.h2,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gray900,
    marginBottom: SPACING.xs,
  },
  statTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.gray700,
    textAlign: 'center',
  },
  statSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gray500,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  priorityCard: {
    marginBottom: SPACING.lg,
  },
  cardTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gray900,
    marginBottom: SPACING.md,
  },
  priorityList: {
    gap: SPACING.sm,
  },
  priorityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  priorityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.sm,
  },
  priorityLabel: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.gray700,
  },
  priorityCount: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gray900,
  },
  deliveryCard: {
    marginBottom: SPACING.lg,
  },
  deliveryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  deliveryStat: {
    alignItems: 'center',
  },
  deliveryStatValue: {
    fontSize: TYPOGRAPHY.fontSize.heading.h3,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gray900,
    marginBottom: SPACING.xs,
  },
  deliveryStatLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray600,
    textAlign: 'center',
  },
});

export default DashboardScreen;