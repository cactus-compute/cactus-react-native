import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import {
  useCactusLM,
  type Message,
  type CactusLMCompleteResult,
} from 'cactus-react-native';
import { launchImageLibrary } from 'react-native-image-picker';

const VisionScreen = () => {
  const cactusLM = useCactusLM({ model: 'lfm2-vl-450m' });
  const [input, setInput] = useState("What's in the image?");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [result, setResult] = useState<CactusLMCompleteResult | null>(null);

  useEffect(() => {
    if (!cactusLM.isDownloaded) {
      cactusLM.download();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cactusLM.isDownloaded]);

  const handleSelectImage = async () => {
    const imageResult = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.1,
    });

    if (imageResult.assets?.[0]?.uri) {
      setSelectedImage(imageResult.assets[0].uri);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    const messages: Message[] = [
      {
        role: 'system',
        content: 'You are a helpful assistant that can analyze images.',
      },
      {
        role: 'user',
        content: input,
        images: [selectedImage],
      },
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
      <TouchableOpacity style={styles.imageButton} onPress={handleSelectImage}>
        {selectedImage ? (
          <Image source={{ uri: selectedImage }} style={styles.image} />
        ) : (
          <Text style={styles.imageButtonText}>Select Image</Text>
        )}
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        value={input}
        onChangeText={setInput}
        placeholder="Ask about the image..."
        multiline
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleInit}>
          <Text style={styles.buttonText}>Init</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, !selectedImage && styles.buttonDisabled]}
          onPress={handleAnalyze}
          disabled={!selectedImage || cactusLM.isGenerating}
        >
          <Text style={styles.buttonText}>
            {cactusLM.isGenerating ? 'Analyzing...' : 'Analyze'}
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

export default VisionScreen;

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
  imageButton: {
    height: 160,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 8,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  imageButtonText: {
    fontSize: 16,
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
  buttonDisabled: {
    backgroundColor: '#ccc',
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
