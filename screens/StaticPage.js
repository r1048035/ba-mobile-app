import React from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';
import { theme } from '../theme';

export default function StaticPage({ route }) {
  const { title } = route.params || { title: 'Pagina' };
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>Dit is een tijdelijke statische pagina. Vervang dit met echte content.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg },
  title: { fontFamily: theme.typography.subtitle, fontSize: 20, marginBottom: theme.spacing.md },
  body: { fontFamily: theme.typography.body, color: theme.colors.text },
});
