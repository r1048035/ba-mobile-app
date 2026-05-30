import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '../theme';

export default function CampusCard({ name, subtitle, accentColor, addressLines = [], onPress }) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        <View style={[styles.dot, { backgroundColor: accentColor }]} />
        <Text style={styles.name}>{name}</Text>
      </View>

      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

      {addressLines && addressLines.length > 0 ? (
        <View style={styles.addressWrap}>
          {addressLines.map((l, i) => (
            <Text key={i} style={styles.address}>{l}</Text>
          ))}
        </View>
      ) : null}

      <Pressable onPress={onPress} style={[styles.cta, { backgroundColor: accentColor }]}>
        <Text style={styles.ctaText}>Naar campus</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: theme.spacing.lg,
    paddingHorizontal: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  dot: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  name: {
    fontFamily: theme.typography.title,
    fontSize: 28,
    color: theme.colors.text,
  },
  subtitle: {
    fontFamily: theme.typography.body,
    fontSize: 16,
    color: theme.colors.mutedText,
    marginBottom: theme.spacing.md,
  },
  addressWrap: {
    marginBottom: theme.spacing.md,
  },
  address: {
    fontFamily: theme.typography.body,
    fontSize: 16,
    color: theme.colors.text,
  },
  cta: {
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    color: theme.colors.white,
    fontFamily: theme.typography.subtitle,
    fontSize: 18,
  },
});