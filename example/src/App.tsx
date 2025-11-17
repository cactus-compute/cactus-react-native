import { useState } from 'react';
import { Text, View, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { useCactusLM, type CactusLMCompleteResult } from 'cactus-react-native';

export default function App() {
  const cactusLM = useCactusLM({ model: 'qwen3-0.6', contextSize: 2048 });
  const [completionResult, setCompletionResult] =
    useState<CactusLMCompleteResult | null>(null);

  const getModels = async () => {
    try {
      const models = await cactusLM.getModels();
      console.log('Available models:', models);
    } catch (error) {
      console.error('Error getting models:', error);
    }
  };

  const download = async () => {
    try {
      await cactusLM.download();
      console.log('Model downloaded successfully');
    } catch (error) {
      console.error('Error downloading model:', error);
    }
  };

  const init = async () => {
    try {
      await cactusLM.init();
      console.log('Model initialized successfully');
    } catch (error) {
      console.error('Error initializing model:', error);
    }
  };

  const complete = async () => {
    try {
      const result = await cactusLM.complete({
        messages: [{ role: 'user', content: 'Hello, World!' }],
      });
      setCompletionResult(result);
      console.log('Completion result:', result);
    } catch (error) {
      console.error('Error during completion:', error);
    }
  };

  const reset = async () => {
    try {
      await cactusLM.reset();
      console.log('Model reset successfully');
    } catch (error) {
      console.error('Error during resetting conversation:', error);
    }
  };

  const stop = async () => {
    try {
      await cactusLM.stop();
      console.log('Stopped completion successfully');
    } catch (error) {
      console.error('Error during stopping completion:', error);
    }
  };

  const embed = async () => {
    try {
      const result = await cactusLM.embed({ text: 'Hello, World!' });
      setCompletionResult(null);
      console.log('Embedding result:', result);
    } catch (error) {
      console.error('Error during embedding:', error);
    }
  };

  const destroy = async () => {
    try {
      await cactusLM.destroy();
      console.log('Destroyed model successfully');
    } catch (error) {
      console.error('Error during destroying model:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.statusContainer}>
        <Text>Error: {cactusLM.error}</Text>
        <Text>Is Downloaded: {cactusLM.isDownloaded ? 'true' : 'false'}</Text>
        <Text>Is Downloading: {cactusLM.isDownloading ? 'true' : 'false'}</Text>
        <Text>Download Progress: {cactusLM.downloadProgress}</Text>
        <Text>
          Is Initializing: {cactusLM.isInitializing ? 'true' : 'false'}
        </Text>
        <Text>Is Generating: {cactusLM.isGenerating ? 'true' : 'false'}</Text>
      </View>

      <View style={styles.responseContainer}>
        <Text>Completion Result:</Text>
        <Text>Success: {completionResult?.success ? 'true' : 'false'}</Text>
        <Text>
          Function Calls: {JSON.stringify(completionResult?.functionCalls)}
        </Text>
        <Text>
          Time to First Token (ms): {completionResult?.timeToFirstTokenMs}
        </Text>
        <Text>Total Time (ms): {completionResult?.totalTimeMs}</Text>
        <Text>Tokens per Second: {completionResult?.tokensPerSecond}</Text>
        <Text>Prefill Tokens: {completionResult?.prefillTokens}</Text>
        <Text>Decode Tokens: {completionResult?.decodeTokens}</Text>
        <Text>Total Tokens: {completionResult?.totalTokens}</Text>
        <Text>Response: </Text>
        <ScrollView>
          <Text>{cactusLM.completion}</Text>
        </ScrollView>
      </View>

      <View style={styles.buttonsContainer}>
        <Text onPress={download} style={styles.button}>
          Download
        </Text>
        <Text onPress={init} style={styles.button}>
          Initialize
        </Text>
        <Text onPress={complete} style={styles.button}>
          Complete
        </Text>
        <Text onPress={embed} style={styles.button}>
          Embed
        </Text>
        <Text onPress={reset} style={styles.button}>
          Reset
        </Text>
        <Text onPress={stop} style={styles.button}>
          Stop
        </Text>
        <Text onPress={destroy} style={styles.button}>
          Destroy
        </Text>
        <Text onPress={getModels} style={styles.button}>
          Get Models
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 16,
    gap: 8,
  },
  statusContainer: {
    gap: 4,
  },
  responseContainer: {
    flex: 1,
  },
  buttonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  button: {
    backgroundColor: 'lightgreen',
    padding: 12,
  },
});
