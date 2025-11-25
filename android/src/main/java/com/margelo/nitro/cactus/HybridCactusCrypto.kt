package com.margelo.nitro.cactus

import com.margelo.nitro.core.Promise
import java.nio.ByteBuffer
import java.security.MessageDigest
import java.util.Locale
import java.util.UUID

class HybridCactusCrypto : HybridCactusCryptoSpec() {
  override fun uuidv5(
    namespaceUuid: String,
    name: String,
  ): Promise<String> =
    Promise.async {
      val nsUuid =
        try {
          UUID.fromString(namespaceUuid)
        } catch (e: IllegalArgumentException) {
          throw IllegalArgumentException("Invalid namespace UUID")
        }

      val nsBytes =
        ByteBuffer
          .allocate(16)
          .apply {
            putLong(nsUuid.mostSignificantBits)
            putLong(nsUuid.leastSignificantBits)
          }.array()
      val nameBytes = name.toByteArray(Charsets.UTF_8)

      val sha1 =
        MessageDigest
          .getInstance("SHA-1")
          .apply { update(nsBytes) }
          .digest(nameBytes)
      val uuidBytes = sha1.copyOfRange(0, 16)
      uuidBytes[6] = (uuidBytes[6].toInt() and 0x0F or 0x50).toByte()
      uuidBytes[8] = (uuidBytes[8].toInt() and 0x3F or 0x80).toByte()

      val bb = ByteBuffer.wrap(uuidBytes)

      val uuid = UUID(bb.long, bb.long)

      uuid.toString().lowercase(Locale.ROOT)
    }
}
