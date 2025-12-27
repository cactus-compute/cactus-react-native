import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {
  useCactusLM,
  useCactusIndex,
  type CactusIndexQueryResult,
  type CactusIndexGetResult,
} from 'cactus-react-native';

const SAMPLE_DOCUMENTS = [
  'The capital of France is Paris.',
  'The largest planet in our solar system is Jupiter.',
  'The chemical symbol for water is H2O.',
];

const IndexScreen = () => {
  const cactusLM = useCactusLM({
    model: 'lfm2-350m',
  });
  const cactusIndex = useCactusIndex({
    name: 'example_index',
    embeddingDim: 1024,
  });

  // State for adding new document
  const [newId, setNewId] = useState<string>('');
  const [newDoc, setNewDoc] = useState<string>('');
  const [newMetadata, setNewMetadata] = useState<string>('');

  // State for querying
  const [query, setQuery] = useState<string>('What is the capital of France?');
  const [queryResults, setQueryResults] =
    useState<CactusIndexQueryResult | null>(null);
  const [getResults, setGetResults] = useState<CactusIndexGetResult | null>(
    null
  );

  useEffect(() => {
    cactusLM.download();

    // Cleanup on unmount
    return () => {
      cactusLM.destroy();
      cactusIndex.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!cactusLM.isDownloaded) {
      return;
    }

    const setupIndex = async () => {
      try {
        // Initialize model and index
        await cactusLM.init();
        await cactusIndex.init();
      } catch (e) {
        console.error('Error during index setup:', e);
        return;
      }

      try {
        // Check if index is already populated
        const existing = await cactusIndex.get({ ids: [0] });
        if (existing.documents.length > 0) {
          console.log('Index already populated, skipping setup.');
          return;
        }
      } catch {}

      const ids = [];
      const documents = [];
      const embeddings = [];
      const metadatas = [];

      for (const [i, doc] of SAMPLE_DOCUMENTS.entries()) {
        ids.push(i);
        documents.push(doc);
        metadatas.push(JSON.stringify({ source: `Sample Document ${i}` }));
        const embedding = await cactusLM.embed({ text: doc });
        console.log(
          `Generated embedding for document: "${doc}" with embedding length: ${embedding.embedding.length}`
        );
        embeddings.push(embedding.embedding);
      }

      try {
        await cactusIndex.add({ ids, documents, embeddings, metadatas });
      } catch (e) {
        console.error('Error adding documents to index:', e);
      }
    };
    setupIndex();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cactusLM.isDownloaded]);

  const indexAdd = async () => {
    if (!newId || !newDoc) {
      console.warn('Please provide both an ID and a document to add.');
      return;
    }

    try {
      const embedding = await cactusLM.embed({ text: newDoc });
      await cactusIndex.add({
        ids: [parseInt(newId, 10)],
        documents: [newDoc],
        embeddings: [embedding.embedding],
        metadatas: [newMetadata],
      });
      console.log('Document added successfully');
      setNewId('');
      setNewDoc('');
      setNewMetadata('');
    } catch (e) {
      console.error('Error adding document to index:', e);
    }
  };

  const indexQuery = async () => {
    if (!query) {
      console.warn('Please provide a query string.');
      return;
    }

    try {
      const queryEmbedding = await cactusLM.embed({ text: query });
      const queryResult = await cactusIndex.query({
        embeddings: [queryEmbedding.embedding],
        options: { topK: 3, scoreThreshold: 0.1 },
      });

      console.log('Query results:', queryResult);
      setQueryResults(queryResult);

      if (!queryResult.ids[0]) {
        console.log('No results found for the query.');
        return;
      }

      setGetResults(await cactusIndex.get({ ids: queryResult.ids[0] }));
    } catch (e) {
      console.error('Error querying index:', e);
      return;
    }
  };

  if (cactusLM.isDownloading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.progressText}>
          Downloading model: {Math.round(cactusLM.downloadProgress * 100)}%
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Vector Index Demo</Text>
        <Text style={styles.infoText}>
          Sample documents have been indexed. Query them or add new documents.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Add Document</Text>
        <TextInput
          style={styles.input}
          value={newId}
          onChangeText={setNewId}
          placeholder="Document ID (number)"
          placeholderTextColor="#666"
          keyboardType="numeric"
        />
        <TextInput
          style={[styles.input, styles.multilineInput]}
          value={newDoc}
          onChangeText={setNewDoc}
          placeholder="Document text..."
          placeholderTextColor="#666"
          multiline
        />
        <TextInput
          style={styles.input}
          value={newMetadata}
          onChangeText={setNewMetadata}
          placeholder="Metadata (optional, JSON string)"
          placeholderTextColor="#666"
        />
        <TouchableOpacity
          style={styles.button}
          onPress={indexAdd}
          disabled={cactusLM.isGenerating}
        >
          <Text style={styles.buttonText}>Add to Index</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Query Index</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          value={query}
          onChangeText={setQuery}
          placeholder="Enter your query..."
          placeholderTextColor="#666"
          multiline
        />
        <TouchableOpacity
          style={styles.button}
          onPress={indexQuery}
          disabled={cactusLM.isGenerating}
        >
          <Text style={styles.buttonText}>
            {cactusLM.isGenerating ? 'Querying...' : 'Query'}
          </Text>
        </TouchableOpacity>
      </View>

      {getResults && queryResults && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultLabel}>Results</Text>
          {getResults.documents.map((doc, index) => (
            <View key={index} style={styles.resultBox}>
              <View style={styles.resultHeader}>
                <Text style={styles.resultScore}>
                  {queryResults.scores[0]?.[index]?.toFixed(3) || 'N/A'}
                </Text>
              </View>
              <Text style={styles.resultText}>{doc}</Text>
              {getResults.metadatas[index] && (
                <Text style={styles.resultMetadata}>
                  {getResults.metadatas[index]}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}

      {cactusLM.error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{cactusLM.error}</Text>
        </View>
      )}
    </ScrollView>
  );
};

export default IndexScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  progressText: {
    marginTop: 16,
    fontSize: 16,
    color: '#000',
  },
  infoBox: {
    backgroundColor: '#f3f3f3',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    color: '#000',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    color: '#000',
  },
  multilineInput: {
    textAlignVertical: 'top',
    minHeight: 80,
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  button: {
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultContainer: {
    marginTop: 16,
    marginBottom: 16,
  },
  resultLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#000',
  },
  resultBox: {
    backgroundColor: '#f3f3f3',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  resultHeader: {
    marginBottom: 8,
  },
  resultScore: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  resultText: {
    fontSize: 14,
    color: '#000',
    lineHeight: 20,
  },
  resultMetadata: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  errorContainer: {
    backgroundColor: '#000',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  errorText: {
    color: '#fff',
    fontSize: 14,
  },
});
