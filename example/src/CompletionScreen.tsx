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

const CompletionScreen = () => {
  const cactusLM = useCactusLM({ model: 'qwen3-0.6' });
  const [input, setInput] = useState('What is the capital of France?');
  const [result, setResult] = useState<CactusLMCompleteResult | null>(null);

  useEffect(() => {
    if (!cactusLM.isDownloaded) {
      cactusLM.download();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cactusLM.isDownloaded]);

  const handleInit = () => {
    cactusLM.init();
  };

  const handleComplete = async () => {
    const messages: Message[] = [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: input },
    ];
    const completionResult = await cactusLM.complete({ messages });
    setResult(completionResult);
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
        value={input}
        onChangeText={setInput}
        placeholder="Type your message..."
        multiline
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleInit}>
          <Text style={styles.buttonText}>Init</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={handleComplete}
          disabled={cactusLM.isGenerating}
        >
          <Text style={styles.buttonText}>
            {cactusLM.isGenerating ? 'Completing...' : 'Complete'}
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

      {cactusLM.completion && (
        <View style={styles.completionContainer}>
          <Text style={styles.completionLabel}>Streaming:</Text>
          <View style={styles.completionBox}>
            <Text style={styles.completionText}>{cactusLM.completion}</Text>
          </View>
        </View>
      )}

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

export default CompletionScreen;

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
  completionContainer: {
    marginTop: 16,
  },
  completionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#000',
  },
  completionBox: {
    backgroundColor: '#f3f3f3',
    padding: 12,
    borderRadius: 8,
    minHeight: 100,
  },
  completionText: {
    fontSize: 14,
    color: '#000',
    lineHeight: 20,
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
