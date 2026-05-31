import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { theme } from '../theme';

export default function StudyCard({ title, campus, degree, finality, summary, onPress }) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.tagsRow}>
        <View style={styles.tag}><Text style={styles.tagText}>{campus}</Text></View>
        <View style={styles.tag}><Text style={styles.tagText}>{degree}</Text></View>
        <View style={styles.tag}><Text style={styles.tagText}>{finality}</Text></View>
      </View>
      <Text style={styles.title}>{title}</Text>
      {summary ? <Text style={styles.summary}>{summary}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#f0f0f0' },
  tagsRow: { flexDirection: 'row', marginBottom: 8 },
  tag: { backgroundColor: '#f2f2f2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 16, marginRight: 8 },
  tagText: { fontFamily: theme.typography.body, fontSize: 12 },
  title: { fontFamily: theme.typography.subtitle, fontSize: 18, marginBottom: 8 },
  summary: { fontFamily: theme.typography.body, color: theme.colors.mutedText },
});
