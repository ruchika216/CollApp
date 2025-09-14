import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import { useTheme } from '../../theme/useTheme';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description: string;
    priority: 'High' | 'Medium' | 'Low';
  }) => void;
}

const CreateTaskModal: React.FC<Props> = ({ visible, onClose, onSubmit }) => {
  const { colors } = useTheme();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');

  const handleSave = () => {
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      priority,
    });
    setTitle('');
    setDescription('');
    setPriority('Medium');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View
          style={[
            styles.sheet,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
          accessibilityViewIsModal
        >
          <Text style={[styles.title, { color: colors.text }]}>
            Create Task
          </Text>
          <TextInput
            placeholder="Title"
            placeholderTextColor={colors.textSecondary}
            value={title}
            onChangeText={setTitle}
            style={[
              styles.input,
              { color: colors.text, borderColor: colors.border },
            ]}
          />
          <TextInput
            placeholder="Description"
            placeholderTextColor={colors.textSecondary}
            value={description}
            onChangeText={setDescription}
            multiline
            style={[
              styles.input,
              styles.textArea,
              { color: colors.text, borderColor: colors.border },
            ]}
          />
          <View style={styles.row}>
            {(['High', 'Medium', 'Low'] as const).map(p => (
              <TouchableOpacity
                key={p}
                onPress={() => setPriority(p)}
                style={[
                  styles.chip,
                  {
                    borderColor:
                      p === priority ? colors.primary : colors.border,
                  },
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected: p === priority }}
              >
                <Text
                  style={{
                    color: p === priority ? colors.primary : colors.text,
                  }}
                >
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.footer}>
            <TouchableOpacity onPress={onClose}>
              <Text style={{ color: colors.text }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave}>
              <Text style={{ color: colors.primary, fontWeight: '700' }}>
                Save
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: Platform.OS === 'ios' ? 12 : 10,
    marginBottom: 10,
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 8, marginTop: 6 },
  chip: {
    borderWidth: 1.5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  footer: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default CreateTaskModal;
