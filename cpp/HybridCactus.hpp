#pragma once
#include "HybridCactusSpec.hpp"

#include "cactus_ffi.h"

#include <mutex>

namespace margelo::nitro::cactus {

class HybridCactus : public HybridCactusSpec {
public:
  HybridCactus();

  std::shared_ptr<Promise<void>>
  init(const std::string &modelPath, double contextSize,
       const std::optional<std::string> &corpusDir) override;

  std::shared_ptr<Promise<std::string>> complete(
      const std::string &messagesJson, double responseBufferSize,
      const std::optional<std::string> &optionsJson,
      const std::optional<std::string> &toolsJson,
      const std::optional<std::function<void(const std::string & /* token */,
                                             double /* tokenId */)>> &callback)
      override;

  std::shared_ptr<Promise<std::vector<double>>>
  embed(const std::string &text, double embeddingBufferSize) override;

  std::shared_ptr<Promise<void>> reset() override;

  std::shared_ptr<Promise<void>> stop() override;

  std::shared_ptr<Promise<void>> destroy() override;

private:
  cactus_model_t _model = nullptr;
  size_t _contextSize;

  std::mutex _modelMutex;
};

} // namespace margelo::nitro::cactus
