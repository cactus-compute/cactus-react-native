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
  type Message,
  type CactusLMCompleteResult,
} from 'cactus-react-native';
import * as RNFS from '@dr.pogodin/react-native-fs';

const RAGScreen = () => {
  const [corpusDir, setCorpusDir] = useState<string | null>(null);
  const cactusLM = useCactusLM({
    model: 'lfm2-1.2b-rag',
    corpusDir: corpusDir || undefined,
  });
  const [input, setInput] = useState('How old is Spike the cactus?');
  const [isSettingUp, setIsSettingUp] = useState(true);
  const [result, setResult] = useState<CactusLMCompleteResult | null>(null);

  useEffect(() => {
    setupCorpus();
  }, []);

  useEffect(() => {
    if (corpusDir && !cactusLM.isDownloaded) {
      cactusLM.download();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [corpusDir, cactusLM.isDownloaded]);

  const setupCorpus = async () => {
    try {
      const corpusPath = `${RNFS.DocumentDirectoryPath}/rag_corpus`;
      const dirExists = await RNFS.exists(corpusPath);

      if (!dirExists) {
        await RNFS.mkdir(corpusPath);
      }

      const doc1 = `My Personal Plant Collection

I've been growing plants for years. My Golden Barrel Cactus, named Spike, is now eight years old. I got it from a garden sale back in 2017. It sits on the southwest windowsill where it gets about six hours of direct sunlight each day.

Spike only needs watering once every three weeks during summer and once a month in winter. The pot it lives in is a twelve inch terracotta container. Last year it finally produced its first yellow flowers in late June. The current height is approximately fourteen inches.

My Monstera Deliciosa, called Ferdinand, is five years old and has forty-three leaves. It produces a new leaf approximately every two weeks during growing season. Ferdinand drinks water twice a week in summer but only once a week in winter.`;

      await RNFS.writeFile(`${corpusPath}/plants.txt`, doc1, 'utf8');

      setCorpusDir(corpusPath);
      setIsSettingUp(false);
    } catch (error) {
      console.error('Error setting up corpus:', error);
      setIsSettingUp(false);
    }
  };

  const handleAsk = async () => {
    const messages: Message[] = [
      {
        role: 'system',
        content:
          'You are a helpful assistant that can use provided documents to answer user questions.',
      },
      { role: 'user', content: input },
    ];
    const completionResult = await cactusLM.complete({ messages });
    setResult(completionResult);
  };

  const handleInit = () => {
    cactusLM.init();
  };

  const handleStop = () => {
    cactusLM.stop();
  };

  const handleReset = () => {
    cactusLM.reset();
  };

  const handleDestroy = () => {
    cactusLM.destroy();
  };

  if (isSettingUp) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.progressText}>Setting up documents...</Text>
      </View>
    );
  }

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
        <Text style={styles.infoTitle}>Document Corpus</Text>
        <Text style={styles.infoText}>
          Sample documents about plant collection have been loaded
        </Text>
      </View>

      <TextInput
        style={styles.input}
        value={input}
        onChangeText={setInput}
        placeholder="Ask about the documents..."
        multiline
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleInit}>
          <Text style={styles.buttonText}>Init</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={handleAsk}
          disabled={cactusLM.isGenerating}
        >
          <Text style={styles.buttonText}>
            {cactusLM.isGenerating ? 'Processing...' : 'Ask'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleStop}>
          <Text style={styles.buttonText}>Stop</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleReset}>
          <Text style={styles.buttonText}>Reset</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleDestroy}>
          <Text style={styles.buttonText}>Destroy</Text>
        </TouchableOpacity>
      </View>

      {result && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultLabel}>CactusLMCompleteResult:</Text>
          <View style={styles.resultBox}>
            <Text style={styles.resultFieldLabel}>success:</Text>
            <Text style={styles.resultFieldValue}>
              {result.success.toString()}
            </Text>

            <Text style={[styles.resultFieldLabel, styles.marginTop]}>
              response:
            </Text>
            <Text style={styles.resultFieldValue}>{result.response}</Text>

            <Text style={[styles.resultFieldLabel, styles.marginTop]}>
              functionCalls:
            </Text>
            <Text style={styles.resultFieldValue}>
              {result.functionCalls
                ? JSON.stringify(result.functionCalls, null, 2)
                : 'undefined'}
            </Text>

            <Text style={[styles.resultFieldLabel, styles.marginTop]}>
              timeToFirstTokenMs:
            </Text>
            <Text style={styles.resultFieldValue}>
              {result.timeToFirstTokenMs.toFixed(2)}
            </Text>

            <Text style={[styles.resultFieldLabel, styles.marginTop]}>
              totalTimeMs:
            </Text>
            <Text style={styles.resultFieldValue}>
              {result.totalTimeMs.toFixed(2)}
            </Text>

            <Text style={[styles.resultFieldLabel, styles.marginTop]}>
              tokensPerSecond:
            </Text>
            <Text style={styles.resultFieldValue}>
              {result.tokensPerSecond.toFixed(2)}
            </Text>

            <Text style={[styles.resultFieldLabel, styles.marginTop]}>
              prefillTokens:
            </Text>
            <Text style={styles.resultFieldValue}>{result.prefillTokens}</Text>

            <Text style={[styles.resultFieldLabel, styles.marginTop]}>
              decodeTokens:
            </Text>
            <Text style={styles.resultFieldValue}>{result.decodeTokens}</Text>

            <Text style={[styles.resultFieldLabel, styles.marginTop]}>
              totalTokens:
            </Text>
            <Text style={styles.resultFieldValue}>{result.totalTokens}</Text>
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

export default RAGScreen;

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
