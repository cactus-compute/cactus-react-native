import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useCactusSTT } from 'cactus-react-native';
import * as DocumentPicker from '@react-native-documents/picker';
import * as RNFS from '@dr.pogodin/react-native-fs';

// 2 seconds of 16kHz audio (2 bytes per sample)
const CHUNK_SIZE = 16000 * 2 * 3;

const StreamSTTScreen = () => {
  const cactusSTT = useCactusSTT({ model: 'whisper-small' });
  const [audioFile, setAudioFile] = useState<string | null>(null);
  const [audioFileName, setAudioFileName] = useState<string>('');

  useEffect(() => {
    if (!cactusSTT.isDownloaded) {
      cactusSTT.download();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cactusSTT.isDownloaded]);

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

  const readAudioFile = async (filePath: string): Promise<Uint8Array> => {
    const base64Audio = await RNFS.readFile(filePath, 'base64');
    const binaryString = atob(base64Audio);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    // Skip WAV header (44 bytes)
    return bytes.slice(44);
  };

  const handleStreamTranscribe = async () => {
    if (!audioFile) return;
    try {
      await cactusSTT.streamTranscribeStart({ confirmationThreshold: 0.99 });

      const pcmData = await readAudioFile(audioFile);

      for (let i = 0; i < pcmData.length; i += CHUNK_SIZE) {
        const chunk = pcmData.slice(i, i + CHUNK_SIZE);
        await cactusSTT.streamTranscribeProcess({
          audio: Array.from(chunk),
        });
      }

      await cactusSTT.streamTranscribeStop();
    } catch (err) {
      console.error('Stream error:', err);
    }
  };

  const handleStop = async () => {
    try {
      await cactusSTT.destroy();
    } catch (err) {
      console.error('Stop error:', err);
    }
  };

  if (cactusSTT.isDownloading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.progressText}>
          Downloading: {Math.round(cactusSTT.downloadProgress * 100)}%
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
        <TouchableOpacity
          style={[
            styles.button,
            (!audioFile || cactusSTT.isStreamTranscribing) &&
              styles.buttonDisabled,
          ]}
          onPress={handleStreamTranscribe}
          disabled={!audioFile || cactusSTT.isStreamTranscribing}
        >
          <Text style={styles.buttonText}>
            {cactusSTT.isStreamTranscribing
              ? 'Streaming...'
              : 'Stream Transcribe'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            !cactusSTT.isStreamTranscribing && styles.buttonDisabled,
          ]}
          onPress={handleStop}
          disabled={!cactusSTT.isStreamTranscribing}
        >
          <Text style={styles.buttonText}>Stop</Text>
        </TouchableOpacity>
      </View>

      {cactusSTT.isStreamTranscribing && (
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>● Streaming...</Text>
        </View>
      )}

      {cactusSTT.streamTranscribeConfirmed && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultLabel}>Confirmed Text:</Text>
          <View style={styles.resultBox}>
            <Text style={styles.resultText}>
              {cactusSTT.streamTranscribeConfirmed}
            </Text>
          </View>
        </View>
      )}

      {cactusSTT.streamTranscribePending && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultLabel}>Pending Text:</Text>
          <View style={styles.pendingBox}>
            <Text style={[styles.resultText, styles.pendingText]}>
              {cactusSTT.streamTranscribePending}
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

export default StreamSTTScreen;

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
    padding: 16,
    backgroundColor: '#f3f3f3',
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  selectButtonText: {
    fontSize: 16,
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
  statusContainer: {
    backgroundColor: '#f3f3f3',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  statusText: {
    fontSize: 14,
    color: '#2e7d32',
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
    minHeight: 60,
  },
  resultText: {
    fontSize: 14,
    color: '#000',
    lineHeight: 20,
  },
  pendingBox: {
    backgroundColor: '#f3f3f3',
    padding: 12,
    borderRadius: 8,
    minHeight: 60,
    opacity: 0.7,
  },
  pendingText: {
    fontStyle: 'italic',
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
