package com.margelo.nitro.cactus

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import androidx.core.graphics.createBitmap
import com.margelo.nitro.NitroModules
import com.margelo.nitro.core.Promise
import java.io.File
import java.io.FileOutputStream
import java.util.UUID

class HybridCactusImage : HybridCactusImageSpec() {
  private val context = NitroModules.applicationContext ?: error("Android context not found")

  override fun base64(path: String): Promise<String> =
    Promise.async {
      val file = File(path)

      if (!file.exists()) {
        throw Error("No such file: $path")
      }

      val imageData = file.readBytes()
      android.util.Base64.encodeToString(imageData, android.util.Base64.NO_WRAP)
    }

  override fun resize(
    path: String,
    height: Double,
    width: Double,
    quality: Double,
  ): Promise<String> =
    Promise.async {
      val file = File(path)

      if (!file.exists()) {
        throw Error("No such file: $path")
      }

      val bitmap = BitmapFactory.decodeFile(path)
      if (bitmap == null) {
        throw Error("Failed to load image from: $path")
      }
      val resizedBitmap = createBitmap(width.toInt(), height.toInt(), Bitmap.Config.RGB_565)
      val canvas = android.graphics.Canvas(resizedBitmap)
      val paint =
        android.graphics.Paint().apply {
          isFilterBitmap = true
          isAntiAlias = true
        }

      val scaleX = width.toFloat() / bitmap.width
      val scaleY = height.toFloat() / bitmap.height
      val matrix =
        android.graphics.Matrix().apply {
          setScale(scaleX, scaleY)
        }

      canvas.drawBitmap(bitmap, matrix, paint)
      bitmap.recycle()

      val cacheDir = context.cacheDir
      val outputDir = File(cacheDir, "cactus/images")
      outputDir.mkdirs()

      val fileName = "${UUID.randomUUID()}.jpg"
      val outputFile = File(outputDir, fileName)

      try {
        FileOutputStream(outputFile).use { outputStream ->
          val qualityInt = (quality * 100).toInt().coerceIn(0, 100)
          resizedBitmap.compress(Bitmap.CompressFormat.JPEG, qualityInt, outputStream)
        }
        resizedBitmap.recycle()
        outputFile.absolutePath
      } catch (e: Exception) {
        resizedBitmap.recycle()
        throw Error("Failed to save resized image: ${e.message}")
      }
    }
}
