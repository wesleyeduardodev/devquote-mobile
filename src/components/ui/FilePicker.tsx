import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';

import { COLORS, SPACING } from '../../constants';
import { showToast } from '../../utils/toast';

interface FilePickerProps {
  files: DocumentPicker.DocumentPickerAsset[];
  onFilesChange: (files: DocumentPicker.DocumentPickerAsset[]) => void;
  maxFiles?: number;
  maxFileSize?: number; // em MB
  disabled?: boolean;
  className?: string;
}

const { width } = Dimensions.get('window');

export const FilePicker: React.FC<FilePickerProps> = ({
  files = [],
  onFilesChange,
  maxFiles = 10,
  maxFileSize = 10, // 10MB default
  disabled = false,
}) => {
  const [loading, setLoading] = useState(false);

  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
    'application/json',
    'image/jpeg',
    'image/png',
    'image/gif',
    'video/mp4',
    'audio/mpeg',
    'application/zip',
  ];

  const validateFile = (file: DocumentPicker.DocumentPickerAsset): string | null => {
    // Verificar tamanho
    const maxSizeBytes = maxFileSize * 1024 * 1024;
    if (file.size && file.size > maxSizeBytes) {
      return `Arquivo muito grande. Tamanho máximo: ${maxFileSize}MB`;
    }

    // Verificar tipo (se disponível)
    if (file.mimeType && !allowedTypes.includes(file.mimeType)) {
      const fileName = file.name?.toLowerCase() || '';
      const extension = fileName.split('.').pop();
      const allowedExtensions = [
        'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
        'txt', 'csv', 'json', 'jpg', 'jpeg', 'png', 'gif',
        'mp4', 'mp3', 'zip'
      ];
      
      if (!extension || !allowedExtensions.includes(extension)) {
        return `Tipo de arquivo não permitido: ${extension || file.mimeType}`;
      }
    }

    return null;
  };

  const pickFiles = async () => {
    try {
      setLoading(true);
      
      const availableSlots = maxFiles - files.length;
      if (availableSlots <= 0) {
        showToast('error', `Máximo de ${maxFiles} arquivos permitidos.`);
        return;
      }

      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        multiple: availableSlots > 1,
      });

      if (result.canceled) {
        return;
      }

      const newFiles = result.assets;
      const validFiles: DocumentPicker.DocumentPickerAsset[] = [];
      const errors: string[] = [];

      newFiles.forEach(file => {
        // Verificar se já existe
        const exists = files.some(existingFile => 
          existingFile.name === file.name && existingFile.size === file.size
        );
        
        if (exists) {
          errors.push(`"${file.name}" já foi selecionado`);
          return;
        }

        const error = validateFile(file);
        if (error) {
          errors.push(`"${file.name}": ${error}`);
        } else {
          validFiles.push(file);
        }
      });

      if (errors.length > 0) {
        showToast('error', errors.join('\n'));
      }

      if (validFiles.length > 0) {
        const limitedFiles = validFiles.slice(0, availableSlots);
        const updatedFiles = [...files, ...limitedFiles];
        onFilesChange(updatedFiles);
        showToast('success', `${limitedFiles.length} arquivo(s) selecionado(s)`);
      }
    } catch (err: any) {
      showToast('error', 'Erro ao selecionar arquivos');
      console.error('Error picking files:', err);
    } finally {
      setLoading(false);
    }
  };

  const removeFile = (fileToRemove: DocumentPicker.DocumentPickerAsset) => {
    Alert.alert(
      'Remover arquivo',
      `Deseja remover "${fileToRemove.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Remover', 
          style: 'destructive',
          onPress: () => {
            const updatedFiles = files.filter(file => file !== fileToRemove);
            onFilesChange(updatedFiles);
          }
        },
      ]
    );
  };

  const getFileIcon = (fileName: string, mimeType?: string) => {
    const extension = fileName.toLowerCase().split('.').pop();
    
    switch (extension) {
      case 'pdf':
        return <Ionicons name="document-text" size={24} color="#dc2626" />;
      case 'doc':
      case 'docx':
        return <Ionicons name="document" size={24} color="#2563eb" />;
      case 'xls':
      case 'xlsx':
        return <Ionicons name="grid" size={24} color="#059669" />;
      case 'ppt':
      case 'pptx':
        return <Ionicons name="albums" size={24} color="#ea580c" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <Ionicons name="image" size={24} color="#7c3aed" />;
      case 'mp4':
      case 'avi':
        return <Ionicons name="videocam" size={24} color="#be185d" />;
      case 'mp3':
      case 'wav':
        return <Ionicons name="musical-notes" size={24} color="#0891b2" />;
      case 'zip':
      case 'rar':
        return <Ionicons name="archive" size={24} color="#374151" />;
      default:
        return <Ionicons name="document-outline" size={24} color={COLORS.gray600} />;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const renderFile = ({ item }: { item: DocumentPicker.DocumentPickerAsset }) => (
    <View style={styles.fileItem}>
      <View style={styles.fileInfo}>
{getFileIcon(item.name || '', item.mimeType || '')}
        <View style={styles.fileDetails}>
          <Text style={styles.fileName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.fileSize}>
            {formatFileSize(item.size || 0)}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        onPress={() => removeFile(item)}
        style={styles.removeButton}
      >
        <Ionicons name="close-circle" size={24} color={COLORS.danger} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="attach" size={20} color={COLORS.primary} />
          <Text style={styles.headerTitle}>
            Anexos ({files.length} selecionados)
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.addButton, disabled && styles.addButtonDisabled]}
          onPress={pickFiles}
          disabled={disabled || loading || files.length >= maxFiles}
        >
          <Ionicons 
            name="add-circle-outline" 
            size={20} 
            color={disabled ? COLORS.gray400 : COLORS.primary} 
          />
          <Text style={[
            styles.addButtonText, 
            disabled && styles.addButtonTextDisabled
          ]}>
            Adicionar
          </Text>
        </TouchableOpacity>
      </View>

      {/* Files List */}
      {files.length > 0 && (
        <View style={styles.filesList}>
          {files.map((item, index) => (
            <View key={`${item.name}-${index}`}>
              {renderFile({ item })}
            </View>
          ))}
        </View>
      )}

      {/* Empty State */}
      {files.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="document-outline" size={48} color={COLORS.gray300} />
          <Text style={styles.emptyText}>Nenhum arquivo selecionado</Text>
          <Text style={styles.emptySubtext}>
            Toque em "Adicionar" para anexar arquivos
          </Text>
        </View>
      )}

      {/* Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          Máximo {maxFiles} arquivos • {maxFileSize}MB cada
        </Text>
        <Text style={styles.infoText}>
          PDF, DOC, XLS, PPT, imagens, vídeos e mais
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray800,
    marginLeft: SPACING.sm,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
  },
  addButtonDisabled: {
    backgroundColor: COLORS.gray100,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: SPACING.xs,
  },
  addButtonTextDisabled: {
    color: COLORS.gray400,
  },
  filesList: {
    maxHeight: 200,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.gray50,
    borderRadius: 8,
    marginBottom: SPACING.sm,
  },
  fileInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileDetails: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.gray900,
  },
  fileSize: {
    fontSize: 12,
    color: COLORS.gray600,
    marginTop: 2,
  },
  removeButton: {
    padding: SPACING.xs,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.gray600,
    marginTop: SPACING.sm,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.gray500,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  infoContainer: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
  },
  infoText: {
    fontSize: 12,
    color: COLORS.gray500,
    textAlign: 'center',
    marginBottom: 2,
  },
});

export default FilePicker;