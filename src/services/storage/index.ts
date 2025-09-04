import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../../constants';
import { User } from '../../types';

// Storage service for handling local storage operations
export class StorageService {
  
  // Generic storage methods
  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error('Error storing item:', error);
      throw new Error('Failed to store item');
    }
  }
  
  async getItem<T>(key: string): Promise<T | null> {
    try {
      const serializedValue = await AsyncStorage.getItem(key);
      return serializedValue ? JSON.parse(serializedValue) : null;
    } catch (error) {
      console.error('Error retrieving item:', error);
      return null;
    }
  }
  
  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing item:', error);
      throw new Error('Failed to remove item');
    }
  }
  
  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw new Error('Failed to clear storage');
    }
  }
  
  async multiRemove(keys: string[]): Promise<void> {
    try {
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.error('Error removing multiple items:', error);
      throw new Error('Failed to remove items');
    }
  }
  
  // Auth-specific methods
  async storeTokens(accessToken: string, refreshToken: string): Promise<void> {
    try {
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.ACCESS_TOKEN, accessToken],
        [STORAGE_KEYS.REFRESH_TOKEN, refreshToken],
      ]);
    } catch (error) {
      console.error('Error storing tokens:', error);
      throw new Error('Failed to store tokens');
    }
  }
  
  async getTokens(): Promise<{ accessToken: string | null; refreshToken: string | null }> {
    try {
      const tokens = await AsyncStorage.multiGet([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
      ]);
      
      return {
        accessToken: tokens[0][1],
        refreshToken: tokens[1][1],
      };
    } catch (error) {
      console.error('Error retrieving tokens:', error);
      return { accessToken: null, refreshToken: null };
    }
  }
  
  async clearTokens(): Promise<void> {
    try {
      await this.multiRemove([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
      ]);
    } catch (error) {
      console.error('Error clearing tokens:', error);
      throw new Error('Failed to clear tokens');
    }
  }
  
  // User data methods
  async storeUserData(user: User): Promise<void> {
    await this.setItem(STORAGE_KEYS.USER_DATA, user);
  }
  
  async getUserData(): Promise<User | null> {
    return await this.getItem<User>(STORAGE_KEYS.USER_DATA);
  }
  
  async clearUserData(): Promise<void> {
    await this.removeItem(STORAGE_KEYS.USER_DATA);
  }
  
  // App settings methods
  async getTheme(): Promise<'light' | 'dark' | 'system'> {
    const theme = await this.getItem<string>(STORAGE_KEYS.THEME);
    return (theme as 'light' | 'dark' | 'system') || 'system';
  }
  
  async setTheme(theme: 'light' | 'dark' | 'system'): Promise<void> {
    await this.setItem(STORAGE_KEYS.THEME, theme);
  }
  
  async getLanguage(): Promise<string> {
    const language = await this.getItem<string>(STORAGE_KEYS.LANGUAGE);
    return language || 'pt-BR';
  }
  
  async setLanguage(language: string): Promise<void> {
    await this.setItem(STORAGE_KEYS.LANGUAGE, language);
  }
  
  async isOnboardingCompleted(): Promise<boolean> {
    const completed = await this.getItem<boolean>(STORAGE_KEYS.ONBOARDING_COMPLETED);
    return completed || false;
  }
  
  async setOnboardingCompleted(completed: boolean): Promise<void> {
    await this.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, completed);
  }
  
  // Clear all user-related data (for logout)
  async clearUserSession(): Promise<void> {
    await this.multiRemove([
      STORAGE_KEYS.ACCESS_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.USER_DATA,
    ]);
  }
}

// Export singleton instance
export const storageService = new StorageService();