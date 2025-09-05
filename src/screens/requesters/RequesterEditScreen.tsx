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

import { requesterService } from '../../services/requesterService';
import { Requester, UpdateRequesterData } from '../../types/requester.types';
import { Input, Button, Card, LoadingSpinner } from '../../components/ui';
import { COLORS, SPACING } from '../../constants';
import { showToast } from '../../utils/toast';

const schema = yup.object().shape({
  name: yup
    .string()
    .required('Nome é obrigatório')
    .min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: yup
    .string()
    .required('Email é obrigatório')
    .email('Email deve ser válido'),
  phone: yup.string().optional(),
});

interface FormData {
  name: string;
  email: string;
  phone?: string;
}

type RouteParams = {
  RequesterEdit: {
    id: string | number;
  };
};

const RequesterEditScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'RequesterEdit'>>();
  const { id } = route.params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [requester, setRequester] = useState<Requester | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    reset,
  } = useForm<FormData>({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
    },
    mode: 'onChange',
  });


  // Carrega os dados do solicitante
  useEffect(() => {
    loadRequester();
  }, []);

  const loadRequester = async () => {
    try {
      setLoading(true);
      const data = await requesterService.getById(id);
      setRequester(data);
      
      // Preenche o formulário com os dados carregados
      reset({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
      });
    } catch (error) {
      showToast('error', 'Erro ao carregar dados do solicitante');
      console.error('Error loading requester:', error);
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      const updateData: UpdateRequesterData = {
        ...data,
        phone: data.phone || undefined,
      };

      await requesterService.update(id, updateData);
      showToast('success', 'Solicitante atualizado com sucesso!');
      navigation.goBack();
    } catch (error: any) {
      if (error.response?.status === 409) {
        showToast('error', 'Email já está sendo usado por outro solicitante');
      } else {
        showToast('error', 'Erro ao atualizar solicitante');
      }
      console.error('Error updating requester:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner overlay size="large" text="Carregando solicitante..." />;
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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.gray900} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Editar Solicitante</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Form */}
        <Card style={styles.formCard}>
          <Text style={styles.sectionTitle}>Informações do Solicitante</Text>
          
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
                leftIcon={<Ionicons name="person-outline" size={20} color={COLORS.gray500} />}
                placeholder="Digite o nome completo"
                autoCapitalize="words"
                returnKeyType="next"
              />
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Email *"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.email?.message}
                leftIcon={<Ionicons name="mail-outline" size={20} color={COLORS.gray500} />}
                placeholder="exemplo@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
              />
            )}
          />

          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Telefone"
                value={value || ''}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.phone?.message}
                leftIcon={<Ionicons name="call-outline" size={20} color={COLORS.gray500} />}
                placeholder="(11) 99999-9999"
                keyboardType="phone-pad"
                returnKeyType="done"
              />
            )}
          />
        </Card>

        {/* Informações adicionais */}
        {requester && (
          <Card style={styles.infoCard}>
            <Text style={styles.infoTitle}>Informações do Sistema</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>ID:</Text>
              <Text style={styles.infoValue}>{requester.id}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Criado em:</Text>
              <Text style={styles.infoValue}>
                {requester.createdAt ? new Date(requester.createdAt).toLocaleDateString('pt-BR') : 'N/A'}
              </Text>
            </View>
            {requester.updatedAt && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Atualizado em:</Text>
                <Text style={styles.infoValue}>
                  {new Date(requester.updatedAt).toLocaleDateString('pt-BR')}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.gray900,
  },
  formCard: {
    margin: SPACING.md,
    padding: SPACING.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray900,
    marginBottom: SPACING.md,
    marginTop: SPACING.sm,
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

export default RequesterEditScreen;