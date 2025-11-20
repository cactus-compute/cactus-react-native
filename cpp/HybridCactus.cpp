#include "HybridCactus.hpp"

namespace margelo::nitro::cactus {
HybridCactus::HybridCactus() : HybridObject(TAG) {}

std::shared_ptr<Promise<void>>
HybridCactus::init(const std::string &modelPath, double contextSize,
                   const std::optional<std::string> &corpusDir) {
  return Promise<void>::async(
      [this, modelPath, contextSize, corpusDir]() -> void {
        std::lock_guard<std::mutex> lock(this->_modelMutex);

        if (this->_model) {
          throw std::runtime_error("Cactus model is already initialized");
        }

        const cactus_model_t model =
            cactus_init(modelPath.c_str(), contextSize,
                        corpusDir ? corpusDir->c_str() : nullptr);

        if (!model) {
          throw std::runtime_error("Failed to initialize Cactus model");
        }

        this->_model = model;
        this->_contextSize = contextSize;
      });
}

std::shared_ptr<Promise<std::string>> HybridCactus::complete(
    const std::string &messagesJson, double responseBufferSize,
    const std::optional<std::string> &optionsJson,
    const std::optional<std::string> &toolsJson,
    const std::optional<std::function<void(const std::string & /* token */,
                                           double /* tokenId */)>> &callback) {
  return Promise<std::string>::async([this, messagesJson, optionsJson,
                                      toolsJson, callback,
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

    int result = cactus_complete(this->_model, messagesJson.c_str(),
                                 responseBuffer.data(), responseBufferSize,
                                 optionsJson ? optionsJson->c_str() : nullptr,
                                 toolsJson ? toolsJson->c_str() : nullptr,
                                 cactusTokenCallback, &callbackCtx);

    if (result < 0) {
      throw std::runtime_error("Cactus completion failed");
    }

    // Remove null terminator
    responseBuffer.resize(strlen(responseBuffer.c_str()));

    return responseBuffer;
  });
}

std::shared_ptr<Promise<std::vector<double>>>
HybridCactus::embed(const std::string &text, double embeddingBufferSize) {
  return Promise<std::vector<double>>::async(
      [this, text, embeddingBufferSize]() -> std::vector<double> {
        std::lock_guard<std::mutex> lock(this->_modelMutex);

        if (!this->_model) {
          throw std::runtime_error("Cactus model is not initialized");
        }

        std::vector<float> embeddingBuffer(embeddingBufferSize);
        size_t embeddingDim;

        int result =
            cactus_embed(this->_model, text.c_str(), embeddingBuffer.data(),
                         embeddingBufferSize * sizeof(float), &embeddingDim);

        if (result < 0) {
          throw std::runtime_error("Cactus embedding failed");
        }

        embeddingBuffer.resize(embeddingDim);

        return std::vector<double>(embeddingBuffer.begin(),
                                   embeddingBuffer.end());
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

    cactus_destroy(this->_model);
    this->_model = nullptr;
  });
}

} // namespace margelo::nitro::cactus
