#pragma once
#include "HybridCactusUtilSpec.hpp"

#include "cactus_util.h"

#include <mutex>

namespace margelo::nitro::cactus {

class HybridCactusUtil : public HybridCactusUtilSpec {
public:
  HybridCactusUtil();

  std::shared_ptr<Promise<std::string>>
  registerApp(const std::string &encryptedData) override;

  std::shared_ptr<Promise<std::optional<std::string>>> getDeviceId() override;

  std::shared_ptr<Promise<void>>
  setAndroidDataDirectory(const std::string &dataDir) override;

private:
  std::mutex _mutex;
};

} // namespace margelo::nitro::cactus
