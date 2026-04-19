#include "HybridCactus.hpp"

namespace margelo::nitro::cactus {

HybridCactus::HybridCactus() : HybridObject(TAG) {}

std::shared_ptr<Promise<void>>
HybridCactus::init(const std::string &modelPath,
                   const std::optional<std::string> &corpusDir,
                   std::optional<bool> cacheIndex) {
  return Promise<void>::async(
      [this, modelPath, corpusDir, cacheIndex]() -> void {
        std::lock_guard<std::mutex> lock(this->_modelMutex);

        if (this->_model) {
          throw std::runtime_error("Cactus model is already initialized");
        }

        const cactus_model_t model =
            cactus_init(modelPath.c_str(),
                        corpusDir ? corpusDir->c_str() : nullptr,
                        cacheIndex.value_or(false));

        if (!model) {
          throw std::runtime_error("Cactus init failed: " +
                                   std::string(cactus_get_last_error()));
        }

        this->_model = model;
      });
}

std::shared_ptr<Promise<std::string>> HybridCactus::complete(
    const std::string &messagesJson, double responseBufferSize,
    const std::optional<std::string> &optionsJson,
    const std::optional<std::string> &toolsJson,
    const std::optional<std::function<void(const std::string & /* token */,
                                           double /* tokenId */)>> &callback,
    const std::optional<std::vector<double>> &audio) {
  return Promise<std::string>::async([this, messagesJson, optionsJson,
                                      toolsJson, callback,
                                      responseBufferSize, audio]() -> std::string {
    std::lock_guard<std::mutex> lock(this->_modelMutex);

    if (!this->_model) {
      throw std::runtime_error("Cactus model is not initialized");
    }

    struct CallbackCtx {
      const std::function<void(const std::string & /* token */,
                               double /* tokenId */)> *callback;
    } callbackCtx{callback.has_value() ? &callback.value() : nullptr};

    auto cactusTokenCallback = [](const char *token, uint32_t tokenId,
                                  void *userData) {
      auto *callbackCtx = static_cast<CallbackCtx *>(userData);
      if (!callbackCtx || !callbackCtx->callback || !(*callbackCtx->callback))
        return;
      (*callbackCtx->callback)(token, tokenId);
    };

    std::string responseBuffer;
    responseBuffer.resize(responseBufferSize);

    const uint8_t *pcmData = nullptr;
    size_t pcmSize = 0;
    std::vector<uint8_t> audioBytes;

    if (audio.has_value()) {
      const auto &audioDoubles = *audio;
      audioBytes.reserve(audioDoubles.size());
      for (double d : audioDoubles) {
        d = std::clamp(d, 0.0, 255.0);
        audioBytes.emplace_back(static_cast<uint8_t>(d));
      }
      pcmData = audioBytes.data();
      pcmSize = audioBytes.size();
    }

    int result = cactus_complete(this->_model, messagesJson.c_str(),
                                 responseBuffer.data(), responseBufferSize,
                                 optionsJson ? optionsJson->c_str() : nullptr,
                                 toolsJson ? toolsJson->c_str() : nullptr,
                                 cactusTokenCallback, &callbackCtx,
                                 pcmData, pcmSize);

    if (result < 0) {
      throw std::runtime_error("Cactus complete failed: " +
                               std::string(cactus_get_last_error()));
    }

    // Remove null terminator
    responseBuffer.resize(strlen(responseBuffer.c_str()));

    return responseBuffer;
  });
}

std::shared_ptr<Promise<std::string>> HybridCactus::prefill(
    const std::string &messagesJson, double responseBufferSize,
    const std::optional<std::string> &optionsJson,
    const std::optional<std::string> &toolsJson,
    const std::optional<std::vector<double>> &audio) {
  return Promise<std::string>::async([this, messagesJson, responseBufferSize,
                                      optionsJson, toolsJson,
                                      audio]() -> std::string {
    std::lock_guard<std::mutex> lock(this->_modelMutex);

    if (!this->_model) {
      throw std::runtime_error("Cactus model is not initialized");
    }

    std::string responseBuffer;
    responseBuffer.resize(responseBufferSize);

    const uint8_t *pcmData = nullptr;
    size_t pcmSize = 0;
    std::vector<uint8_t> audioBytes;

    if (audio.has_value()) {
      const auto &audioDoubles = *audio;
      audioBytes.reserve(audioDoubles.size());
      for (double d : audioDoubles) {
        d = std::clamp(d, 0.0, 255.0);
        audioBytes.emplace_back(static_cast<uint8_t>(d));
      }
      pcmData = audioBytes.data();
      pcmSize = audioBytes.size();
    }

    int result = cactus_prefill(this->_model, messagesJson.c_str(),
                                responseBuffer.data(), responseBufferSize,
                                optionsJson ? optionsJson->c_str() : nullptr,
                                toolsJson ? toolsJson->c_str() : nullptr,
                                pcmData, pcmSize);

    if (result < 0) {
      throw std::runtime_error("Cactus prefill failed: " +
                               std::string(cactus_get_last_error()));
    }

    responseBuffer.resize(strlen(responseBuffer.c_str()));
    return responseBuffer;
  });
}

std::shared_ptr<Promise<std::vector<double>>>
HybridCactus::tokenize(const std::string &text) {
  return Promise<std::vector<double>>::async([this,
                                              text]() -> std::vector<double> {
    std::lock_guard<std::mutex> lock(this->_modelMutex);

    if (!this->_model) {
      throw std::runtime_error("Cactus model is not initialized");
    }

    std::vector<uint32_t> tokenBuffer(text.length() * 2 + 16);
    size_t outTokenLen = 0;

    int result = cactus_tokenize(this->_model, text.c_str(), tokenBuffer.data(),
                                 tokenBuffer.size(), &outTokenLen);

    if (result < 0) {
      throw std::runtime_error("Cactus tokenize failed: " +
                               std::string(cactus_get_last_error()));
    }

    tokenBuffer.resize(outTokenLen);

    return std::vector<double>(tokenBuffer.begin(), tokenBuffer.end());
  });
}

std::shared_ptr<Promise<std::string>>
HybridCactus::scoreWindow(const std::vector<double> &tokens, double start,
                          double end, double context) {
  return Promise<std::string>::async(
      [this, tokens, start, end, context]() -> std::string {
        std::lock_guard<std::mutex> lock(this->_modelMutex);

        if (!this->_model) {
          throw std::runtime_error("Cactus model is not initialized");
        }

        std::vector<uint32_t> tokenBuffer;
        tokenBuffer.reserve(tokens.size());
        for (double d : tokens) {
          tokenBuffer.emplace_back(static_cast<uint32_t>(d));
        }

        std::string responseBuffer;
        responseBuffer.resize(1024);

        int result = cactus_score_window(
            this->_model, tokenBuffer.data(), tokenBuffer.size(),
            static_cast<size_t>(start), static_cast<size_t>(end),
            static_cast<size_t>(context), responseBuffer.data(),
            responseBuffer.size());

        if (result < 0) {
          throw std::runtime_error("Cactus score window failed: " +
                                   std::string(cactus_get_last_error()));
        }

        // Remove null terminator
        responseBuffer.resize(strlen(responseBuffer.c_str()));

        return responseBuffer;
      });
}

std::shared_ptr<Promise<std::string>> HybridCactus::transcribe(
    const std::variant<std::vector<double>, std::string> &audio,
    const std::string &prompt, double responseBufferSize,
    const std::optional<std::string> &optionsJson,
    const std::optional<std::function<void(const std::string & /* token */,
                                           double /* tokenId */)>> &callback) {
  return Promise<std::string>::async([this, audio, prompt, optionsJson,
                                      callback,
                                      responseBufferSize]() -> std::string {
    std::lock_guard<std::mutex> lock(this->_modelMutex);

    if (!this->_model) {
      throw std::runtime_error("Cactus model is not initialized");
    }

    struct CallbackCtx {
      const std::function<void(const std::string & /* token */,
                               double /* tokenId */)> *callback;
    } callbackCtx{callback.has_value() ? &callback.value() : nullptr};

    auto cactusTokenCallback = [](const char *token, uint32_t tokenId,
                                  void *userData) {
      auto *callbackCtx = static_cast<CallbackCtx *>(userData);
      if (!callbackCtx || !callbackCtx->callback || !(*callbackCtx->callback))
        return;
      (*callbackCtx->callback)(token, tokenId);
    };

    std::string responseBuffer;
    responseBuffer.resize(responseBufferSize);

    int result;
    if (std::holds_alternative<std::string>(audio)) {
      result = cactus_transcribe(
          this->_model, std::get<std::string>(audio).c_str(), prompt.c_str(),
          responseBuffer.data(), responseBufferSize,
          optionsJson ? optionsJson->c_str() : nullptr, cactusTokenCallback,
          &callbackCtx, nullptr, 0);
    } else {
      const auto &audioDoubles = std::get<std::vector<double>>(audio);

      std::vector<uint8_t> audioBytes;
      audioBytes.reserve(audioDoubles.size());

      for (double d : audioDoubles) {
        d = std::clamp(d, 0.0, 255.0);
        audioBytes.emplace_back(static_cast<uint8_t>(d));
      }

      result = cactus_transcribe(this->_model, nullptr, prompt.c_str(),
                                 responseBuffer.data(), responseBufferSize,
                                 optionsJson ? optionsJson->c_str() : nullptr,
                                 cactusTokenCallback, &callbackCtx,
                                 audioBytes.data(), audioBytes.size());
    }

    if (result < 0) {
      throw std::runtime_error("Cactus transcribe failed: " +
                               std::string(cactus_get_last_error()));
    }

    // Remove null terminator
    responseBuffer.resize(strlen(responseBuffer.c_str()));

    return responseBuffer;
  });
}

std::shared_ptr<Promise<std::string>> HybridCactus::detectLanguage(
    const std::variant<std::vector<double>, std::string> &audio,
    double responseBufferSize,
    const std::optional<std::string> &optionsJson) {
  return Promise<std::string>::async(
      [this, audio, optionsJson, responseBufferSize]() -> std::string {
        std::lock_guard<std::mutex> lock(this->_modelMutex);

        if (!this->_model) {
          throw std::runtime_error("Cactus model is not initialized");
        }

        std::string responseBuffer;
        responseBuffer.resize(responseBufferSize);

        int result;
        if (std::holds_alternative<std::string>(audio)) {
          result = cactus_detect_language(
              this->_model, std::get<std::string>(audio).c_str(),
              responseBuffer.data(), responseBufferSize,
              optionsJson ? optionsJson->c_str() : nullptr, nullptr, 0);
        } else {
          const auto &audioDoubles = std::get<std::vector<double>>(audio);

          std::vector<uint8_t> audioBytes;
          audioBytes.reserve(audioDoubles.size());

          for (double d : audioDoubles) {
            d = std::clamp(d, 0.0, 255.0);
            audioBytes.emplace_back(static_cast<uint8_t>(d));
          }

          result = cactus_detect_language(
              this->_model, nullptr, responseBuffer.data(), responseBufferSize,
              optionsJson ? optionsJson->c_str() : nullptr, audioBytes.data(),
              audioBytes.size());
        }

        if (result < 0) {
          throw std::runtime_error("Cactus detect language failed: " +
                                   std::string(cactus_get_last_error()));
        }

        responseBuffer.resize(strlen(responseBuffer.c_str()));
        return responseBuffer;
      });
}

std::shared_ptr<Promise<void>> HybridCactus::streamTranscribeStart(
    const std::optional<std::string> &optionsJson) {
  return Promise<void>::async([this, optionsJson]() -> void {
    std::lock_guard<std::mutex> lock(this->_modelMutex);

    if (!this->_model) {
      throw std::runtime_error("Cactus model is not initialized");
    }

    if (this->_streamTranscribe) {
      throw std::runtime_error(
          "Cactus stream transcribe is already initialized");
    }

    this->_streamTranscribe = cactus_stream_transcribe_start(
        this->_model, optionsJson ? optionsJson->c_str() : nullptr);
    if (!this->_streamTranscribe) {
      throw std::runtime_error("Cactus stream transcribe start failed: " +
                               std::string(cactus_get_last_error()));
    }
  });
}

std::shared_ptr<Promise<std::string>>
HybridCactus::streamTranscribeProcess(const std::vector<double> &audio) {
  return Promise<std::string>::async([this, audio]() -> std::string {
    std::lock_guard<std::mutex> lock(this->_modelMutex);

    if (!this->_streamTranscribe) {
      throw std::runtime_error("Cactus stream transcribe is not initialized");
    }

    std::vector<uint8_t> audioBytes;
    audioBytes.reserve(audio.size());
    for (double d : audio) {
      d = std::clamp(d, 0.0, 255.0);
      audioBytes.emplace_back(static_cast<uint8_t>(d));
    }

    std::string responseBuffer;
    responseBuffer.resize(32768);

    int result = cactus_stream_transcribe_process(
        this->_streamTranscribe, audioBytes.data(), audioBytes.size(),
        responseBuffer.data(), responseBuffer.size());

    if (result < 0) {
      throw std::runtime_error("Cactus stream transcribe process failed: " +
                               std::string(cactus_get_last_error()));
    }

    // Remove null terminator
    responseBuffer.resize(strlen(responseBuffer.c_str()));

    return responseBuffer;
  });
}

std::shared_ptr<Promise<std::string>> HybridCactus::streamTranscribeStop() {
  return Promise<std::string>::async([this]() -> std::string {
    std::lock_guard<std::mutex> lock(this->_modelMutex);

    if (!this->_streamTranscribe) {
      throw std::runtime_error("Cactus stream transcribe is not initialized");
    }

    std::string responseBuffer;
    responseBuffer.resize(32768);

    int result = cactus_stream_transcribe_stop(
        this->_streamTranscribe, responseBuffer.data(), responseBuffer.size());

    this->_streamTranscribe = nullptr;

    if (result < 0) {
      throw std::runtime_error("Cactus stream transcribe stop failed: " +
                               std::string(cactus_get_last_error()));
    }

    // Remove null terminator
    responseBuffer.resize(strlen(responseBuffer.c_str()));

    return responseBuffer;
  });
}

std::shared_ptr<Promise<std::string>>
HybridCactus::vad(const std::variant<std::vector<double>, std::string> &audio,
                  double responseBufferSize,
                  const std::optional<std::string> &optionsJson) {
  return Promise<std::string>::async(
      [this, audio, responseBufferSize, optionsJson]() -> std::string {
        std::lock_guard<std::mutex> lock(this->_modelMutex);

        if (!this->_model) {
          throw std::runtime_error("Cactus model is not initialized");
        }

        std::string responseBuffer;
        responseBuffer.resize(responseBufferSize);

        int result;
        if (std::holds_alternative<std::string>(audio)) {
          result =
              cactus_vad(this->_model,
                         std::get<std::string>(audio).c_str(),
                         responseBuffer.data(), responseBufferSize,
                         optionsJson ? optionsJson->c_str() : nullptr,
                         nullptr, 0);
        } else {
          const auto &audioDoubles = std::get<std::vector<double>>(audio);

          std::vector<uint8_t> audioBytes;
          audioBytes.reserve(audioDoubles.size());
          for (double d : audioDoubles) {
            d = std::clamp(d, 0.0, 255.0);
            audioBytes.emplace_back(static_cast<uint8_t>(d));
          }

          result =
              cactus_vad(this->_model, nullptr,
                         responseBuffer.data(), responseBufferSize,
                         optionsJson ? optionsJson->c_str() : nullptr,
                         audioBytes.data(), audioBytes.size());
        }

        if (result < 0) {
          throw std::runtime_error("Cactus VAD failed: " +
                                   std::string(cactus_get_last_error()));
        }

        // Remove null terminator
        responseBuffer.resize(strlen(responseBuffer.c_str()));

        return responseBuffer;
      });
}

std::shared_ptr<Promise<std::vector<double>>>
HybridCactus::embed(const std::string &text, double embeddingBufferSize,
                    bool normalize) {
  return Promise<std::vector<double>>::async(
      [this, text, embeddingBufferSize, normalize]() -> std::vector<double> {
        std::lock_guard<std::mutex> lock(this->_modelMutex);

        if (!this->_model) {
          throw std::runtime_error("Cactus model is not initialized");
        }

        std::vector<float> embeddingBuffer(embeddingBufferSize);
        size_t embeddingDim;

        int result = cactus_embed(
            this->_model, text.c_str(), embeddingBuffer.data(),
            embeddingBufferSize * sizeof(float), &embeddingDim, normalize);

        if (result < 0) {
          throw std::runtime_error("Cactus embed failed: " +
                                   std::string(cactus_get_last_error()));
        }

        embeddingBuffer.resize(embeddingDim);

        return std::vector<double>(embeddingBuffer.begin(),
                                   embeddingBuffer.end());
      });
}

std::shared_ptr<Promise<std::vector<double>>>
HybridCactus::imageEmbed(const std::string &imagePath,
                         double embeddingBufferSize) {
  return Promise<std::vector<double>>::async(
      [this, imagePath, embeddingBufferSize]() -> std::vector<double> {
        std::lock_guard<std::mutex> lock(this->_modelMutex);

        if (!this->_model) {
          throw std::runtime_error("Cactus model is not initialized");
        }

        std::vector<float> embeddingBuffer(embeddingBufferSize);
        size_t embeddingDim;

        int result = cactus_image_embed(
            this->_model, imagePath.c_str(), embeddingBuffer.data(),
            embeddingBufferSize * sizeof(float), &embeddingDim);

        if (result < 0) {
          throw std::runtime_error("Cactus image embed failed: " +
                                   std::string(cactus_get_last_error()));
        }

        embeddingBuffer.resize(embeddingDim);

        return std::vector<double>(embeddingBuffer.begin(),
                                   embeddingBuffer.end());
      });
}

std::shared_ptr<Promise<std::vector<double>>>
HybridCactus::audioEmbed(const std::string &audioPath,
                         double embeddingBufferSize) {
  return Promise<std::vector<double>>::async(
      [this, audioPath, embeddingBufferSize]() -> std::vector<double> {
        std::lock_guard<std::mutex> lock(this->_modelMutex);

        if (!this->_model) {
          throw std::runtime_error("Cactus model is not initialized");
        }

        std::vector<float> embeddingBuffer(embeddingBufferSize);
        size_t embeddingDim;

        int result = cactus_audio_embed(
            this->_model, audioPath.c_str(), embeddingBuffer.data(),
            embeddingBufferSize * sizeof(float), &embeddingDim);

        if (result < 0) {
          throw std::runtime_error("Cactus audio embed failed: " +
                                   std::string(cactus_get_last_error()));
        }

        embeddingBuffer.resize(embeddingDim);

        return std::vector<double>(embeddingBuffer.begin(),
                                   embeddingBuffer.end());
      });
}

std::shared_ptr<Promise<std::string>> HybridCactus::diarize(
    const std::variant<std::vector<double>, std::string> &audio,
    double responseBufferSize,
    const std::optional<std::string> &optionsJson) {
  return Promise<std::string>::async(
      [this, audio, responseBufferSize, optionsJson]() -> std::string {
        std::lock_guard<std::mutex> lock(this->_modelMutex);

        if (!this->_model) {
          throw std::runtime_error("Cactus model is not initialized");
        }

        std::string responseBuffer;
        responseBuffer.resize(responseBufferSize);

        int result;
        if (std::holds_alternative<std::string>(audio)) {
          result = cactus_diarize(
              this->_model, std::get<std::string>(audio).c_str(),
              responseBuffer.data(), responseBufferSize,
              optionsJson ? optionsJson->c_str() : nullptr, nullptr, 0);
        } else {
          const auto &audioDoubles = std::get<std::vector<double>>(audio);

          std::vector<uint8_t> audioBytes;
          audioBytes.reserve(audioDoubles.size());
          for (double d : audioDoubles) {
            d = std::clamp(d, 0.0, 255.0);
            audioBytes.emplace_back(static_cast<uint8_t>(d));
          }

          result = cactus_diarize(
              this->_model, nullptr,
              responseBuffer.data(), responseBufferSize,
              optionsJson ? optionsJson->c_str() : nullptr,
              audioBytes.data(), audioBytes.size());
        }

        if (result < 0) {
          throw std::runtime_error("Cactus diarize failed: " +
                                   std::string(cactus_get_last_error()));
        }

        responseBuffer.resize(strlen(responseBuffer.c_str()));
        return responseBuffer;
      });
}

std::shared_ptr<Promise<std::string>> HybridCactus::embedSpeaker(
    const std::variant<std::vector<double>, std::string> &audio,
    double responseBufferSize,
    const std::optional<std::string> &optionsJson,
    const std::optional<std::vector<double>> &maskWeights,
    std::optional<double> maskNumFrames) {
  return Promise<std::string>::async(
      [this, audio, responseBufferSize, optionsJson, maskWeights,
       maskNumFrames]() -> std::string {
        std::lock_guard<std::mutex> lock(this->_modelMutex);

        if (!this->_model) {
          throw std::runtime_error("Cactus model is not initialized");
        }

        std::string responseBuffer;
        responseBuffer.resize(responseBufferSize);

        const float *maskPtr = nullptr;
        size_t maskFrames = 0;
        std::vector<float> maskFloats;

        if (maskWeights.has_value() && !maskWeights->empty()) {
          maskFloats.reserve(maskWeights->size());
          for (double d : *maskWeights) {
            maskFloats.emplace_back(static_cast<float>(d));
          }
          maskPtr = maskFloats.data();
          maskFrames = maskNumFrames.has_value()
                           ? static_cast<size_t>(*maskNumFrames)
                           : maskFloats.size();
        }

        int result;
        if (std::holds_alternative<std::string>(audio)) {
          result = cactus_embed_speaker(
              this->_model, std::get<std::string>(audio).c_str(),
              responseBuffer.data(), responseBufferSize,
              optionsJson ? optionsJson->c_str() : nullptr, nullptr, 0,
              maskPtr, maskFrames);
        } else {
          const auto &audioDoubles = std::get<std::vector<double>>(audio);

          std::vector<uint8_t> audioBytes;
          audioBytes.reserve(audioDoubles.size());
          for (double d : audioDoubles) {
            d = std::clamp(d, 0.0, 255.0);
            audioBytes.emplace_back(static_cast<uint8_t>(d));
          }

          result = cactus_embed_speaker(
              this->_model, nullptr,
              responseBuffer.data(), responseBufferSize,
              optionsJson ? optionsJson->c_str() : nullptr,
              audioBytes.data(), audioBytes.size(),
              maskPtr, maskFrames);
        }

        if (result < 0) {
          throw std::runtime_error("Cactus embed speaker failed: " +
                                   std::string(cactus_get_last_error()));
        }

        responseBuffer.resize(strlen(responseBuffer.c_str()));
        return responseBuffer;
      });
}

std::shared_ptr<Promise<std::string>>
HybridCactus::ragQuery(const std::string &query, double responseBufferSize,
                       double topK) {
  return Promise<std::string>::async(
      [this, query, responseBufferSize, topK]() -> std::string {
        std::lock_guard<std::mutex> lock(this->_modelMutex);

        if (!this->_model) {
          throw std::runtime_error("Cactus model is not initialized");
        }

        std::string responseBuffer;
        responseBuffer.resize(responseBufferSize);

        int result = cactus_rag_query(
            this->_model, query.c_str(), responseBuffer.data(),
            responseBufferSize, static_cast<size_t>(topK));

        if (result < 0) {
          throw std::runtime_error("Cactus RAG query failed: " +
                                   std::string(cactus_get_last_error()));
        }

        responseBuffer.resize(strlen(responseBuffer.c_str()));
        return responseBuffer;
      });
}

std::shared_ptr<Promise<void>> HybridCactus::reset() {
  return Promise<void>::async([this]() -> void {
    std::lock_guard<std::mutex> lock(this->_modelMutex);

    if (!this->_model) {
      throw std::runtime_error("Cactus model is not initialized");
    }

    cactus_reset(this->_model);
  });
}

std::shared_ptr<Promise<void>> HybridCactus::stop() {
  return Promise<void>::async([this]() -> void { cactus_stop(this->_model); });
}

std::shared_ptr<Promise<void>> HybridCactus::destroy() {
  return Promise<void>::async([this]() -> void {
    std::lock_guard<std::mutex> lock(this->_modelMutex);

    if (!this->_model) {
      throw std::runtime_error("Cactus model is not initialized");
    }

    if (this->_streamTranscribe) {
      cactus_stream_transcribe_stop(this->_streamTranscribe, nullptr, 0);
      this->_streamTranscribe = nullptr;
    }

    cactus_destroy(this->_model);
    this->_model = nullptr;
  });
}

std::shared_ptr<Promise<void>>
HybridCactus::setTelemetryEnvironment(const std::string &cacheDir) {
  return Promise<void>::async([cacheDir]() -> void {
    cactus_set_telemetry_environment("react-native", cacheDir.c_str(), "1.13.1");
  });
}

} // namespace margelo::nitro::cactus
