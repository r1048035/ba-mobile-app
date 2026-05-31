import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, ActivityIndicator } from 'react-native';

import { theme } from '../theme';
import { getCampusById } from '../services/webflow';
import { normalizeCampus } from '../services/webflowContent';

export default function CampusDetail({ route }) {
  const params = route.params || {};
  const { id } = params;
  const [campus, setCampus] = useState(id ? null : params);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!id) return;
      setLoading(true);
      try {
        const res = await getCampusById(id);
        if (!mounted) return;
        const raw = res?.items ? res.items[0] : res;
        setCampus(normalizeCampus(raw, 0));
      } catch (error) {
        console.warn('campus load failed', error.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  const { name, description, addressLines = [], color, accentColor, imageUrl } = campus || {};
  const campusColor = color || accentColor || theme.colors.primary;

  if (loading && !campus) {
    return (
      <View style={styles.screen}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <View style={[styles.accent, { backgroundColor: campusColor }]} />
        <Text style={[styles.label, { color: campusColor }]}>Campus</Text>
        <Text style={styles.title}>{name}</Text>
        {imageUrl ? <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" /> : null}
        {description ? <Text style={styles.body}>{description}</Text> : null}
        {addressLines.length > 0 ? (
          <View style={styles.addressWrap}>
            {addressLines.map((line, index) => (
              <Text key={index} style={styles.address}>
                {line}
              </Text>
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
  image: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 14,
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