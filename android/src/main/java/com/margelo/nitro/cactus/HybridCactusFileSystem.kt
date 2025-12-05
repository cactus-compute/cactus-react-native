package com.margelo.nitro.cactus

import com.margelo.nitro.NitroModules
import com.margelo.nitro.core.Promise
import java.io.BufferedInputStream
import java.io.BufferedOutputStream
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import java.net.HttpURLConnection
import java.net.URL
import java.util.zip.ZipEntry
import java.util.zip.ZipInputStream
import kotlin.math.floor

class HybridCactusFileSystem : HybridCactusFileSystemSpec() {
  private val context = NitroModules.applicationContext ?: error("Android context not found")

  override fun getCactusDirectory(): Promise<String> = Promise.async { cactusFile().absolutePath }

  override fun fileExists(path: String): Promise<Boolean> =
    Promise.async {
      val cactusDir = cactusFile()
      val file = File(cactusDir, path)
      file.exists()
    }

  override fun writeFile(
    path: String,
    content: String,
  ): Promise<Unit> =
    Promise.async {
      val cactusDir = cactusFile()
      val file = File(cactusDir, path)
      file.parentFile?.mkdirs()
      file.writeText(content)
    }

  override fun readFile(path: String): Promise<String> =
    Promise.async {
      val cactusDir = cactusFile()
      val file = File(cactusDir, path)

      if (!file.exists()) {
        throw Error("No such file: $path")
      }

      file.readText()
    }

  override fun deleteFile(path: String): Promise<Unit> =
    Promise.async {
      val cactusDir = cactusFile()
      val file = File(cactusDir, path)

      if (!file.exists()) {
        throw Error("No such file: $path")
      }

      file.deleteRecursively()
    }

  override fun modelExists(model: String): Promise<Boolean> = Promise.async { modelFile(model).exists() }

  override fun getModelPath(model: String): Promise<String> = Promise.async { modelFile(model).absolutePath }

  override fun downloadModel(
    model: String,
    from: String,
    callback: ((progress: Double) -> Unit)?,
  ): Promise<Unit> {
    return Promise.async {
      val modelFile = modelFile(model)

      if (modelFile.exists()) {
        callback?.invoke(1.0)
        return@async
      }

      val url =
        try {
          URL(from)
        } catch (_: Throwable) {
          throw Error("Invalid URL")
        }

      val tmpZip = File.createTempFile("dl_", ".zip", context.cacheDir)
      var connection: HttpURLConnection? = null

      try {
        connection =
          (url.openConnection() as HttpURLConnection).apply {
            connectTimeout = 30_000
            readTimeout = 5 * 60_000
            instanceFollowRedirects = true
          }
        connection.connect()
        val code = connection.responseCode

        if (code !in 200..299) {
          connection.disconnect()
          throw Error("Download failed with HTTP status code: $code")
        }

        val contentLength = connection.getHeaderFieldLong("Content-Length", -1L)
        var downloaded = 0L
        var lastPct = -1.0

        callback?.invoke(0.0)

        connection.inputStream.use { input ->
          BufferedInputStream(input).use { bis ->
            FileOutputStream(tmpZip).use { fos ->
              BufferedOutputStream(fos).use { bos ->
                val buf = ByteArray(256 * 1024)

                while (true) {
                  val read = bis.read(buf)

                  if (read == -1) {
                    break
                  }

                  bos.write(buf, 0, read)
                  downloaded += read

                  if (contentLength > 0) {
                    // cap at 0.99; 1.0 will be sent after unzip
                    val pct =
                      floor(
                        (downloaded.toDouble() / contentLength.toDouble()).coerceIn(
                          0.0,
                          1.0,
                        ) * 99,
                      ) / 100.0

                    if (pct - lastPct >= 0.01) {
                      callback?.invoke(pct)
                      lastPct = pct
                    }
                  }
                }
              }
            }
          }
        }

        modelFile.mkdirs()
        unzipItem(tmpZip, modelFile)

        callback?.invoke(1.0)
      } catch (t: Throwable) {
        modelFile.deleteRecursively()
        throw Error("Failed to download and unzip model: ${t.message}")
      } finally {
        tmpZip.delete()
        connection?.disconnect()
      }
    }
  }

  private fun unzipItem(
    zipFile: File,
    outDir: File,
  ) {
    val outRoot = outDir.canonicalFile
    ZipInputStream(BufferedInputStream(FileInputStream(zipFile))).use { zis ->
      var entry: ZipEntry? = zis.nextEntry
      val buffer = ByteArray(256 * 1024)

      while (entry != null) {
        val outPath = File(outDir, entry.name)

        // ZIP Slip protection
        val canonical = outPath.canonicalFile
        if (!canonical.path.startsWith(outRoot.path + File.separator)) {
          throw SecurityException("Blocked zip entry outside target dir: ${entry.name}")
        }

        if (entry.isDirectory) {
          canonical.mkdirs()
        } else {
          canonical.parentFile?.mkdirs()
          FileOutputStream(canonical).use { fos ->
            BufferedOutputStream(fos).use { bos ->
              while (true) {
                val read = zis.read(buffer)
                if (read == -1) break
                bos.write(buffer, 0, read)
              }
            }
          }
        }

        zis.closeEntry()
        entry = zis.nextEntry
      }
    }
  }

  override fun deleteModel(model: String): Promise<Unit> =
    Promise.async {
      val modelFile = modelFile(model)

      if (!modelFile.exists()) {
        throw Error("No such model: $model")
      }

      modelFile.deleteRecursively()
    }

  private fun cactusFile(): File {
    val cactusDir = File(context.filesDir, "cactus")

    if (!cactusDir.exists()) {
      cactusDir.mkdirs()
    }

    return cactusDir
  }

  private fun modelFile(model: String): File {
    val cactusDir = cactusFile()
    return File(cactusDir, "models/$model")
  }
}
