import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TextInput, Pressable } from 'react-native';
import NewsCard from '../components/NewsCard';
import { fetchWebflowNews } from '../services/webflow';
import { theme } from '../theme';
import { normalizeNews, sanitizeText } from '../services/webflowContent';

const sampleNews = [
  {
    title: 'Infodagen',
    description: 'Kom langs op onze Campussen en ontdek welke richting bij jou past.',
    date: '2026-05-12',
    dateValue: '2026-05-12',
    category: 'Evenement',
  },
  {
    title: 'Campus in de kijker',
    description: 'Leerlingen combineren werkervaring met praktijkgerichte lessen.',
    date: '2026-05-05',
    dateValue: '2026-05-05',
    category: 'Campus',
  },
];

export default function NewsList({ navigation }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Alle');
  const [sortBy, setSortBy] = useState('datum-nieuw');

  const categories = useMemo(() => {
    const unique = new Set(['Alle']);
    items.forEach((item) => {
      if (item?.category) unique.add(item.category);
    });
    return Array.from(unique);
  }, [items]);

  const filteredItems = useMemo(() => {
    const searchable = items.filter((item) => {
      const haystack = `${item.title} ${item.description} ${item.summary} ${item.text}`.toLowerCase();
      const matchesQuery = !query || haystack.includes(query.toLowerCase());
      const matchesCategory = selectedCategory === 'Alle' || item.category === selectedCategory;
      return matchesQuery && matchesCategory;
    });

    return [...searchable].sort((a, b) => {
      const titleA = String(a.title || '').toLowerCase();
      const titleB = String(b.title || '').toLowerCase();
      const dateA = new Date(a.dateValue || a.date || 0).getTime() || 0;
      const dateB = new Date(b.dateValue || b.date || 0).getTime() || 0;

      switch (sortBy) {
        case 'naam-az':
          return titleA.localeCompare(titleB, 'nl');
        case 'naam-za':
          return titleB.localeCompare(titleA, 'nl');
        case 'datum-oud':
          return dateA - dateB;
        case 'datum-nieuw':
        default:
          return dateB - dateA;
      }
    });
  }, [items, query, selectedCategory, sortBy]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const data = await fetchWebflowNews();
        const list = data.items || data || [];
        const fallback = sampleNews.map((n, index) => normalizeNews({
          _id: `sample-news-${index + 1}`,
          title: n.title,
          summary: n.description,
          description: n.description,
          date: n.dateValue || n.date,
          dateValue: n.dateValue,
          category: n.category,
        }, index));
        if (mounted) setItems(list.length ? list.map(normalizeNews) : fallback);
      } catch (e) {
        const fallback = sampleNews.map((n, index) => normalizeNews({
          _id: `sample-news-${index + 1}`,
          title: n.title,
          summary: n.description,
          description: n.description,
          date: n.dateValue || n.date,
          dateValue: n.dateValue,
          category: n.category,
        }, index));
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
    <View style={styles.screen}>
      <FlatList
        data={filteredItems}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            <Text style={styles.pageTitle}>Nieuws</Text>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Zoek nieuws"
              style={styles.searchInput}
            />

            <FlatList
              data={categories}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item}
              style={styles.filterRow}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => setSelectedCategory(item)}
                  style={[styles.filterPill, selectedCategory === item && styles.filterPillActive]}
                >
                  <Text style={[styles.filterText, selectedCategory === item && styles.filterTextActive]}>{item}</Text>
                </Pressable>
              )}
            />

            <View style={styles.sortRow}>
              <Pressable style={styles.sortBtn} onPress={() => setSortBy('datum-nieuw')}>
                <Text style={styles.sortText}>Nieuw → oud</Text>
              </Pressable>
              <Pressable style={styles.sortBtn} onPress={() => setSortBy('datum-oud')}>
                <Text style={styles.sortText}>Oud → nieuw</Text>
              </Pressable>
              <Pressable style={styles.sortBtn} onPress={() => setSortBy('naam-az')}>
                <Text style={styles.sortText}>A-Z</Text>
              </Pressable>
              <Pressable style={styles.sortBtn} onPress={() => setSortBy('naam-za')}>
                <Text style={styles.sortText}>Z-A</Text>
              </Pressable>
            </View>
          </View>
        }
        ListEmptyComponent={<Text style={styles.emptyState}>Geen nieuws gevonden.</Text>}
        renderItem={({ item }) => (
          <NewsCard
            id={item.id}
            title={item.title}
            description={item.description}
            date={item.date}
            imageUrl={item.imageUrl}
            summary={item.summary}
            text={item.text}
            campus={item.campus}
            campusColor={item.campusColor}
            category={item.category}
            onPress={(payload) => navigation.navigate('NewsDetail', payload || item)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  list: { padding: theme.spacing.lg },
  pageTitle: { fontFamily: theme.typography.title, fontSize: 28, color: theme.colors.text, marginBottom: theme.spacing.md },
  searchInput: { backgroundColor: '#fff', borderWidth: 1, borderColor: theme.colors.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, marginBottom: theme.spacing.md, fontFamily: theme.typography.body },
  filterRow: { marginBottom: theme.spacing.md, flexGrow: 0 },
  filterPill: { backgroundColor: theme.colors.cardBackground, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10, marginRight: 10, borderWidth: 1, borderColor: theme.colors.border },
  filterPillActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  filterText: { fontFamily: theme.typography.body, color: theme.colors.text },
  filterTextActive: { color: theme.colors.white },
  sortRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: theme.spacing.md },
  sortBtn: { backgroundColor: theme.colors.cardBackground, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: theme.colors.border, marginRight: 8, marginBottom: 8 },
  sortText: { fontFamily: theme.typography.subtitle, fontSize: 12, color: theme.colors.text },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background },
  emptyState: { fontFamily: theme.typography.body, color: theme.colors.mutedText, paddingVertical: 16 },
});
