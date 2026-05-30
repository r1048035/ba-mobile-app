import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '../theme';

export default function ProductCard({ title, description, image, price, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      {image ? <Image source={image} style={styles.image} /> : <View style={styles.imagePlaceholder} />}
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {description}
        </Text>
        <View style={styles.footerRow}>
          <Text style={styles.price}>€ {price || ''}</Text>
          <Text style={styles.cta}>Bekijk</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.radius.md,
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadow,
  },
  image: {
    width: '100%',
    height: 180,
  },
  imagePlaceholder: {
    width: '100%',
    height: 180,
    backgroundColor: '#E6E6E6',
  },
  content: {
    padding: theme.spacing.md,
  },
  title: {
    fontFamily: theme.typography.subtitle,
    fontSize: 17,
    color: theme.colors.text,
    marginBottom: 4,
  },
  description: {
    fontFamily: theme.typography.body,
    fontSize: 14,
    color: theme.colors.mutedText,
    lineHeight: 20,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  price: {
    fontFamily: theme.typography.subtitle,
    fontSize: 16,
    color: theme.colors.primary,
  },
  
  cta: {
    fontFamily: theme.typography.subtitle,
    fontSize: 13,
    color: theme.colors.text,
  },
});