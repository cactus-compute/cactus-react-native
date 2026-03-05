import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { getRegistry, type CactusModel } from 'cactus-react-native';

type RegistryEntry = { key: string; model: CactusModel };

const ModelBrowserScreen = () => {
  const [entries, setEntries] = useState<RegistryEntry[]>([]);
  const [filtered, setFiltered] = useState<RegistryEntry[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getRegistry()
      .then((registry) => {
        const list = Object.entries(registry).map(([key, model]) => ({
          key,
          model,
        }));
        list.sort((a, b) => a.key.localeCompare(b.key));
        setEntries(list);
        setFiltered(list);
      })
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : String(e))
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = search.trim().toLowerCase();
    setFiltered(q ? entries.filter((e) => e.key.includes(q)) : entries);
  }, [search, entries]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading model registry...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        value={search}
        onChangeText={setSearch}
        placeholder="Search models..."
        placeholderTextColor="#666"
        clearButtonMode="while-editing"
      />
      <Text style={styles.count}>
        {filtered.length} of {entries.length} models
      </Text>
      <ScrollView contentContainerStyle={styles.list}>
        {filtered.map(({ key, model }) => {
          const { int4, int8 } = model.quantization;
          return (
            <View key={key} style={styles.card}>
              <Text style={styles.modelName}>{key}</Text>
              <View style={styles.variants}>
                <VariantRow label="int4" url={int4.url} pro={int4.pro?.apple} />
                <VariantRow label="int8" url={int8.url} pro={int8.pro?.apple} />
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const VariantRow = ({
  label,
  url,
  pro,
}: {
  label: string;
  url: string;
  pro?: string;
}) => (
  <View style={styles.variantRow}>
    <View style={styles.variantBadge}>
      <Text style={styles.variantLabel}>{label}</Text>
    </View>
    <Text style={styles.variantUrl} numberOfLines={1}>
      {url.replace('https://huggingface.co/', '')}
    </Text>
    {pro && (
      <View style={styles.proBadge}>
        <Text style={styles.proLabel}>Apple</Text>
      </View>
    )}
  </View>
);

export default ModelBrowserScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  errorText: {
    fontSize: 14,
    color: '#c00',
    textAlign: 'center',
  },
  search: {
    margin: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#000',
  },
  count: {
    marginHorizontal: 16,
    marginBottom: 8,
    fontSize: 12,
    color: '#666',
  },
  list: {
    padding: 16,
    paddingTop: 0,
  },
  card: {
    backgroundColor: '#f3f3f3',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  modelName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  variants: {
    gap: 6,
  },
  variantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  variantBadge: {
    backgroundColor: '#000',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  variantLabel: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '600',
  },
  variantUrl: {
    flex: 1,
    fontSize: 11,
    color: '#666',
  },
  proBadge: {
    backgroundColor: '#e8f0fe',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  proLabel: {
    fontSize: 11,
    color: '#1a73e8',
    fontWeight: '600',
  },
});
