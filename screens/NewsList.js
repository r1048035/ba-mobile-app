import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import NewsCard from '../components/NewsCard';
import { fetchWebflowNews } from '../services/webflow';
import { theme } from '../theme';
import { sanitizeText, formatDate, normalizeImageUrl } from '../services/webflowContent';

function getNewsField(item, keys) {
  for (const key of keys) {
    if (item?.[key] != null) return item[key];
    if (item?.fieldData?.[key] != null) return item.fieldData[key];
  }
  return null;
}

function getNewsImageUrl(item) {
  const candidates = [
    getNewsField(item, ['image']),
    getNewsField(item, ['main-image']),
    getNewsField(item, ['mainImage']),
    getNewsField(item, ['cover']),
    getNewsField(item, ['thumbnail']),
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;
    if (typeof candidate === 'string') return normalizeImageUrl(candidate);
    if (candidate?.url) return normalizeImageUrl(candidate.url);
    if (candidate?.src) return normalizeImageUrl(candidate.src);
    if (Array.isArray(candidate) && candidate.length > 0) {
      const first = candidate[0];
      if (typeof first === 'string') return normalizeImageUrl(first);
      if (first?.url) return normalizeImageUrl(first.url);
      if (first?.src) return normalizeImageUrl(first.src);
    }
  }

  return null;
}

const sampleNews = [
  {
    title: 'Infodagen',
    description: 'Kom langs op onze Campussen en ontdek welke richting bij jou past.',
    date: '12 mei 2026',
  },
  {
    title: 'Campus in de kijker',
    description: 'Leerlingen combineren werkervaring met praktijkgerichte lessen.',
    date: '5 mei 2026',
  },
];

export default function NewsList({ navigation }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const data = await fetchWebflowNews();
        const list = data.items || data || [];
        const fallback = sampleNews.map((n) => ({
          name: n.title,
          title: n.title,
          summary: n.description,
          description: n.description,
          date: n.date,
        }));
        if (mounted) setItems(list.length ? list : fallback);
      } catch (e) {
        // fallback to sample news when API unavailable
        const fallback = sampleNews.map((n) => ({
          name: n.title,
          title: n.title,
          summary: n.description,
          description: n.description,
          date: n.date,
        }));
        if (mounted) setItems(fallback);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => (mounted = false);
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(i, idx) => i._id || i.id || String(idx)}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <NewsCard
          title={sanitizeText(getNewsField(item, ['name', 'title']))}
          description={sanitizeText(getNewsField(item, ['summary', 'description', 'excerpt']))}
          date={formatDate(getNewsField(item, ['date', 'publishedOn', 'published_at', '_createdOn']))}
          imageUrl={getNewsImageUrl(item)}
          summary={sanitizeText(getNewsField(item, ['summary', 'description', 'excerpt']))}
          text={sanitizeText(getNewsField(item, ['text', 'content', 'body', 'description']))}
          campus={sanitizeText(getNewsField(item, ['campus', 'campusName']))}
          onPress={(payload) => navigation.navigate('NewsDetail', payload || item)}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: theme.spacing.lg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background },
});
