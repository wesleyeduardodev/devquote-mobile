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
import { Delivery, DeliveryStatus } from '../../types';
import { deliveryService } from '../../services/api';

const DeliveryListScreen: React.FC = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDeliveries = async () => {
    try {
      const response = await deliveryService.getAllDeliveries({
        page: 0,
        size: 50,
        sort: 'createdAt,desc',
      });

      if (response.success && response.data) {
        setDeliveries(response.data.content);
      } else {
        Alert.alert('Erro', 'Não foi possível carregar as entregas');
      }
    } catch (error) {
      console.error('Error loading deliveries:', error);
      Alert.alert('Erro', 'Erro ao carregar entregas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDeliveries();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadDeliveries();
  };

  const getStatusColor = (status: DeliveryStatus): string => {
    const statusColors = {
      PENDING: COLORS.warning,
      DEVELOPMENT: COLORS.info,
      DELIVERED: COLORS.secondary,
      HOMOLOGATION: '#f59e0b',
      APPROVED: COLORS.success,
      REJECTED: COLORS.error,
      PRODUCTION: COLORS.primary,
    };
    return statusColors[status] || COLORS.gray500;
  };

  const getStatusLabel = (status: DeliveryStatus): string => {
    const statusLabels = {
      PENDING: 'Pendente',
      DEVELOPMENT: 'Desenvolvimento',
      DELIVERED: 'Entregue',
      HOMOLOGATION: 'Homologação',
      APPROVED: 'Aprovado',
      REJECTED: 'Rejeitado',
      PRODUCTION: 'Produção',
    };
    return statusLabels[status] || status;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <LoadingSpinner
          size="large"
          text="Carregando entregas..."
          testID="delivery-loading"
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
      testID="delivery-scroll"
    >
      <View style={styles.header}>
        <Text style={styles.title}>Entregas</Text>
        <Text style={styles.subtitle}>
          {deliveries.length} {deliveries.length === 1 ? 'entrega encontrada' : 'entregas encontradas'}
        </Text>
      </View>

      {deliveries.length === 0 ? (
        <Card variant="elevated" style={styles.emptyCard}>
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={48} color={COLORS.gray400} />
            <Text style={styles.emptyTitle}>Nenhuma entrega encontrada</Text>
            <Text style={styles.emptySubtitle}>
              As entregas aparecerão aqui quando forem criadas
            </Text>
          </View>
        </Card>
      ) : (
        <View style={styles.deliveryList}>
          {deliveries.map((delivery) => (
            <TouchableOpacity
              key={delivery.id}
              activeOpacity={0.7}
              onPress={() => {
                Alert.alert('Info', `Entrega: ${delivery.name}`);
              }}
            >
              <Card variant="elevated" style={styles.deliveryCard}>
                <View style={styles.deliveryHeader}>
                  <View style={styles.deliveryTitleContainer}>
                    <Text style={styles.deliveryName} numberOfLines={2}>
                      {delivery.title || delivery.task?.title || 'Entrega sem título'}
                    </Text>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(delivery.status) + '20' }
                    ]}>
                      <Text style={[
                        styles.statusText,
                        { color: getStatusColor(delivery.status) }
                      ]}>
                        {getStatusLabel(delivery.status)}
                      </Text>
                    </View>
                  </View>
                </View>

                {delivery.task?.description && (
                  <Text style={styles.deliveryDescription} numberOfLines={3}>
                    {delivery.task.description}
                  </Text>
                )}

                <View style={styles.deliveryMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="list-outline" size={16} color={COLORS.gray500} />
                    <Text style={styles.metaText}>
                      {delivery.deliveryItems?.length || 0} {(delivery.deliveryItems?.length || 0) === 1 ? 'item' : 'itens'}
                    </Text>
                  </View>

                  <View style={styles.metaItem}>
                    <Ionicons name="calendar-outline" size={16} color={COLORS.gray500} />
                    <Text style={styles.metaText}>
                      {formatDate(delivery.createdAt || new Date().toISOString())}
                    </Text>
                  </View>
                </View>

                {delivery.task?.expectedDate && (
                  <View style={styles.deliveryFooter}>
                    <View style={styles.metaItem}>
                      <Ionicons name="time-outline" size={16} color={COLORS.primary} />
                      <Text style={styles.expectedDateText}>
                        Entrega prevista: {formatDate(delivery.task.expectedDate)}
                      </Text>
                    </View>
                  </View>
                )}
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
  deliveryList: {
    gap: SPACING.md,
  },
  deliveryCard: {
    marginBottom: SPACING.sm,
  },
  deliveryHeader: {
    marginBottom: SPACING.sm,
  },
  deliveryTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  deliveryName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gray900,
    flex: 1,
    marginRight: SPACING.sm,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  statusText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  deliveryDescription: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.gray700,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  deliveryMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  deliveryFooter: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
  },
  expectedDateText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    marginLeft: SPACING.xs,
  },
});

export default DeliveryListScreen;