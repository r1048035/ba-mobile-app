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
      <Pressable onPress={() => setShowDebug((s) => !s)} style={{ marginBottom: 12 }}>
        <Text style={{ color: theme.colors.primary }}>{showDebug ? 'Verberg debug' : 'Toon debug'}</Text>
      </Pressable>
      {showDebug && items && items.length > 0 ? (
        <View style={{ backgroundColor: '#fff', padding: 8, borderRadius: 8, marginBottom: 12 }}>
          <Text style={{ fontFamily: theme.typography.body, fontSize: 12 }}>{JSON.stringify(items[0], null, 2)}</Text>
        </View>
      ) : null}
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <ProductCard
            title={item.title}
            description={item.description}
            price={item.price}
            image={item.imageUrl ? { uri: item.imageUrl } : undefined}
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
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background },
});
