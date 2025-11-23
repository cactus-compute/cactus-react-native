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
import { useCactusLM, type CactusLMEmbedResult } from 'cactus-react-native';

const EmbeddingScreen = () => {
  const cactusLM = useCactusLM({ model: 'qwen3-0.6' });
  const [text, setText] = useState('Hello, World!');
  const [result, setResult] = useState<CactusLMEmbedResult | null>(null);

  useEffect(() => {
    if (!cactusLM.isDownloaded) {
      cactusLM.download();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cactusLM.isDownloaded]);

  const handleInit = () => {
    cactusLM.init();
  };

  const handleEmbed = async () => {
    const embedResult = await cactusLM.embed({ text });
    setResult(embedResult);
  };

  const handleDestroy = () => {
    cactusLM.destroy();
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
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        placeholder="Enter text to embed..."
        multiline
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleInit}>
          <Text style={styles.buttonText}>Init</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={handleEmbed}
          disabled={cactusLM.isGenerating}
        >
          <Text style={styles.buttonText}>
            {cactusLM.isGenerating ? 'Embedding...' : 'Embed'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleDestroy}>
          <Text style={styles.buttonText}>Destroy</Text>
        </TouchableOpacity>
      </View>

      {result && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultLabel}>CactusLMEmbedResult:</Text>
          <View style={styles.resultBox}>
            <Text style={styles.resultFieldLabel}>embedding:</Text>
            <ScrollView horizontal>
              <Text style={styles.resultFieldValue}>
                [
                {result.embedding
                  .slice(0, 20)
                  .map((v) => v.toFixed(4))
                  .join(', ')}
                {result.embedding.length > 20 ? ', ...' : ''}] (length:{' '}
                {result.embedding.length})
              </Text>
            </ScrollView>
          </View>
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

export default EmbeddingScreen;

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
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top',
    marginBottom: 16,
    color: '#000',
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
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
  },
  resultFieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  resultFieldValue: {
    fontSize: 14,
    color: '#000',
    lineHeight: 20,
  },
  marginTop: {
    marginTop: 12,
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
