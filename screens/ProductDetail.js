import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../theme';

export default function ProductDetail({ route }) {
  const { title, description, price } = route.params || {};

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.label}>Product</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{description}</Text>
        <Text style={styles.price}>€ {price}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  card: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadow,
  },
  label: {
    fontFamily: theme.typography.subtitle,
    fontSize: 13,
    color: theme.colors.primary,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  title: {
    fontFamily: theme.typography.title,
    fontSize: 28,
    color: theme.colors.text,
    marginBottom: 10,
  },
  body: {
    fontFamily: theme.typography.body,
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.mutedText,
    marginBottom: 16,
  },
  price: {
    fontFamily: theme.typography.subtitle,
    fontSize: 20,
    color: theme.colors.primary,
  },
});