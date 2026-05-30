import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import ProductCard from '../components/ProductCard';
import { fetchWebflowProducts } from '../services/webflow';
import { normalizeProduct } from '../services/webflowContent';
import { theme } from '../theme';

const sampleProducts = [
  { id: 'prod-1', title: 'BA Totebag', description: 'Draagtasje van organisch katoen', price: '3,00' },
  { id: 'prod-2', title: 'BA Balpen', description: 'Blauw schrijvende pen', price: '0,50' },
];

export default function Products({ navigation }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const data = await fetchWebflowProducts();
        const list = data.items || data || [];
        const normalized = list.length ? list.map(normalizeProduct) : sampleProducts.map((item) => ({
          ...item,
          id: item.id,
          imageUrl: null,
        }));
        if (mounted) {
          setItems(normalized);
          try {
            console.log('[Products] loaded', { count: normalized.length, sample: normalized.slice(0, 5).map(i => i.id) });
          } catch (e) {}
        }
      } catch (e) {
        if (mounted) setItems(sampleProducts.map((item) => ({
          ...item,
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
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <ProductCard
            title={item.title}
            description={item.description}
            price={item.price}
            image={item.imageUrl ? { uri: item.imageUrl } : undefined}
            onPress={() => navigation.navigate('ProductDetail', item)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, padding: theme.spacing.lg },
  title: { fontFamily: theme.typography.subtitle, fontSize: 20, marginBottom: theme.spacing.md },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background },
});
