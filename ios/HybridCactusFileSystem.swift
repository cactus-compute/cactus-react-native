import Foundation
import NitroModules
import ZIPFoundation

class HybridCactusFileSystem: HybridCactusFileSystemSpec {
  func getCactusDirectory() throws -> Promise<String> {
    return Promise.async { try self.cactusURL().path }
  }
  
  func fileExists(path: String) throws -> Promise<Bool> {
    return Promise.async {
      let cactusURL = try self.cactusURL()
      let fileURL = cactusURL.appendingPathComponent(path)
      return FileManager.default.fileExists(atPath: fileURL.path)
    }
  }
  
  func writeFile(path: String, content: String) throws -> Promise<Void> {
    return Promise.async {
      let cactusURL = try self.cactusURL()
      let fileURL = cactusURL.appendingPathComponent(path)
      let directoryURL = fileURL.deletingLastPathComponent()

      if !FileManager.default.fileExists(atPath: directoryURL.path) {
        try FileManager.default.createDirectory(at: directoryURL, withIntermediateDirectories: true)
      }

      try content.write(to: fileURL, atomically: true, encoding: .utf8)
    }
  }
  
  func readFile(path: String) throws -> Promise<String> {
    return Promise.async {
      let cactusURL = try self.cactusURL()
      let fileURL = cactusURL.appendingPathComponent(path)

      if !FileManager.default.fileExists(atPath: fileURL.path) {
        throw RuntimeError.error(withMessage: "No such file: \(path)")
      }

      return try String(contentsOf: fileURL, encoding: .utf8)
    }
  }
  
  func deleteFile(path: String) throws -> Promise<Void> {
    return Promise.async {
      let cactusURL = try self.cactusURL()
      let fileURL = cactusURL.appendingPathComponent(path)

      if !FileManager.default.fileExists(atPath: fileURL.path) {
        throw RuntimeError.error(withMessage: "No such file: \(path)")
      }

      try FileManager.default.removeItem(at: fileURL)
    }
  }
  
  func modelExists(model: String) throws -> Promise<Bool> {
    return Promise.async {
      let modelURL = try self.modelURL(model: model)
      return FileManager.default.fileExists(atPath: modelURL.path)
    }
  }
  
  func getModelPath(model: String) throws -> Promise<String> {
    return Promise.async { try self.modelURL(model: model).path }
  }
  
  func downloadModel(model: String, from: String, callback: ((_ progress: Double) -> Void)?) throws
  -> Promise<Void>
  {
    return Promise.async {
      let modelURL = try self.modelURL(model: model)

      if FileManager.default.fileExists(atPath: modelURL.path) {
        DispatchQueue.main.async { callback?(1.0) }
        return
      }

      guard let url = URL(string: from) else {
        throw RuntimeError.error(withMessage: "Invalid URL")
      }

      var lastPct: Double = -1
      let delegate = DownloadProgressDelegate { p in
        DispatchQueue.main.async {
          let pct = floor(min(max(0, p), 1) * 99) / 100
          if pct - lastPct >= 0.01 {
            callback?(pct)
            lastPct = pct
          }
        }
      }

      let session = URLSession(configuration: .default, delegate: delegate, delegateQueue: nil)
      let task = session.downloadTask(with: url)
      self.activeTask = task
      callback?(0.0)

      let (fileURL, response) = try await delegate.awaitCompletion(for: task)
      
      self.activeTask = nil

      guard let httpResponse = response as? HTTPURLResponse,
            (200...299).contains(httpResponse.statusCode)
      else {
        let statusCode = (response as? HTTPURLResponse)?.statusCode ?? -1
        throw RuntimeError.error(
          withMessage: "Download failed with HTTP status code: \(statusCode)")
      }

      do {
        try FileManager.default.createDirectory(at: modelURL, withIntermediateDirectories: true)
        try FileManager.default.unzipItem(at: fileURL, to: modelURL)
        try? FileManager.default.removeItem(at: fileURL)

        DispatchQueue.main.async { callback?(1.0) }
      } catch {
        try? FileManager.default.removeItem(at: modelURL)
        try? FileManager.default.removeItem(at: fileURL)

        throw RuntimeError.error(withMessage: "Failed to download and unzip model: \(error)")
      }
    }
  }

