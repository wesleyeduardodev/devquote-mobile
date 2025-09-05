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

import { requesterService } from '../../services/requesterService';
import { Requester } from '../../types/requester.types';
import { LoadingSpinner, Card } from '../../components/ui';
import { COLORS, SPACING } from '../../constants';
import { showToast } from '../../utils/toast';

const RequesterListScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [requesters, setRequesters] = useState<Requester[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredRequesters, setFilteredRequesters] = useState<Requester[]>([]);

  const loadRequesters = useCallback(async () => {
    try {
      const response = await requesterService.getAll({
        page: 0,
        size: 100,
        sort: [{ field: 'name', direction: 'asc' }],
      });
      setRequesters(response.content);
      setFilteredRequesters(response.content);
    } catch (error) {
      showToast('error', 'Erro ao carregar solicitantes');
      console.error('Error loading requesters:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadRequesters();
    }, [loadRequesters])
  );

  useEffect(() => {
    if (searchQuery) {
      const filtered = requesters.filter(
        (requester) =>
          requester.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          requester.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          requester.phone?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredRequesters(filtered);
    } else {
      setFilteredRequesters(requesters);
    }
  }, [searchQuery, requesters]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadRequesters();
  };

  const handleEdit = (requester: Requester) => {
    navigation.navigate('RequesterEdit', { id: requester.id });
  };

  const handleDelete = (requester: Requester) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Deseja realmente excluir o solicitante "${requester.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await requesterService.delete(requester.id);
              showToast('success', 'Solicitante excluído com sucesso');
              loadRequesters();
            } catch (error) {
              showToast('error', 'Erro ao excluir solicitante');
              console.error('Error deleting requester:', error);
            }
          },
        },
      ]
    );
  };

  const renderRequester = ({ item }: { item: Requester }) => {
    return (
      <Card style={styles.requesterCard}>
        <TouchableOpacity
          onPress={() => handleEdit(item)}
          style={styles.requesterContent}
          activeOpacity={0.7}
        >
          <View style={styles.requesterHeader}>
            <View style={styles.requesterInfo}>
              <Text style={styles.requesterName}>{item.name}</Text>
              <View style={styles.requesterDetails}>
                <Ionicons name="mail-outline" size={14} color={COLORS.gray600} />
                <Text style={styles.requesterEmail}>{item.email}</Text>
              </View>
              {item.phone && (
                <View style={styles.requesterDetails}>
                  <Ionicons name="call-outline" size={14} color={COLORS.gray600} />
                  <Text style={styles.requesterPhone}>{item.phone}</Text>
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
      <Ionicons name="people-outline" size={64} color={COLORS.gray400} />
      <Text style={styles.emptyText}>Nenhum solicitante encontrado</Text>
      <Text style={styles.emptySubtext}>
        {searchQuery
          ? 'Tente buscar por outro termo'
          : 'Adicione um novo solicitante para começar'}
      </Text>
    </View>
  );

  if (loading) {
    return <LoadingSpinner overlay size="large" text="Carregando solicitantes..." />;
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
              placeholder="Buscar por nome, email ou telefone..."
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
          data={filteredRequesters}
          renderItem={renderRequester}
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
            onPress={() => navigation.navigate('RequesterCreate')}
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
  requesterCard: {
    marginBottom: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 0,
    elevation: 2,
  },
  requesterContent: {
    padding: SPACING.md,
  },
  requesterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  requesterInfo: {
    flex: 1,
  },
  requesterName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.gray900,
    marginBottom: 4,
  },
  requesterDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  requesterEmail: {
    fontSize: 14,
    color: COLORS.gray600,
    marginLeft: 6,
  },
  requesterPhone: {
    fontSize: 14,
    color: COLORS.gray600,
    marginLeft: 6,
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

export default RequesterListScreen;