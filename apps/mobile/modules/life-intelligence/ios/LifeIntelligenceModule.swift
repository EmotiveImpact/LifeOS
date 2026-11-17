import ExpoModulesCore
import AVFoundation
import Speech
import Vision
import PDFKit
#if canImport(FoundationModels)
import FoundationModels
#endif

public final class LifeIntelligenceModule: Module {
  private var speech: LocalSpeech?
  public func definition() -> ModuleDefinition {
    Name("LifeIntelligence")
    Events("transcript")
    AsyncFunction("available") { () async -> Bool in
      #if canImport(FoundationModels)
      if #available(iOS 26.0, *) { return SystemLanguageModel.default.isAvailable }
      #endif
      return false
    }
    AsyncFunction("generate") { (prompt: String) async throws -> String in
      guard prompt.utf8.count <= 24000 else { throw LocalError("This request is too large for the on-device model.") }
      return try await generateLocally(prompt)
    }
    AsyncFunction("speechAvailable") { () -> Bool in
      guard let recogniser = SFSpeechRecognizer(locale: Locale(identifier: "en-GB")) else { return false }
      return recogniser.isAvailable && recogniser.supportsOnDeviceRecognition
    }
    AsyncFunction("requestSpeechPermission") { () async -> Bool in
      let status = await withCheckedContinuation { continuation in
        SFSpeechRecognizer.requestAuthorization { continuation.resume(returning: $0) }
      }
      return status == .authorized
    }
    AsyncFunction("start") { () async throws in
      guard SFSpeechRecognizer.authorizationStatus() == .authorized else { throw LocalError("Speech permission is required. You can type instead.") }
      try await MainActor.run {
        self.speech?.stop()
        let session = LocalSpeech { [weak self] text, final, error in
          var event: [String: Any] = ["text": text, "final": final]
          if let error { event["error"] = error }
          self?.sendEvent("transcript", event)
        }
        self.speech = session
        try session.start()
      }
    }
    AsyncFunction("stop") { () async -> String in
      await MainActor.run {
        let text = self.speech?.text ?? ""
        self.speech?.stop()
        self.speech = nil
        return text
      }
    }
    AsyncFunction("readText") { (uri: String) throws -> String in
      guard let url = URL(string: uri), url.isFileURL else { throw LocalError("Only a selected local file can be read.") }
      if url.pathExtension.lowercased() == "pdf" {
        guard let document = PDFDocument(url: url), !document.isLocked else { throw LocalError("This PDF is locked or unreadable.") }
        guard document.pageCount <= 40 else { throw LocalError("This PDF exceeds the current 40-page reading limit.") }
        return document.string ?? ""
      }
      let request = VNRecognizeTextRequest()
      request.recognitionLevel = .accurate
      request.usesLanguageCorrection = true
      try VNImageRequestHandler(url: url).perform([request])
      return (request.results ?? []).compactMap { $0.topCandidates(1).first?.string }.joined(separator: "\n")
    }
    OnDestroy {
      Task { @MainActor in self.speech?.stop(); self.speech = nil }
    }
  }
}

private struct LocalError: LocalizedError {
  let message: String
  init(_ message: String) { self.message = message }
  var errorDescription: String? { message }
}

@MainActor private func generateLocally(_ prompt: String) async throws -> String {
  #if canImport(FoundationModels)
  if #available(iOS 26.0, *) {
    guard SystemLanguageModel.default.isAvailable else { throw LocalError("The OS foundation model is not available on this phone.") }
    let session = LanguageModelSession()
    return try await session.respond(to: prompt).content
  }
  #endif
  throw LocalError("This phone does not have a supported OS language model.")
}

@MainActor private final class LocalSpeech {
  let send: (String, Bool, String?) -> Void
  private let engine = AVAudioEngine()
  private var request: SFSpeechAudioBufferRecognitionRequest?
  private var task: SFSpeechRecognitionTask?
  private var tapping = false
  private var interruption: NSObjectProtocol?
  private var active = false
  private(set) var text = ""
  init(send: @escaping (String, Bool, String?) -> Void) { self.send = send }
  func start() throws {
    guard let recogniser = SFSpeechRecognizer(locale: Locale(identifier: "en-GB")), recogniser.isAvailable, recogniser.supportsOnDeviceRecognition else { throw LocalError("On-device English speech recognition is unavailable. No cloud recogniser was used.") }
    let session = AVAudioSession.sharedInstance()
    try session.setCategory(.playAndRecord, mode: .measurement, options: [.defaultToSpeaker, .allowBluetooth])
    try session.setActive(true)
    let request = SFSpeechAudioBufferRecognitionRequest()
    request.requiresOnDeviceRecognition = true
    request.shouldReportPartialResults = true
    self.request = request
    let input = engine.inputNode
    let format = input.outputFormat(forBus: 0)
    guard format.sampleRate > 0 && format.channelCount > 0 else { throw LocalError("No microphone input is available.") }
    active = true
    input.installTap(onBus: 0, bufferSize: 1024, format: format) { buffer, _ in request.append(buffer) }
    tapping = true
    task = recogniser.recognitionTask(with: request) { [weak self] result, error in
      Task { @MainActor in
        guard let self, self.active else { return }
        if let result { self.text = result.bestTranscription.formattedString }
        let final = result?.isFinal == true || error != nil
        self.send(self.text, final, error == nil ? nil : "On-device speech stopped. Your transcript is kept; you can continue typing.")
        if final { self.stop() }
      }
    }
    engine.prepare()
    do { try engine.start() } catch { stop(); throw error }
    interruption = NotificationCenter.default.addObserver(forName: AVAudioSession.interruptionNotification, object: nil, queue: .main) { [weak self] _ in
      Task { @MainActor in guard let self else { return }; self.send(self.text, true, "Microphone interrupted. Your transcript is kept."); self.stop() }
    }
  }
  func stop() {
    active = false
    if engine.isRunning { engine.stop() }
    if tapping { engine.inputNode.removeTap(onBus: 0); tapping = false }
    request?.endAudio(); request = nil
    task?.cancel(); task = nil
    if let interruption { NotificationCenter.default.removeObserver(interruption); self.interruption = nil }
    try? AVAudioSession.sharedInstance().setActive(false, options: .notifyOthersOnDeactivation)
  }
}
