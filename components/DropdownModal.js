import React from 'react';
import { Modal, View, Text, StyleSheet, Pressable, FlatList } from 'react-native';
import { theme } from '../theme';

export default function DropdownModal({ visible, onClose, options = [], title = 'Kies', onSelect }) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>{title}</Text>
          <FlatList
            data={options}
            keyExtractor={(i) => i.value ?? i}
            renderItem={({ item }) => {
              const label = typeof item === 'string' ? item : item.label;
              const value = typeof item === 'string' ? item : item.value;
              return (
                <Pressable style={styles.row} onPress={() => { onSelect(value); onClose(); }}>
                  <Text style={styles.rowText}>{label}</Text>
                </Pressable>
              );
            }}
          />
          <Pressable style={styles.closeBtn} onPress={onClose}><Text style={styles.closeText}>Annuleer</Text></Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', padding: 16, borderTopLeftRadius: 12, borderTopRightRadius: 12, maxHeight: '60%' },
  title: { fontFamily: theme.typography.subtitle, fontSize: 18, marginBottom: 12 },
  row: { paddingVertical: 12, borderBottomWidth: 1, borderColor: '#f2f2f2' },
  rowText: { fontFamily: theme.typography.body },
  closeBtn: { marginTop: 12, padding: 12, alignItems: 'center' },
  closeText: { color: theme.colors.primary, fontFamily: theme.typography.subtitle },
});
