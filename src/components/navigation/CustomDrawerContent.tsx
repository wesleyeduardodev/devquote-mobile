import React from 'react';
import {
  DrawerContentScrollView,
  DrawerContentComponentProps,
  DrawerItemList,
  DrawerItem,
} from '@react-navigation/drawer';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { COLORS } from '../../constants';

interface CustomDrawerContentProps extends DrawerContentComponentProps {}

const CustomDrawerContent: React.FC<CustomDrawerContentProps> = (props) => {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    props.navigation.closeDrawer();
  };

  return (
    <View style={styles.container}>
      {/* Header com gradiente */}
      <LinearGradient
        colors={['#3b82f6', '#8b5cf6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.profileContainer}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={40} color={COLORS.white} />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || 'Usuário'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'email@example.com'}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Menu Items */}
      <DrawerContentScrollView 
        {...props} 
        contentContainerStyle={styles.drawerContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.menuSection}>
          <DrawerItemList {...props} />
        </View>

        {/* Separador */}
        <View style={styles.separator} />

        {/* Menu adicional */}
        <View style={styles.menuSection}>
          <DrawerItem
            label="Configurações"
            icon={({ color, size }) => (
              <Ionicons 
                name="settings-outline" 
                size={size} 
                color={color}
                style={{ marginRight: 8, width: 24, textAlign: 'center' }}
              />
            )}
            onPress={() => props.navigation.navigate('Settings' as any)}
            labelStyle={styles.drawerLabel}
            style={{ 
              borderRadius: 10,
              marginVertical: 2,
              marginHorizontal: 10,
              paddingHorizontal: 8,
            }}
            activeTintColor={COLORS.primary}
            inactiveTintColor={COLORS.gray600}
          />
          
          <DrawerItem
            label="Ajuda"
            icon={({ color, size }) => (
              <Ionicons 
                name="help-circle-outline" 
                size={size} 
                color={color}
                style={{ marginRight: 8, width: 24, textAlign: 'center' }}
              />
            )}
            onPress={() => props.navigation.navigate('Help' as any)}
            labelStyle={styles.drawerLabel}
            style={{ 
              borderRadius: 10,
              marginVertical: 2,
              marginHorizontal: 10,
              paddingHorizontal: 8,
            }}
            activeTintColor={COLORS.primary}
            inactiveTintColor={COLORS.gray600}
          />
        </View>
      </DrawerContentScrollView>

      {/* Footer com logout */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <MaterialIcons name="logout" size={22} color={COLORS.danger} />
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
        
        <View style={styles.version}>
          <Text style={styles.versionText}>DevQuote v1.0.0</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray50,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  userInfo: {
    marginLeft: 15,
    flex: 1,
  },
  userName: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  userEmail: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    fontWeight: '400',
  },
  drawerContent: {
    paddingTop: 10,
  },
  menuSection: {
    paddingVertical: 5,
  },
  drawerLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: -10,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.gray200,
    marginHorizontal: 20,
    marginVertical: 10,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: COLORS.white,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: COLORS.gray50,
  },
  logoutText: {
    color: COLORS.danger,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  version: {
    alignItems: 'center',
    marginTop: 15,
  },
  versionText: {
    color: COLORS.gray400,
    fontSize: 12,
    fontWeight: '400',
  },
});

export default CustomDrawerContent;