  private var activeTask: URLSessionDownloadTask?

  func stopDownload(model: String) throws -> Promise<Void> {
    return Promise.async {
      if let task = self.activeTask {
        task.cancel()
        self.activeTask = nil
      }
    }
  }
  
  func deleteModel(model: String) throws -> Promise<Void> {
    return Promise.async {
      let modelURL = try self.modelURL(model: model)

      if !FileManager.default.fileExists(atPath: modelURL.path) {
        throw RuntimeError.error(withMessage: "No such model: \(model)")
      }

      try FileManager.default.removeItem(at: modelURL)
    }
  }
  
  private func cactusURL() throws -> URL {
    let documentsURL = try FileManager.default.url(
      for: .documentDirectory,
      in: .userDomainMask,
      appropriateFor: nil,
      create: false)
    var cactusURL = documentsURL.appendingPathComponent("cactus", isDirectory: true)

    if !FileManager.default.fileExists(atPath: cactusURL.path) {
      try FileManager.default.createDirectory(at: cactusURL, withIntermediateDirectories: true)

      var resourceValues = URLResourceValues()
      resourceValues.isExcludedFromBackup = true
      try cactusURL.setResourceValues(resourceValues)
    }

    return cactusURL
  }
  
  private func modelURL(model: String) throws -> URL {
    let cactusURL = try self.cactusURL()
    return cactusURL.appendingPathComponent("models/\(model)")
  }
}

private class DownloadProgressDelegate: NSObject, URLSessionDownloadDelegate, URLSessionTaskDelegate
{
  private let progressHandler: (Double) -> Void
  private var continuation: CheckedContinuation<(URL, URLResponse), Error>?
  private var fileURL: URL?
  private var response: URLResponse?
  
  init(progressHandler: @escaping (Double) -> Void) {
    self.progressHandler = progressHandler
  }
  
  func awaitCompletion(for task: URLSessionDownloadTask) async throws -> (URL, URLResponse) {
    return try await withCheckedThrowingContinuation {
      (cont: CheckedContinuation<(URL, URLResponse), Error>) in
      self.continuation = cont
      task.resume()
    }
  }
  
  func urlSession(
    _ session: URLSession,
    downloadTask: URLSessionDownloadTask,
    didWriteData bytesWritten: Int64,
    totalBytesWritten: Int64,
    totalBytesExpectedToWrite: Int64
  ) {
    guard totalBytesExpectedToWrite > 0 else { return }
    progressHandler(Double(totalBytesWritten) / Double(totalBytesExpectedToWrite))
  }
  
  func urlSession(
    _ session: URLSession,
    downloadTask: URLSessionDownloadTask,
    didFinishDownloadingTo location: URL
  ) {
    do {
      let caches = try FileManager.default.url(
        for: .cachesDirectory,
        in: .userDomainMask,
        appropriateFor: nil,
        create: false
      )

      let destDir = caches.appendingPathComponent("cactus/models", isDirectory: true)
      try FileManager.default.createDirectory(at: destDir, withIntermediateDirectories: true)

      let dest = destDir.appendingPathComponent(UUID().uuidString).appendingPathExtension("zip")
      try FileManager.default.moveItem(at: location, to: dest)

      self.fileURL = dest
    } catch {
      self.fileURL = nil
    }
  }
  
  func urlSession(
    _ session: URLSession,
    task: URLSessionTask,
    didCompleteWithError error: Error?
  ) {
    guard let cont = self.continuation else { return }
    self.continuation = nil

    if let error = error {
      cont.resume(throwing: error)
    } else if let url = self.fileURL, let resp = self.response ?? task.response {
      cont.resume(returning: (url, resp))
    } else {
      cont.resume(throwing: URLError(.unknown))
    }
  }
}
