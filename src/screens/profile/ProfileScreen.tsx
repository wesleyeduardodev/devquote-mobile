import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Card, Button } from '../../components/ui';
import { useAuthStore } from '../../store/authStore';
import { COLORS, SPACING, TYPOGRAPHY } from '../../constants';

interface ProfileOption {
  id: string;
  title: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  showChevron?: boolean;
  destructive?: boolean;
}

const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert(
      'Confirmar Logout',
      'Tem certeza que deseja sair da sua conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível fazer logout');
            }
          },
        },
      ]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'DevQuote Mobile',
      'Versão 1.0.0\n\nAplicativo de gestão de tarefas e entregas para desenvolvedores.\n\nDesenvolvido com React Native e Expo.',
      [{ text: 'OK' }]
    );
  };

  const handleContact = () => {
    Alert.alert(
      'Contato',
      'Entre em contato conosco:',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Email',
          onPress: () => Linking.openURL('mailto:contato@devquote.com'),
        },
      ]
    );
  };

  const handleUserSettings = () => {
    Alert.alert('Info', 'Configurações do usuário - Em desenvolvimento');
  };

  const handleNotifications = () => {
    Alert.alert('Info', 'Configurações de notificação - Em desenvolvimento');
  };

  const handlePrivacy = () => {
    Alert.alert('Info', 'Política de privacidade - Em desenvolvimento');
  };

  const handleTerms = () => {
    Alert.alert('Info', 'Termos de uso - Em desenvolvimento');
  };

  const profileOptions: ProfileOption[] = [
    {
      id: 'user-settings',
      title: 'Configurações do Usuário',
      subtitle: 'Alterar dados pessoais e preferências',
      icon: 'person-outline',
      onPress: handleUserSettings,
      showChevron: true,
    },
    {
      id: 'notifications',
      title: 'Notificações',
      subtitle: 'Configurar alertas e lembretes',
      icon: 'notifications-outline',
      onPress: handleNotifications,
      showChevron: true,
    },
  ];

  const supportOptions: ProfileOption[] = [
    {
      id: 'about',
      title: 'Sobre o App',
      subtitle: 'Versão e informações do aplicativo',
      icon: 'information-circle-outline',
      onPress: handleAbout,
      showChevron: true,
    },
    {
      id: 'contact',
      title: 'Contato',
      subtitle: 'Entre em contato conosco',
      icon: 'mail-outline',
      onPress: handleContact,
      showChevron: true,
    },
    {
      id: 'privacy',
      title: 'Política de Privacidade',
      icon: 'shield-outline',
      onPress: handlePrivacy,
      showChevron: true,
    },
    {
      id: 'terms',
      title: 'Termos de Uso',
      icon: 'document-text-outline',
      onPress: handleTerms,
      showChevron: true,
    },
  ];

  const renderOption = (option: ProfileOption) => (
    <TouchableOpacity
      key={option.id}
      activeOpacity={0.7}
      onPress={option.onPress}
    >
      <View style={[
        styles.optionItem,
        option.destructive && styles.destructiveOption
      ]}>
        <View style={styles.optionLeft}>
          <View style={[
            styles.optionIcon,
            option.destructive && styles.destructiveIcon
          ]}>
            <Ionicons
              name={option.icon}
              size={20}
              color={option.destructive ? COLORS.error : COLORS.gray600}
            />
          </View>
          <View style={styles.optionContent}>
            <Text style={[
              styles.optionTitle,
              option.destructive && styles.destructiveText
            ]}>
              {option.title}
            </Text>
            {option.subtitle && (
              <Text style={styles.optionSubtitle}>
                {option.subtitle}
              </Text>
            )}
          </View>
        </View>
        {option.showChevron && (
          <Ionicons
            name="chevron-forward"
            size={20}
            color={COLORS.gray400}
          />
        )}
      </View>
    </TouchableOpacity>
  );

  const formatProfileTypes = (profiles: any[]): string => {
    if (!profiles || profiles.length === 0) return 'Nenhum perfil';
    return profiles
      .map(p => p.profile?.name || 'Desconhecido')
      .join(', ');
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      testID="profile-scroll"
    >
      <View style={styles.header}>
        <Text style={styles.title}>Perfil</Text>
      </View>

      {user && (
        <Card variant="elevated" style={styles.userCard}>
          <View style={styles.userInfo}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Ionicons
                  name="person"
                  size={32}
                  color={COLORS.primary}
                />
              </View>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>
                {user.name}
              </Text>
              <Text style={styles.userEmail}>
                {user.username}
              </Text>
              <Text style={styles.userProfiles}>
                {formatProfileTypes(user.profiles || [])}
              </Text>
            </View>
          </View>
        </Card>
      )}

      <Card variant="elevated" style={styles.optionsCard}>
        <Text style={styles.sectionTitle}>Configurações</Text>
        {profileOptions.map(renderOption)}
      </Card>

      <Card variant="elevated" style={styles.optionsCard}>
        <Text style={styles.sectionTitle}>Suporte</Text>
        {supportOptions.map(renderOption)}
      </Card>

      <View style={styles.logoutContainer}>
        <Button
          title="Sair da Conta"
          onPress={handleLogout}
          variant="outline"
          style={styles.logoutButton}
          leftIcon={
            <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
          }
          testID="logout-button"
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          DevQuote Mobile v1.0.0
        </Text>
        <Text style={styles.footerSubtext}>
          Desenvolvido com React Native
        </Text>
      </View>
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
  },
  userCard: {
    marginBottom: SPACING.lg,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: SPACING.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gray900,
    marginBottom: SPACING.xs,
  },
  userEmail: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.gray600,
    marginBottom: SPACING.xs,
  },
  userProfiles: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  optionsCard: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gray900,
    marginBottom: SPACING.md,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.gray900,
  },
  optionSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray600,
    marginTop: SPACING.xs,
  },
  destructiveOption: {
    borderBottomColor: COLORS.error + '20',
  },
  destructiveIcon: {
    backgroundColor: COLORS.error + '10',
  },
  destructiveText: {
    color: COLORS.error,
  },
  logoutContainer: {
    marginBottom: SPACING.xl,
  },
  logoutButton: {
    borderColor: COLORS.error,
  },
  footer: {
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  footerText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray600,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  footerSubtext: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gray500,
    marginTop: SPACING.xs,
  },
});

export default ProfileScreen;