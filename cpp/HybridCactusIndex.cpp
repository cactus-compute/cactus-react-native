#include "HybridCactusIndex.hpp"

namespace margelo::nitro::cactus {

HybridCactusIndex::HybridCactusIndex() : HybridObject(TAG) {}

std::shared_ptr<Promise<void>>
HybridCactusIndex::init(const std::string &indexPath, double embeddingDim) {
  return Promise<void>::async([this, indexPath, embeddingDim]() -> void {
    std::lock_guard<std::mutex> lock(this->_indexMutex);

    if (this->_index) {
      throw std::runtime_error("Cactus index is already initialized");
    }

    const cactus_index_t index =
        cactus_index_init(indexPath.c_str(), embeddingDim);

    if (!index) {
      throw std::runtime_error("Cactus index init failed: " +
                               std::string(cactus_get_last_error()));
    }

    this->_index = index;
    this->_embeddingDim = static_cast<size_t>(embeddingDim);
  });
}

std::shared_ptr<Promise<void>> HybridCactusIndex::add(
    const std::vector<double> &ids, const std::vector<std::string> &documents,
    const std::vector<std::vector<double>> &embeddings,
    const std::optional<std::vector<std::string>> &metadatas) {
  return Promise<void>::async([this, ids, documents, embeddings,
                               metadatas]() -> void {
    std::lock_guard<std::mutex> lock(this->_indexMutex);

    if (!this->_index) {
      throw std::runtime_error("Cactus index is not initialized");
    }

    const size_t count = ids.size();
    if (documents.size() != count || embeddings.size() != count) {
      throw std::runtime_error(
          "ids, documents, and embeddings must have the same length");
    }

    if (metadatas.has_value() && metadatas->size() != count) {
      throw std::runtime_error(
          "metadatas must have the same length as other vectors");
    }

    std::vector<int> intIds;
    intIds.reserve(count);
    for (size_t i = 0; i < count; ++i) {
      intIds.emplace_back(static_cast<int>(ids[i]));
    }

    std::vector<const char *> documentPtrs;
    documentPtrs.reserve(count);
    for (size_t i = 0; i < count; ++i) {
      documentPtrs.emplace_back(documents[i].c_str());
    }

    std::vector<std::vector<float>> embeddingsFloat(count);
    std::vector<const float *> embeddingPtrs;
    embeddingPtrs.reserve(count);
    for (size_t i = 0; i < count; ++i) {
      embeddingsFloat[i].resize(embeddings[i].size());
      for (size_t j = 0; j < embeddings[i].size(); ++j) {
        embeddingsFloat[i][j] = static_cast<float>(embeddings[i][j]);
      }
      embeddingPtrs.emplace_back(embeddingsFloat[i].data());
    }

    int result;
    if (metadatas.has_value()) {
      std::vector<const char *> metadataPtrs;
      metadataPtrs.reserve(count);
      for (size_t i = 0; i < count; ++i) {
        metadataPtrs.emplace_back((*metadatas)[i].c_str());
      }
      result = cactus_index_add(
          this->_index, intIds.data(), documentPtrs.data(), metadataPtrs.data(),
          embeddingPtrs.data(), count, this->_embeddingDim);
    } else {
      result = cactus_index_add(
          this->_index, intIds.data(), documentPtrs.data(), nullptr,
          embeddingPtrs.data(), count, this->_embeddingDim);
    }

    if (result < 0) {
      throw std::runtime_error("Cactus index add failed: " +
                               std::string(cactus_get_last_error()));
    }
  });
}

std::shared_ptr<Promise<void>>
HybridCactusIndex::_delete(const std::vector<double> &ids) {
  return Promise<void>::async([this, ids]() -> void {
    std::lock_guard<std::mutex> lock(this->_indexMutex);

    if (!this->_index) {
      throw std::runtime_error("Cactus index is not initialized");
    }

    std::vector<int> intIds;
    intIds.reserve(ids.size());
    for (size_t i = 0; i < ids.size(); ++i) {
      intIds.emplace_back(static_cast<int>(ids[i]));
    }

    int result = cactus_index_delete(this->_index, intIds.data(), ids.size());

    if (result < 0) {
      throw std::runtime_error("Cactus index delete failed: " +
                               std::string(cactus_get_last_error()));
    }
  });
}

std::shared_ptr<Promise<CactusIndexGetResult>>
HybridCactusIndex::get(const std::vector<double> &ids) {
  return Promise<CactusIndexGetResult>::async([this,
                                               ids]() -> CactusIndexGetResult {
    std::lock_guard<std::mutex> lock(this->_indexMutex);

    if (!this->_index) {
      throw std::runtime_error("Cactus index is not initialized");
    }

    const size_t count = ids.size();

    std::vector<int> intIds;
    intIds.reserve(count);
    for (size_t i = 0; i < count; ++i) {
      intIds.emplace_back(static_cast<int>(ids[i]));
    }

    std::vector<std::unique_ptr<char[]>> documentBuffers;
    documentBuffers.reserve(count);
    std::vector<std::unique_ptr<char[]>> metadataBuffers;
    metadataBuffers.reserve(count);
    std::vector<std::unique_ptr<float[]>> embeddingBuffers;
    embeddingBuffers.reserve(count);

    const size_t maxStringSize = 65535;
    std::vector<size_t> documentBufferSizes(count, maxStringSize);
    std::vector<size_t> metadataBufferSizes(count, maxStringSize);
    std::vector<size_t> embeddingBufferSizes(count, this->_embeddingDim);

    std::vector<char *> documentPtrs;
    documentPtrs.reserve(count);
    std::vector<char *> metadataPtrs;
    metadataPtrs.reserve(count);
    std::vector<float *> embeddingPtrs;
    embeddingPtrs.reserve(count);

    for (size_t i = 0; i < count; ++i) {
      documentBuffers.emplace_back(std::make_unique<char[]>(maxStringSize));
      documentPtrs.emplace_back(documentBuffers[i].get());

      metadataBuffers.emplace_back(std::make_unique<char[]>(maxStringSize));
      metadataPtrs.emplace_back(metadataBuffers[i].get());

      embeddingBuffers.emplace_back(
          std::make_unique<float[]>(this->_embeddingDim));
      embeddingPtrs.emplace_back(embeddingBuffers[i].get());
    }

    int result =
        cactus_index_get(this->_index, intIds.data(), count,
                         documentPtrs.data(), documentBufferSizes.data(),
                         metadataPtrs.data(), metadataBufferSizes.data(),
                         embeddingPtrs.data(), embeddingBufferSizes.data());

    if (result < 0) {
      throw std::runtime_error("Cactus index get failed: " +
                               std::string(cactus_get_last_error()));
    }

    CactusIndexGetResult resultObj;
    resultObj.documents.reserve(count);
    resultObj.metadatas.reserve(count);
    resultObj.embeddings = std::vector<std::vector<double>>(count);

    for (size_t i = 0; i < count; ++i) {
      resultObj.documents.emplace_back(std::string(documentBuffers[i].get()));
      resultObj.metadatas.emplace_back(std::string(metadataBuffers[i].get()));

      resultObj.embeddings[i].reserve(this->_embeddingDim);
      for (size_t j = 0; j < this->_embeddingDim; ++j) {
        resultObj.embeddings[i].emplace_back(
            static_cast<double>(embeddingBuffers[i].get()[j]));
      }
    }

    return resultObj;
  });
}

std::shared_ptr<Promise<CactusIndexQueryResult>>
HybridCactusIndex::query(const std::vector<std::vector<double>> &embeddings,
                         const std::optional<std::string> &optionsJson) {
  return Promise<CactusIndexQueryResult>::async(
      [this, embeddings, optionsJson]() -> CactusIndexQueryResult {
        std::lock_guard<std::mutex> lock(this->_indexMutex);

        if (!this->_index) {
          throw std::runtime_error("Cactus index is not initialized");
        }

        const size_t count = embeddings.size();

        std::vector<std::vector<float>> embeddingsFloat(count);
        std::vector<const float *> embeddingPtrs;
        embeddingPtrs.reserve(count);
        for (size_t i = 0; i < count; ++i) {
          embeddingsFloat[i].resize(embeddings[i].size());
          for (size_t j = 0; j < embeddings[i].size(); ++j) {
            embeddingsFloat[i][j] = static_cast<float>(embeddings[i][j]);
          }
          embeddingPtrs.emplace_back(embeddingsFloat[i].data());
        }

        size_t maxResults = 10;
        if (optionsJson.has_value()) {
          const std::string &json = *optionsJson;
          size_t pos = json.find("\"top_k\"");
          if (pos != std::string::npos) {
            size_t colonPos = json.find(':', pos);
            if (colonPos != std::string::npos) {
              size_t numStart = json.find_first_of("0123456789", colonPos);
              if (numStart != std::string::npos) {
                size_t numEnd = json.find_first_not_of("0123456789", numStart);
                std::string numStr = json.substr(numStart, numEnd - numStart);
                maxResults = std::stoul(numStr);
              }
            }
          }
        }

        std::vector<size_t> idBufferSizes(count, maxResults);
        std::vector<size_t> scoreBufferSizes(count, maxResults);

        std::vector<std::unique_ptr<int[]>> idBuffers;
        idBuffers.reserve(count);
        std::vector<std::unique_ptr<float[]>> scoreBuffers;
        scoreBuffers.reserve(count);

        std::vector<int *> idPtrs;
        idPtrs.reserve(count);
        std::vector<float *> scorePtrs;
        scorePtrs.reserve(count);

        for (size_t i = 0; i < count; ++i) {
          idBuffers.emplace_back(std::make_unique<int[]>(maxResults));
          idPtrs.emplace_back(idBuffers[i].get());

          scoreBuffers.emplace_back(std::make_unique<float[]>(maxResults));
          scorePtrs.emplace_back(scoreBuffers[i].get());
        }

        int result = cactus_index_query(
            this->_index, embeddingPtrs.data(), count, this->_embeddingDim,
            optionsJson ? optionsJson->c_str() : nullptr, idPtrs.data(),
            idBufferSizes.data(), scorePtrs.data(), scoreBufferSizes.data());

        if (result < 0) {
          throw std::runtime_error("Cactus index query failed: " +
                                   std::string(cactus_get_last_error()));
        }

        CactusIndexQueryResult resultObj;
        resultObj.ids = std::vector<std::vector<double>>(count);
        resultObj.scores = std::vector<std::vector<double>>(count);

        for (size_t i = 0; i < count; ++i) {
          const size_t resultCount = idBufferSizes[i];
          resultObj.ids[i].reserve(resultCount);
          resultObj.scores[i].reserve(resultCount);

          for (size_t j = 0; j < resultCount; ++j) {
            resultObj.ids[i].emplace_back(
                static_cast<double>(idBuffers[i].get()[j]));
            resultObj.scores[i].emplace_back(
                static_cast<double>(scoreBuffers[i].get()[j]));
          }
        }

        return resultObj;
      });
}

std::shared_ptr<Promise<void>> HybridCactusIndex::compact() {
  return Promise<void>::async([this]() -> void {
    std::lock_guard<std::mutex> lock(this->_indexMutex);

    if (!this->_index) {
      throw std::runtime_error("Cactus index is not initialized");
    }

    int result = cactus_index_compact(this->_index);

    if (result < 0) {
      throw std::runtime_error("Cactus index compact failed: " +
                               std::string(cactus_get_last_error()));
    }
  });
}

std::shared_ptr<Promise<void>> HybridCactusIndex::destroy() {
  return Promise<void>::async([this]() -> void {
    std::lock_guard<std::mutex> lock(this->_indexMutex);

    if (!this->_index) {
      throw std::runtime_error("Cactus index is not initialized");
    }

    cactus_index_destroy(this->_index);
    this->_index = nullptr;
  });
}

} // namespace margelo::nitro::cactus
