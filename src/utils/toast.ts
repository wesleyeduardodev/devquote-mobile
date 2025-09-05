import Toast from 'react-native-toast-message';

export const showToast = (
  type: 'success' | 'error' | 'info' | 'warning',
  text1: string,
  text2?: string
) => {
  const config = {
    success: {
      type: 'success' as const,
      text1,
      text2,
      visibilityTime: 3000,
    },
    error: {
      type: 'error' as const,
      text1,
      text2,
      visibilityTime: 4000,
    },
    info: {
      type: 'info' as const,
      text1,
      text2,
      visibilityTime: 3000,
    },
    warning: {
      type: 'info' as const, // Toast Message doesn't have warning, use info
      text1,
      text2,
      visibilityTime: 3000,
    },
  };

  Toast.show(config[type]);
};

export default showToast;