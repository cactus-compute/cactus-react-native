import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import CompletionScreen from './CompletionScreen';
import VisionScreen from './VisionScreen';
import ToolCallingScreen from './ToolCallingScreen';
import RAGScreen from './RAGScreen';
import STTScreen from './STTScreen';
import ChatScreen from './ChatScreen';
import PerformanceScreen from './PerformanceScreen';

type Screen =
  | 'Home'
  | 'Completion'
  | 'Vision'
  | 'ToolCalling'
  | 'RAG'
  | 'STT'
  | 'Chat'
  | 'Performance';

const App = () => {
  const [selectedScreen, setSelectedScreen] = useState<Screen>('Home');

  const handleGoHome = () => {
    setSelectedScreen('Home');
  };

  const handleGoToCompletion = () => {
    setSelectedScreen('Completion');
  };

  const handleGoToVision = () => {
    setSelectedScreen('Vision');
  };

  const handleGoToToolCalling = () => {
    setSelectedScreen('ToolCalling');
  };

  const handleGoToRAG = () => {
    setSelectedScreen('RAG');
  };

  const handleGoToSTT = () => {
    setSelectedScreen('STT');
  };

  const handleGoToChat = () => {
    setSelectedScreen('Chat');
  };

  const handleGoToPerformance = () => {
    setSelectedScreen('Performance');
  };

  const renderScreen = () => {
    switch (selectedScreen) {
      case 'Completion':
        return <CompletionScreen />;
      case 'Vision':
        return <VisionScreen />;
      case 'ToolCalling':
        return <ToolCallingScreen />;
      case 'RAG':
        return <RAGScreen />;
      case 'STT':
        return <STTScreen />;
      case 'Chat':
        return <ChatScreen />;
      case 'Performance':
        return <PerformanceScreen />;
      default:
        return null;
    }
  };

  if (selectedScreen !== 'Home') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoHome}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        </View>
        {renderScreen()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Cactus</Text>

        <ScrollView style={styles.scrollView}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={handleGoToCompletion}
          >
            <Text style={styles.menuButtonTitle}>Completion</Text>
            <Text style={styles.menuButtonDescription}>
              Text generation and embeddings
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuButton}
            onPress={handleGoToVision}
          >
            <Text style={styles.menuButtonTitle}>Vision</Text>
            <Text style={styles.menuButtonDescription}>
              Image analysis and embeddings
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuButton}
            onPress={handleGoToToolCalling}
          >
            <Text style={styles.menuButtonTitle}>Tool Calling</Text>
            <Text style={styles.menuButtonDescription}>Function calls</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuButton} onPress={handleGoToRAG}>
            <Text style={styles.menuButtonTitle}>RAG</Text>
            <Text style={styles.menuButtonDescription}>
              Document-based answers
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuButton} onPress={handleGoToSTT}>
            <Text style={styles.menuButtonTitle}>Speech-to-Text</Text>
            <Text style={styles.menuButtonDescription}>
              Audio transcription and embeddings
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuButton} onPress={handleGoToChat}>
            <Text style={styles.menuButtonTitle}>Chat</Text>
            <Text style={styles.menuButtonDescription}>
              Multi-turn conversation
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuButton}
            onPress={handleGoToPerformance}
          >
            <Text style={styles.menuButtonTitle}>Performance</Text>
            <Text style={styles.menuButtonDescription}>
              Direct CactusLM class usage
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#000',
  },
  scrollView: {
    flex: 1,
  },
  menuButton: {
    padding: 12,
    backgroundColor: '#f3f3f3',
    borderRadius: 8,
    marginBottom: 12,
  },
  menuButtonTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  menuButtonDescription: {
    fontSize: 14,
    color: '#666',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 16,
    color: '#000',
  },
});
