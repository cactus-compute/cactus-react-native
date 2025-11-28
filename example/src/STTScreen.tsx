import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {
  useCactusSTT,
  type CactusSTTTranscribeResult,
  type CactusSTTAudioEmbedResult,
} from 'cactus-react-native';
import * as DocumentPicker from '@react-native-documents/picker';
import * as RNFS from '@dr.pogodin/react-native-fs';

const STTScreen = () => {
  const cactusSTT = useCactusSTT({ model: 'whisper-small' });
  const [audioFile, setAudioFile] = useState<string | null>(null);
  const [audioFileName, setAudioFileName] = useState<string>('');
  const [result, setResult] = useState<CactusSTTTranscribeResult | null>(null);
  const [embeddingResult, setEmbeddingResult] =
    useState<CactusSTTAudioEmbedResult | null>(null);

  useEffect(() => {
    if (!cactusSTT.isDownloaded) {
      cactusSTT.download();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cactusSTT.isDownloaded]);

  const handleInit = () => {
    cactusSTT.init();
  };

  const handleSelectAudio = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.audio],
      });
      if (res && res.length > 0) {
        const fileName = `audio_${Date.now()}.wav`;
        const destPath = `${RNFS.CachesDirectoryPath}/${fileName}`;
        await RNFS.copyFile(res[0].uri, destPath);
        setAudioFile(destPath);
        setAudioFileName(res[0].name || 'Unknown');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTranscribe = async () => {
    if (!audioFile) {
      return;
    }
    const transcribeResult = await cactusSTT.transcribe({
      audioFilePath: audioFile,
    });
    setResult(transcribeResult);
  };

  const handleAudioEmbed = async () => {
    if (!audioFile) {
      return;
    }
    const embedResult = await cactusSTT.audioEmbed({
      audioPath: audioFile,
    });
    setEmbeddingResult(embedResult);
  };

  const handleStop = () => {
    cactusSTT.stop();
  };

  const handleReset = () => {
    cactusSTT.reset();
  };

  const handleDestroy = () => {
    cactusSTT.destroy();
  };

  if (cactusSTT.isDownloading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.progressText}>
          Downloading model: {Math.round(cactusSTT.downloadProgress * 100)}%
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.selectButton} onPress={handleSelectAudio}>
        <Text style={styles.selectButtonText}>
          {audioFile ? `Selected: ${audioFileName}` : 'Select Audio File'}
        </Text>
      </TouchableOpacity>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleInit}>
          <Text style={styles.buttonText}>Init</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, !audioFile && styles.buttonDisabled]}
          onPress={handleTranscribe}
          disabled={cactusSTT.isGenerating || !audioFile}
        >
          <Text style={styles.buttonText}>Transcribe</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, !audioFile && styles.buttonDisabled]}
          onPress={handleAudioEmbed}
          disabled={cactusSTT.isGenerating || !audioFile}
        >
          <Text style={styles.buttonText}>Audio Embed</Text>
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

      {cactusSTT.transcription && (
        <View style={styles.responseContainer}>
          <Text style={styles.responseLabel}>Streaming:</Text>
          <View style={styles.responseBox}>
            <Text style={styles.responseText}>{cactusSTT.transcription}</Text>
          </View>
        </View>
      )}

      {result && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultLabel}>CactusSTTTranscribeResult:</Text>
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

      {embeddingResult && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultLabel}>CactusSTTAudioEmbedResult:</Text>
          <View style={styles.resultBox}>
            <Text style={styles.resultFieldLabel}>embedding:</Text>
            <ScrollView
              horizontal
              style={styles.embeddingScrollView}
              showsHorizontalScrollIndicator={true}
            >
              <Text style={styles.resultFieldValue}>
                [{embeddingResult.embedding.slice(0, 10).join(', ')}
                {embeddingResult.embedding.length > 10 ? ', ...' : ''}]
              </Text>
            </ScrollView>

            <Text style={[styles.resultFieldLabel, styles.marginTop]}>
              dimensions:
            </Text>
            <Text style={styles.resultFieldValue}>
              {embeddingResult.embedding.length}
            </Text>
          </View>
        </View>
      )}

      {cactusSTT.error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{cactusSTT.error}</Text>
        </View>
      )}
    </ScrollView>
  );
};

export default STTScreen;

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
  selectButton: {
    backgroundColor: '#f3f3f3',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  selectButtonText: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
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
  responseContainer: {
    marginTop: 16,
  },
  responseLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#000',
  },
  responseBox: {
    backgroundColor: '#f3f3f3',
    padding: 12,
    borderRadius: 8,
    minHeight: 100,
  },
  responseText: {
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
  embeddingScrollView: {
    maxHeight: 60,
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
