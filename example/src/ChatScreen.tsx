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
import { useCactusLM, type Message } from 'cactus-react-native';

const ChatScreen = () => {
  const cactusLM = useCactusLM();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'system', content: 'You are a helpful assistant.' },
  ]);

  useEffect(() => {
    if (!cactusLM.isDownloaded) {
      cactusLM.download();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cactusLM.isDownloaded]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');

    cactusLM.complete({ messages: updatedMessages });
  };

  useEffect(() => {
    if (!cactusLM.isGenerating && cactusLM.completion) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: cactusLM.completion },
      ]);
    }
  }, [cactusLM.isGenerating, cactusLM.completion]);

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

  const extendedMessages =
    cactusLM.isGenerating && cactusLM.completion
      ? [...messages, { role: 'assistant', content: cactusLM.completion }]
      : messages;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {extendedMessages
          .filter((m) => m.role !== 'system')
          .map((message, index) => (
            <View
              key={index}
              style={[
                styles.messageBubble,
                message.role === 'user'
                  ? styles.userBubble
                  : styles.assistantBubble,
              ]}
            >
              <Text style={styles.roleText}>{message.role}</Text>
              <Text style={styles.messageText}>{message.content}</Text>
            </View>
          ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type your message..."
          multiline
          editable={!cactusLM.isGenerating}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!input.trim() || cactusLM.isGenerating) &&
              styles.sendButtonDisabled,
          ]}
          onPress={handleSend}
          disabled={!input.trim() || cactusLM.isGenerating}
        >
          <Text style={styles.sendButtonText}>
            {cactusLM.isGenerating ? '...' : 'Send'}
          </Text>
        </TouchableOpacity>
      </View>

      {cactusLM.error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{cactusLM.error}</Text>
        </View>
      )}
    </View>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 20,
    paddingBottom: 10,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  userBubble: {
    backgroundColor: '#f3f3f3',
    alignSelf: 'flex-end',
    maxWidth: '80%',
  },
  assistantBubble: {
    backgroundColor: '#e8e8e8',
    alignSelf: 'flex-start',
    maxWidth: '80%',
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    color: '#000',
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    maxHeight: 100,
    color: '#000',
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#000',
    padding: 12,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#000',
    padding: 12,
    margin: 16,
    marginTop: 0,
    borderRadius: 8,
  },
  errorText: {
    color: '#fff',
    fontSize: 14,
  },
});
