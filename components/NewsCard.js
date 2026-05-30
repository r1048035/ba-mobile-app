import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '../theme';

export default function NewsCard({ title, description, image, date, summary, text, campus, campusColor, imageUrl, onPress }) {
  // When navigating, include richer payload so NewsDetail can show all fields
  const handlePress = () => {
    if (typeof onPress === 'function') {
      const body = text || description || summary || '';
      onPress({
        title,
        date,
        summary: summary || description || body,
        text: body,
        content: body,
        description,
        campus,
        campusColor,
        imageUrl: imageUrl || (image && image.uri),
        image,
      });
    }
  };

  return (
    <Pressable onPress={handlePress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      {image || imageUrl ? (
        <Image source={image || { uri: imageUrl }} style={styles.image} />
      ) : (
        <View style={styles.imagePlaceholder} />
      )}
      <View style={styles.content}>
        <Text style={styles.date}>{date}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {description || summary}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.md,
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadow,
  },
  pressed: {
    opacity: 0.92,
  },
  image: {
    width: '100%',
    height: 170,
  },
  imagePlaceholder: {
    width: '100%',
    height: 170,
    backgroundColor: '#EAEAEA',
  },
  content: {
    padding: theme.spacing.md,
  },
  date: {
    fontFamily: theme.typography.body,
    fontSize: 12,
    color: theme.colors.primary,
    marginBottom: 6,
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
});