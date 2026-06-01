import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TextInput, Pressable } from 'react-native';
import ProductCard from '../components/ProductCard';
import { fetchWebflowCategories, fetchWebflowProducts } from '../services/webflow';
import { normalizeProduct } from '../services/webflowContent';
import { theme } from '../theme';

const sampleProducts = [
  { id: 'prod-1', title: 'BA Totebag', description: 'Draagtasje van organisch katoen', price: '3,00', category: 'Schoolmateriaal' },
  { id: 'prod-2', title: 'BA Balpen', description: 'Blauw schrijvende pen', price: '0,50', category: 'Schoolmateriaal' },
];

export default function Products({ navigation }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Alle');
  const [sortBy, setSortBy] = useState('naam-az');

  const categories = useMemo(() => {
    const unique = new Set(['Alle']);
    items.forEach((item) => {
      const labels = item?.categoryLabels?.length ? item.categoryLabels : ['Overige'];
      labels.forEach((label) => unique.add(label));
    });
    return Array.from(unique);
  }, [items]);

  const filteredItems = useMemo(() => {
    const searchable = items.filter((item) => {
      const matchesQuery = !query || `${item.title} ${item.description}`.toLowerCase().includes(query.toLowerCase());
      const itemCategories = item?.categoryLabels?.length ? item.categoryLabels : ['Overige'];
      const matchesCategory = selectedCategory === 'Alle' || itemCategories.includes(selectedCategory);
      return matchesQuery && matchesCategory;
    });

    return [...searchable].sort((a, b) => {
      const priceA = Number(String(a.price || '0').replace(',', '.')) || 0;
      const priceB = Number(String(b.price || '0').replace(',', '.')) || 0;
      const titleA = String(a.title || '').toLowerCase();
      const titleB = String(b.title || '').toLowerCase();

      // Switch kiest de comparator op basis van `sortBy`.
      switch (sortBy) {
        case 'prijs-laag':
          return priceA - priceB;
        case 'prijs-hoog':
          return priceB - priceA;
        case 'naam-za':
          return titleB.localeCompare(titleA, 'nl');
        case 'naam-az':
        default:
          return titleA.localeCompare(titleB, 'nl');
      }
    });
  }, [items, query, selectedCategory, sortBy]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        // Parallelle API-calls: producten + categorieen in 1 stap.
        const [data, categoryData] = await Promise.all([
          fetchWebflowProducts(),
          fetchWebflowCategories().catch(() => ({ items: [] })),
        ]);
        const categoryLookup = new Map(
          (categoryData.items || []).map((categoryItem) => [
            categoryItem?.id,
            categoryItem?.fieldData?.name || categoryItem?.name || categoryItem?.fieldData?.title || categoryItem?.title || '',
          ])
        );
        const list = data.items || data || [];
        const normalized = list.length
          ? list.map((item) => {
              const product = normalizeProduct(item);
              // Map lookup: categorie-id -> label.
              const categoryLabels = (product.categoryIds || [])
                .map((categoryId) => categoryLookup.get(categoryId) || '')
                .filter(Boolean);
              return {
                ...product,
                categoryLabels: categoryLabels.length ? categoryLabels : ['Overige'],
                category: categoryLabels.join(' | '),
              };
            })
          : sampleProducts.map((item) => ({
              ...item,
              id: item.id,
              categoryLabels: [item.category],
              imageUrl: null,
            }));
        if (mounted) {
          setItems(normalized);
        }
      } catch (e) {
        if (mounted) setItems(sampleProducts.map((item) => ({
          ...item,
          categoryLabels: [item.category],
          imageUrl: null,
        })));
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Producten</Text>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Zoek op product"
        style={styles.searchInput}
      />

      <FlatList
        data={categories}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item}
        style={styles.filterRow}
        contentContainerStyle={styles.filterContent}
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
        <Pressable style={styles.sortBtn} onPress={() => setSortBy('prijs-hoog')}>
          <Text style={styles.sortText}>Prijs hoog</Text>
        </Pressable>
        <Pressable style={styles.sortBtn} onPress={() => setSortBy('prijs-laag')}>
          <Text style={styles.sortText}>Prijs laag</Text>
        </Pressable>
        <Pressable style={styles.sortBtn} onPress={() => setSortBy('naam-az')}>
          <Text style={styles.sortText}>A-Z</Text>
        </Pressable>
        <Pressable style={styles.sortBtn} onPress={() => setSortBy('naam-za')}>
          <Text style={styles.sortText}>Z-A</Text>
        </Pressable>
      </View>

      <FlatList
        data={filteredItems}
        keyExtractor={(i) => i.id}
        ListEmptyComponent={<Text style={styles.emptyState}>Geen producten gevonden.</Text>}
        renderItem={({ item }) => (
          <ProductCard
            title={item.title}
            description={item.description}
            price={item.price}
            image={item.imageUrl ? { uri: item.imageUrl } : undefined}
            // Detail gebruikt dit id om exact item op te halen via API.
            onPress={() => navigation.navigate('ProductDetail', { id: item.id })}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, padding: theme.spacing.lg },
  title: { fontFamily: theme.typography.subtitle, fontSize: 20, marginBottom: theme.spacing.md },
  searchInput: { backgroundColor: '#fff', borderWidth: 1, borderColor: theme.colors.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, marginBottom: theme.spacing.md, fontFamily: theme.typography.body },
  filterRow: { marginBottom: theme.spacing.sm },
  filterContent: { paddingBottom: 6 },
  filterPill: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
    minHeight: 46,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterPillActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  filterText: {
    fontFamily: theme.typography.body,
    color: theme.colors.text,
    fontSize: 14,
    lineHeight: 17,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  filterTextActive: { color: theme.colors.white },
  sortRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: theme.spacing.md },
  sortBtn: { backgroundColor: theme.colors.cardBackground, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: theme.colors.border, marginRight: 8, marginBottom: 8 },
  sortText: { fontFamily: theme.typography.subtitle, fontSize: 12, color: theme.colors.text },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background },
  emptyState: { fontFamily: theme.typography.body, color: theme.colors.mutedText, paddingVertical: 16 },
});
