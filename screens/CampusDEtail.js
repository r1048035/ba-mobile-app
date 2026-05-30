import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../theme';

export default function CampusDetail({ route }) {
  const { name, description, addressLines = [], color, accentColor } = route.params || {};
  const campusColor = color || accentColor || theme.colors.primary;

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <View style={[styles.accent, { backgroundColor: campusColor }]} />
        <Text style={[styles.label, { color: campusColor }]}>Campus</Text>
        <Text style={styles.title}>{name}</Text>
        {description ? <Text style={styles.body}>{description}</Text> : null}

        {addressLines && addressLines.length > 0 ? (
          <View style={styles.addressWrap}>
            {addressLines.map((l, i) => (
              <Text key={i} style={styles.address}>{l}</Text>
            ))}
          </View>
        ) : null}
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
  accent: {
    height: 6,
    borderRadius: 999,
    marginBottom: theme.spacing.md,
  },
  label: {
    fontFamily: theme.typography.subtitle,
    fontSize: 13,
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
    marginBottom: theme.spacing.md,
  },
  addressWrap: {
    marginTop: theme.spacing.sm,
  },
  address: {
    fontFamily: theme.typography.body,
    fontSize: 16,
    color: theme.colors.text,
  },
});