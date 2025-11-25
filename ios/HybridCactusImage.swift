import Foundation
import NitroModules
import UIKit

class HybridCactusImage: HybridCactusImageSpec {
  func base64(path: String) throws -> Promise<String> {
    return Promise.async {
      let fileURL = URL(fileURLWithPath: path)
      
      if !FileManager.default.fileExists(atPath: fileURL.path) {
        throw RuntimeError.error(withMessage: "No such file: \(path)")
      }
      
      let imageData = try Data(contentsOf: fileURL)
      return imageData.base64EncodedString()
    }
  }
  
  func resize(path: String, height: Double, width: Double, quality: Double) throws -> Promise<String> {
    return Promise.async {
      let fileURL = URL(fileURLWithPath: path)
      
      if !FileManager.default.fileExists(atPath: fileURL.path) {
        throw RuntimeError.error(withMessage: "No such file: \(path)")
      }
      
      guard let imageData = try? Data(contentsOf: fileURL),
            let image = UIImage(data: imageData) else {
        throw RuntimeError.error(withMessage: "Failed to load image from: \(path)")
      }
      
      let targetSize = CGSize(width: CGFloat(width), height: CGFloat(height))
      let renderer = UIGraphicsImageRenderer(size: targetSize)
      let resizedImage = renderer.image { context in
        image.draw(in: CGRect(origin: .zero, size: targetSize))
      }
      
      guard let jpegData = resizedImage.jpegData(compressionQuality: CGFloat(quality)) else {
        throw RuntimeError.error(withMessage: "Failed to compress resized image")
      }
      
      let cacheDir = FileManager.default.urls(for: .cachesDirectory, in: .userDomainMask)[0]
      let fileName = "\(UUID().uuidString).jpg"
      let outputURL = cacheDir.appendingPathComponent("cactus/images", isDirectory: true)
        .appendingPathComponent(fileName)
      
      try FileManager.default.createDirectory(at: outputURL.deletingLastPathComponent(), withIntermediateDirectories: true)
      try jpegData.write(to: outputURL)
      
      return outputURL.path
    }
  }
}
