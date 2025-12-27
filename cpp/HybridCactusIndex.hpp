#pragma once
#include "HybridCactusIndexSpec.hpp"

#include "cactus_ffi.h"

#include <mutex>

namespace margelo::nitro::cactus {

class HybridCactusIndex : public HybridCactusIndexSpec {
public:
  HybridCactusIndex();

  std::shared_ptr<Promise<void>> init(const std::string &indexPath,
                                      double embeddingDim) override;

  std::shared_ptr<Promise<void>>
  add(const std::vector<double> &ids, const std::vector<std::string> &documents,
      const std::vector<std::vector<double>> &embeddings,
      const std::optional<std::vector<std::string>> &metadatas) override;

  std::shared_ptr<Promise<void>>
  _delete(const std::vector<double> &ids) override;

  std::shared_ptr<Promise<CactusIndexGetResult>>
  get(const std::vector<double> &ids) override;

  std::shared_ptr<Promise<CactusIndexQueryResult>>
  query(const std::vector<std::vector<double>> &embeddings,
        const std::optional<std::string> &optionsJson) override;

  std::shared_ptr<Promise<void>> compact() override;

  std::shared_ptr<Promise<void>> destroy() override;

private:
  cactus_index_t _index = nullptr;
  size_t _embeddingDim;

  std::mutex _indexMutex;
};

} // namespace margelo::nitro::cactus
