#pragma once
#include "HybridCactusSpec.hpp"

#include "cactus_ffi.h"

#include <mutex>

namespace margelo::nitro::cactus {

class HybridCactus : public HybridCactusSpec {
public:
  HybridCactus();

  std::shared_ptr<Promise<void>>
  init(const std::string &modelPath,
       const std::optional<std::string> &corpusDir,
       bool cacheIndex) override;

  std::shared_ptr<Promise<std::string>> complete(
      const std::string &messagesJson, double responseBufferSize,
      const std::optional<std::string> &optionsJson,
      const std::optional<std::string> &toolsJson,
      const std::optional<std::function<void(const std::string & /* token */,
                                             double /* tokenId */)>> &callback)
      override;

  std::shared_ptr<Promise<std::vector<double>>>
  tokenize(const std::string &text) override;

  std::shared_ptr<Promise<std::string>>
  scoreWindow(const std::vector<double> &tokens, double start, double end,
              double context) override;

  std::shared_ptr<Promise<std::string>> transcribe(
      const std::variant<std::vector<double>, std::string> &audio,
      const std::string &prompt, double responseBufferSize,
      const std::optional<std::string> &optionsJson,
      const std::optional<std::function<void(const std::string & /* token */,
                                             double /* tokenId */)>> &callback)
      override;

  std::shared_ptr<Promise<void>>
  streamTranscribeStart(const std::optional<std::string> &optionsJson) override;

  std::shared_ptr<Promise<std::string>>
  streamTranscribeProcess(const std::vector<double> &audio) override;

  std::shared_ptr<Promise<std::string>> streamTranscribeStop() override;

  std::shared_ptr<Promise<std::string>>
  vad(const std::variant<std::vector<double>, std::string> &audio,
      double responseBufferSize,
      const std::optional<std::string> &optionsJson) override;

  std::shared_ptr<Promise<std::vector<double>>>
  embed(const std::string &text, double embeddingBufferSize,
        bool normalize) override;

  std::shared_ptr<Promise<std::vector<double>>>
  imageEmbed(const std::string &imagePath, double embeddingBufferSize) override;

  std::shared_ptr<Promise<std::vector<double>>>
  audioEmbed(const std::string &audioPath, double embeddingBufferSize) override;

  std::shared_ptr<Promise<void>> reset() override;

  std::shared_ptr<Promise<void>> stop() override;

  std::shared_ptr<Promise<void>> destroy() override;

  std::shared_ptr<Promise<void>>
  setTelemetryEnvironment(const std::string &cacheDir) override;

private:
  cactus_model_t _model = nullptr;
  cactus_stream_transcribe_t _streamTranscribe = nullptr;

  std::mutex _modelMutex;
};

} // namespace margelo::nitro::cactus
