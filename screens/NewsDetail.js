import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Image, ActivityIndicator } from 'react-native';

import { theme } from '../theme';
import { getNewsById } from '../services/webflow';
import { normalizeNews, sanitizeText, formatDate, normalizeImageUrl } from '../services/webflowContent';

export default function NewsDetail({ route, navigation }) {
  const params = route.params || {};
  const { id } = params;
  const [item, setItem] = useState(id ? null : params);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!id) return;
      setLoading(true);
      try {
        const res = await getNewsById(id);
        if (!mounted) return;
        const raw = res?.items ? res.items[0] : res;
        setItem(normalizeNews(raw, 0));
      } catch (error) {
        console.warn('news load failed', error.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  const { title, date, summary, text, content, description, campus, campusColor, image, imageUrl } = item || {};

  if (loading && !item) {
    return (
      <View style={styles.screen}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // support different property names from API and fallbacks
  const rawBody = text || content || description || '';
  const rawSummary = summary || description || '';
  const imageSource = normalizeImageUrl(imageUrl) || normalizeImageUrl(image) || (image && image.uri) || null;

  const cleanTitle = sanitizeText(title || '');
  const cleanDate = formatDate(date);
  const bodyText = sanitizeText(rawBody);
  const summaryText = sanitizeText(rawSummary);
  const campusClean = sanitizeText(campus || '');

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.label}>Nieuws</Text>
        <Text style={styles.title}>{cleanTitle}</Text>
        {cleanDate ? <Text style={styles.date}>{cleanDate}</Text> : null}
        {campusClean ? <Text style={[styles.campus, campusColor ? { color: campusColor } : null]}>{campusClean}</Text> : null}

        {imageSource ? (
          <Image source={{ uri: imageSource }} style={styles.image} resizeMode="cover" />
        ) : null}

        {summaryText ? <Text style={styles.summary}>{summaryText}</Text> : null}

        <Text style={styles.body}>{bodyText || ''}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: { padding: theme.spacing.lg },
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
  date: {
    fontFamily: theme.typography.subtitle,
    fontSize: 13,
    color: theme.colors.mutedText,
    marginBottom: 14,
  },
  campus: {
    fontFamily: theme.typography.subtitle,
    fontSize: 14,
    marginBottom: theme.spacing.sm,
  },
  image: {
    width: '100%',
    height: undefined,
    aspectRatio: 16 / 9,
    borderRadius: 12,
    marginBottom: theme.spacing.md,
  },
  summary: {
    fontFamily: theme.typography.body,
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    fontWeight: '600',
  },
  otherBtn: {
    alignSelf: 'flex-end',
    backgroundColor: theme.colors.cardBackground,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.sm,
    marginBottom: theme.spacing.sm,
  },
  otherBtnText: {
    fontFamily: theme.typography.body,
    color: theme.colors.primary,
  },
  body: {
    fontFamily: theme.typography.body,
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.mutedText,
  },
});