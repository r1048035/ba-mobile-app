import React, { useEffect, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, View, Image, Pressable, ActivityIndicator } from 'react-native';
import CampusCard from '../components/CampusCard';
import NewsCard from '../components/NewsCard';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';
import { fetchWebflowNews, fetchWebflowProducts, fetchWebflowCampuses } from '../services/webflow';
import { normalizeCampus, normalizeNews, normalizeProduct } from '../services/webflowContent';
import fallbackCampuses from '../data/campuses';
import { theme } from '../theme';

const sampleNews = [
  {
    id: 'news-1',
    title: 'Infodagen',
    description: 'Kom langs op onze Campussen en ontdek welke richting bij jou past.',
    date: '12 mei 2026',
  },
  {
    id: 'news-2',
    title: 'Campus in de kijker',
    description: 'Leerlingen combineren werkervaring met praktijkgerichte lessen.',
    date: '5 mei 2026',
  },
];

const sampleProducts = [
  {
    id: 'prod-1',
    title: 'BA Totebag',
    description: 'Draagtasje van organisch katoen, voorzien van het Fairtrade label. Afmetingen: 38x42cm.',
    price: '3,00',
  },
  {
    id: 'prod-2',
    title: 'BA Balpen',
    description: 'ABS-balpen in witte kunststof. Blauw schrijvend.',
    price: '0,50',
  },
];

export default function HomeScreen({ navigation }) {
  const [campusItems, setCampusItems] = useState([]);
  const [newsItems, setNewsItems] = useState([]);
  const [productItems, setProductItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadAll() {
      try {
        const [newsData, productData, campusData] = await Promise.all([
          fetchWebflowNews().catch(() => null),
          fetchWebflowProducts().catch(() => null),
          fetchWebflowCampuses().catch(() => null),
        ]);

        if (!mounted) return;

        const newsList = newsData?.items || newsData || [];
        const productList = productData?.items || productData || [];
        const campusList = campusData?.items || campusData || [];

        setNewsItems(newsList.length ? newsList.map(normalizeNews).slice(0, 2) : sampleNews);
        setProductItems(productList.length ? productList.map(normalizeProduct).slice(0, 2) : sampleProducts);
        setCampusItems(campusList.length ? campusList.map(normalizeCampus).slice(0, 8) : fallbackCampuses);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadAll();
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
      <View style={styles.heroWrap}>
        <Text style={styles.heroTitle}>Kies jouw{"\n"}toekomst</Text>
        <Image source={require('../images/logo-default.png')} style={styles.heroImage} resizeMode="contain" />
      </View>

      <Pressable style={styles.cta} onPress={() => navigation.navigate('Campuses')}>
        <Text style={styles.ctaText}>ONZE CAMPUSSEN</Text>
      </Pressable>

      <Pressable style={styles.studyFinderBtn} onPress={() => navigation.navigate('StudyFinder')}>
        <Text style={styles.studyFinderText}>Vind een studierichting</Text>
      </Pressable>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Campussen</Text>
        <FlatList
          data={campusItems.length ? campusItems : fallbackCampuses}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <CampusCard
              name={item.name}
              subtitle={item.description}
              addressLines={item.addressLines}
              accentColor={item.color}
              onPress={() => navigation.navigate('CampusDetail', item)}
            />
          )}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Nieuws</Text>
        <FlatList
          data={newsItems.length ? newsItems : sampleNews}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <NewsCard
              title={item.title}
              description={item.description}
              date={item.date}
              imageUrl={item.imageUrl}
              summary={item.summary}
              text={item.text}
              campus={item.campus}
              onPress={(payload) => navigation.navigate('NewsDetail', payload || item)}
            />
          )}
        />
        <Pressable style={styles.otherNewsBtn} onPress={() => navigation.navigate('NewsList')}>
          <Text style={styles.otherNewsText}>Al het Nieuws</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Producten</Text>
        <FlatList
          data={productItems.length ? productItems : sampleProducts}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
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
        <Pressable style={styles.otherNewsBtn} onPress={() => navigation.navigate('Products')}>
          <Text style={styles.otherNewsText}>Alle producten</Text>
        </Pressable>
      </View>

      <View style={styles.footerWrap}>
        <Footer />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    
    marginBottom: theme.spacing.lg,
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: theme.spacing.md,
  },
  headerTitle: {
    fontFamily: theme.typography.title,
    fontSize: 18,
    color: theme.colors.text,
  },
  heroWrap: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  heroTitle: {
    fontFamily: theme.typography.title,
    fontSize: 48,
    textAlign: 'center',
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
    lineHeight: 52,
  },
  heroImage: {
    width: '100%',
    height: undefined,
    aspectRatio: 3,
    borderRadius: 12,
    alignSelf: 'stretch',
    marginBottom: theme.spacing.lg,
  },
  cta: {
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    paddingVertical: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  ctaText: {
    color: theme.colors.white,
    fontFamily: theme.typography.subtitle,
    fontSize: 20,
    letterSpacing: 1,
  },
  studyFinderBtn: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  studyFinderText: {
    fontFamily: theme.typography.subtitle,
    fontSize: 16,
    color: theme.colors.text,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontFamily: theme.typography.subtitle,
    fontSize: 18,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  featured: {
    marginBottom: theme.spacing.lg,
  },
  featuredImage: {
    width: '100%',
    height: undefined,
    aspectRatio: 16 / 9,
    borderRadius: 16,
    marginBottom: theme.spacing.md,
  },
  featuredText: {
    fontFamily: theme.typography.body,
    fontSize: 16,
    color: theme.colors.mutedText,
    marginBottom: theme.spacing.md,
  },
  otherNewsBtn: {
    alignSelf: 'stretch',
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  otherNewsText: {
    fontFamily: theme.typography.subtitle,
    fontSize: 16,
    color: theme.colors.primary,
  },
  footerWrap: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  footerLogo: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginBottom: theme.spacing.md,
  },
  footerLink: {
    fontFamily: theme.typography.body,
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
});