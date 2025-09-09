import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../constants';

interface SelectOption {
  id: string | number;
  label: string;
  value: any;
  icon?: React.ReactNode;
  color?: string;
}

interface SelectModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (option: SelectOption) => void;
  options: SelectOption[];
  selectedValue?: any;
  title: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  renderOption?: (option: SelectOption, isSelected: boolean) => React.ReactNode;
}

export const SelectModal: React.FC<SelectModalProps> = ({
  visible,
  onClose,
  onSelect,
  options,
  selectedValue,
  title,
  searchable = false,
  searchPlaceholder = 'Pesquisar...',
  renderOption,
}) => {
  const [searchText, setSearchText] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);

  useEffect(() => {
    if (searchable && searchText) {
      const filtered = options.filter(option =>
        option.label.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredOptions(filtered);
    } else {
      setFilteredOptions(options);
    }
  }, [searchText, options, searchable]);

  useEffect(() => {
    if (!visible) {
      setSearchText('');
    }
  }, [visible]);

  const handleSelect = (option: SelectOption) => {
    onSelect(option);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContent}
        >
          <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={COLORS.gray700} />
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            {searchable && (
              <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={COLORS.gray400} />
                <TextInput
                  style={styles.searchInput}
                  placeholder={searchPlaceholder}
                  placeholderTextColor={COLORS.gray400}
                  value={searchText}
                  onChangeText={setSearchText}
                  autoCorrect={false}
                />
                {searchText.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchText('')}>
                    <Ionicons name="close-circle" size={20} color={COLORS.gray400} />
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Options List */}
            <ScrollView 
              style={styles.optionsList}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {filteredOptions.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="search-outline" size={48} color={COLORS.gray300} />
                  <Text style={styles.emptyText}>Nenhuma opção encontrada</Text>
                </View>
              ) : (
                filteredOptions.map((option) => {
                  const isSelected = selectedValue === option.value ||
                    selectedValue === option.id;

                  if (renderOption) {
                    return (
                      <TouchableOpacity
                        key={option.id}
                        onPress={() => handleSelect(option)}
                      >
                        {renderOption(option, isSelected)}
                      </TouchableOpacity>
                    );
                  }

                  return (
                    <TouchableOpacity
                      key={option.id}
                      style={[
                        styles.optionItem,
                        isSelected && styles.optionItemSelected,
                      ]}
                      onPress={() => handleSelect(option)}
                    >
                      {option.icon && (
                        <View style={styles.optionIcon}>
                          {option.icon}
                        </View>
                      )}
                      <Text
                        style={[
                          styles.optionText,
                          isSelected && styles.optionTextSelected,
                          option.color && { color: option.color },
                        ]}
                      >
                        {option.label}
                      </Text>
                      {isSelected && (
                        <Ionicons name="checkmark" size={24} color={COLORS.primary} />
                      )}
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    minHeight: '50%',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.gray900,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray50,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.gray900,
    marginLeft: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  optionsList: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.xs,
    borderRadius: 12,
    backgroundColor: COLORS.white,
  },
  optionItemSelected: {
    backgroundColor: COLORS.primary + '10',
  },
  optionIcon: {
    marginRight: SPACING.md,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.gray800,
  },
  optionTextSelected: {
    fontWeight: '600',
    color: COLORS.primary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.gray500,
    marginTop: SPACING.md,
  },
});

export default SelectModal;