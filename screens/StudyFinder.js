import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, TextInput } from 'react-native';
import StudyCard from '../components/StudyCard';
import { theme } from '../theme';
import studies from '../data/studies';
import campusesData from '../data/campuses';
import DropdownModal from '../components/DropdownModal';

export default function StudyFinder({ navigation }) {
  const [campus, setCampus] = useState('Alle');
  const [degree, setDegree] = useState('Alle');
  const [finality, setFinality] = useState('Alle');
  const [query, setQuery] = useState('');
  const [searchText, setSearchText] = useState('');

  const campuses = useMemo(() => ['Alle', ...campusesData.map(c => c.name)], []);
  const degrees = useMemo(() => ['Alle', '1ste graad', '2de graad', '3de graad', 'HBO5'], []);
  const finalities = useMemo(() => ['Alle', { label: 'Doorstroom (D)', value: 'Doorstroom' }, { label: 'Dubbele finaliteit (D/A)', value: 'Dubbele' }, { label: 'Arbeidsmarkt (A)', value: 'Arbeidsmarkt' }, { label: 'BuSO (OV1–OV4)', value: 'BuSO' }], []);

  const [degreeModalVisible, setDegreeModalVisible] = React.useState(false);
  const [finalityModalVisible, setFinalityModalVisible] = React.useState(false);

  const filtered = useMemo(() => {
    return studies.filter(p => {
      if (campus !== 'Alle' && p.campus !== campus) return false;
      if (degree !== 'Alle' && p.degree !== degree) return false;
      if (finality !== 'Alle' && p.finality !== finality) return false;
      if (query && !(`${p.title} ${p.summary}`.toLowerCase().includes(query.toLowerCase()))) return false;
      return true;
    });
  }, [campus, degree, finality, query]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vind jouw studierichting</Text>
      <Text style={styles.subtitle}>Filter op campus, graad of finaliteit</Text>

      <View style={styles.filtersRow}>
        <Pressable style={[styles.filterPill, styles.filterPillSpacing]} onPress={() => setCampus('Alle')}>
          <Text style={styles.filterText}>{campus === 'Alle' ? 'Alle Campussen' : campus}</Text>
        </Pressable>
        <Pressable style={[styles.filterPill, styles.filterPillSpacing]} onPress={() => setDegreeModalVisible(true)}>
          <Text style={styles.filterText}>{degree === 'Alle' ? 'Alle Graden' : degree}</Text>
        </Pressable>
        <Pressable style={[styles.filterPill, styles.filterPillSpacing]} onPress={() => setFinalityModalVisible(true)}>
          <Text style={styles.filterText}>{finality === 'Alle' ? 'Alle Finaliteiten' : (finality === 'Dubbele' ? 'Dubbele finaliteit (D/A)' : finality === 'BuSO' ? 'BuSO (OV1–OV4)' : finality)}</Text>
        </Pressable>
      </View>
      
      <View style={styles.searchRow}>
        <TextInput
          placeholder="Zoek op richting"
          value={searchText}
          onChangeText={setSearchText}
          style={styles.searchInput}
          returnKeyType="search"
          onSubmitEditing={() => setQuery(searchText)}
        />
        <Pressable style={styles.searchBtn} onPress={() => setQuery(searchText)}>
          <Text style={styles.searchBtnText}>Zoek</Text>
        </Pressable>
      </View>

      <DropdownModal
        visible={degreeModalVisible}
        onClose={() => setDegreeModalVisible(false)}
        title="Kies graad"
        options={degrees}
        onSelect={(val) => setDegree(val)}
      />

      <DropdownModal
        visible={finalityModalVisible}
        onClose={() => setFinalityModalVisible(false)}
        title="Kies finaliteit"
        options={finalities}
        onSelect={(val) => setFinality(val)}
      />

      <View style={styles.selectorRow}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={campuses}
          keyExtractor={(i) => i}
          contentContainerStyle={{ paddingHorizontal: theme.spacing.lg }}
          renderItem={({ item }) => (
            <Pressable style={[styles.pill, campus === item && styles.pillActive]} onPress={() => setCampus(item)}>
              <Text style={[styles.pillText, campus === item && styles.pillTextActive]}>{item}</Text>
            </Pressable>
          )}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <StudyCard
            title={item.title}
            campus={item.campus}
            degree={item.degree}
            finality={item.finality}
            summary={item.summary}
            onPress={() => navigation.navigate('StaticPage', { title: item.title, body: item.summary })}
          />
        )}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, padding: theme.spacing.lg },
  title: { fontFamily: theme.typography.title, fontSize: 28, marginBottom: theme.spacing.sm },
  subtitle: { fontFamily: theme.typography.body, color: theme.colors.muted, marginBottom: theme.spacing.md },
  filtersRow: { flexDirection: 'row', marginBottom: theme.spacing.md, alignItems: 'center' },
  filterPill: { backgroundColor: '#fff', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#eee' },
  filterPillSpacing: { marginRight: theme.spacing.sm },
  filterText: { fontFamily: theme.typography.body },
  searchInput: { flex: 1, backgroundColor: '#fff', padding: 10, borderRadius: 8, marginLeft: theme.spacing.sm, borderWidth: 1, borderColor: '#eee' },
  selectorRow: { marginBottom: theme.spacing.md },
  pill: { backgroundColor: '#f6f6f6', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
  pillActive: { backgroundColor: theme.colors.primary },
  pillText: { fontFamily: theme.typography.body },
  pillTextActive: { color: '#fff' },
  list: { paddingBottom: theme.spacing.xl },
  searchBtn: { backgroundColor: theme.colors.primary, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8, marginLeft: 8 },
  searchBtnText: { color: '#fff', fontFamily: theme.typography.subtitle },
  searchRow: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.md },
});
