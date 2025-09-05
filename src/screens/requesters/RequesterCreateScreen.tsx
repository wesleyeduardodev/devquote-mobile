import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

import { requesterService } from '../../services/requesterService';
import { CreateRequesterData } from '../../types/requester.types';
import { Input, Button, Card } from '../../components/ui';
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

const RequesterCreateScreen: React.FC = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormData>({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
    },
    mode: 'onChange',
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const createData: CreateRequesterData = {
        ...data,
        phone: data.phone || undefined,
      };

      await requesterService.create(createData);
      showToast('success', 'Solicitante criado com sucesso!');
      navigation.goBack();
    } catch (error: any) {
      if (error.response?.status === 409) {
        showToast('error', 'Email já está sendo usado por outro solicitante');
      } else {
        showToast('error', 'Erro ao criar solicitante');
      }
      console.error('Error creating requester:', error);
    } finally {
      setLoading(false);
    }
  };

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
          <Text style={styles.headerTitle}>Novo Solicitante</Text>
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
      </ScrollView>

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
          title="Criar Solicitante"
          onPress={handleSubmit(onSubmit)}
          loading={loading}
          disabled={!isValid}
          style={styles.submitButton}
          leftIcon={<MaterialIcons name="add" size={20} color={COLORS.white} />}
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

export default RequesterCreateScreen;