import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import CampusCard from '../components/CampusCard';
import fallbackCampuses from '../data/campuses';
import { fetchWebflowCampuses } from '../services/webflow';
import { normalizeCampus } from '../services/webflowContent';
import { theme } from '../theme';

export default function Campuses({ navigation }) {
  const [campusItems, setCampusItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const data = await fetchWebflowCampuses();
        const list = data.items || data || [];
        const normalized = list.length ? list.map(normalizeCampus) : fallbackCampuses;
        if (mounted) setCampusItems(normalized);
      } catch (e) {
        if (mounted) setCampusItems(fallbackCampuses);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Ontdek jouw toekomst hier op een Campus in Mechelen</Text>
      <Text style={styles.lead}>Kies uit meer dan 100 opleidingen en bouw aan jouw toekomst.</Text>

      <View style={styles.list}>
        {campusItems.map((c) => (
          <CampusCard
            key={c.id}
            name={c.name}
            subtitle={c.description}
            addressLines={c.addressLines}
            accentColor={c.color}
            onPress={() => navigation.navigate('CampusDetail', c)}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg, paddingBottom: theme.spacing.xl },
  pageTitle: {
    fontFamily: theme.typography.title,
    fontSize: 30,
    marginBottom: theme.spacing.md,
    color: theme.colors.text,
  },
  lead: {
    fontFamily: theme.typography.body,
    fontSize: 16,
    color: theme.colors.mutedText,
    marginBottom: theme.spacing.lg,
  },
  list: {
    marginTop: theme.spacing.sm,
  },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background },
});
