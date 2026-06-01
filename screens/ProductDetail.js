import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, Pressable } from 'react-native';

import { theme } from '../theme';
import { getProductById } from '../services/webflow';
import { normalizeProduct } from '../services/webflowContent';
import { useCart } from '../context/CartContext';

export default function ProductDetail({ route }) {
  const { id } = route.params || {};
  const [item, setItem] = useState(route.params || null);
  const [loading, setLoading] = useState(false);
  const [qty, setQty] = useState(1);
  const { addItem } = useCart();
  const priceValue = Number(String(item?.price || '0').replace(',', '.')) || 0;
  const totalPrice = (priceValue * qty).toFixed(2).replace('.', ',');

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!id) return;
      setLoading(true);
      try {
        const res = await getProductById(id);
        if (!mounted) return;
        // Webflow response kan een item of een items-array zijn.
        const raw = res?.items ? res.items[0] : res;
        setItem(normalizeProduct(raw, 0));
      } catch (e) {
        console.warn('product load failed', e.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [id]);

  if (loading || !item) {
    return (
      <View style={styles.screen}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.label}>Product</Text>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.body}>{item.description}</Text>
        <Text style={styles.price}>€ {item.price || ''}</Text>
        <Text style={styles.total}>Totaal: € {totalPrice}</Text>
        <Text style={styles.helper}>Aantal kan niet lager dan 1.</Text>

        <View style={{ flexDirection: 'row', marginTop: 16, alignItems: 'center' }}>
          <Pressable onPress={() => setQty(Math.max(1, qty - 1))} style={styles.qtyBtn}><Text style={styles.qtyText}>−</Text></Pressable>
          <View style={styles.qtyDisplay}><Text style={styles.qtyText}>{qty}</Text></View>
          <Pressable onPress={() => setQty(qty + 1)} style={styles.qtyBtn}><Text style={styles.qtyText}>+</Text></Pressable>
          <Pressable style={styles.addBtn} onPress={() => addItem(item, qty)}>
            <Text style={styles.addBtnText}>Voeg toe ({qty})</Text>
          </Pressable>
        </View>
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
  body: {
    fontFamily: theme.typography.body,
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.mutedText,
    marginBottom: 16,
  },
  price: {
    fontFamily: theme.typography.subtitle,
    fontSize: 20,
    color: theme.colors.primary,
  },
  total: {
    marginTop: 10,
    fontFamily: theme.typography.subtitle,
    fontSize: 18,
    color: theme.colors.text,
  },
  helper: {
    marginTop: 4,
    fontFamily: theme.typography.body,
    fontSize: 13,
    color: theme.colors.mutedText,
  },
  qtyBtn: { padding: 8, borderRadius: 6, backgroundColor: '#fff', borderWidth: 1, borderColor: '#eee' },
  qtyDisplay: { paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center' },
  qtyText: { fontFamily: theme.typography.subtitle, fontSize: 16 },
  addBtn: { marginLeft: 12, backgroundColor: theme.colors.primary, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8 },
  addBtnText: { color: '#fff', fontFamily: theme.typography.subtitle },
});