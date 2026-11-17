package app.life.intelligence

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import androidx.core.content.ContextCompat
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.text.TextRecognition
import com.google.mlkit.vision.text.latin.TextRecognizerOptions
import expo.modules.kotlin.Promise
import expo.modules.kotlin.functions.Queues
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class LifeIntelligenceModule : Module() {
  private var recogniser: SpeechRecognizer? = null
  private var text = ""
  override fun definition() = ModuleDefinition {
    Name("LifeIntelligence")
    Events("transcript")
    // No Android language model is claimed until a supported built-in/download
    // adapter is installed and evaluated. Rules and confirmed memory still work.
    AsyncFunction("available") { false }
    AsyncFunction("generate") { _: String -> unavailableModel() }
    AsyncFunction("speechAvailable") {
      val context = appContext.reactContext
      context != null && Build.VERSION.SDK_INT >= 31 && SpeechRecognizer.isOnDeviceRecognitionAvailable(context)
    }.runOnQueue(Queues.MAIN)
    AsyncFunction("requestSpeechPermission") {
      val context = appContext.reactContext
      context != null && ContextCompat.checkSelfPermission(context, Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED
    }
    AsyncFunction("start") {
      val context = appContext.reactContext ?: throw IllegalStateException("The app is not ready.")
      if (Build.VERSION.SDK_INT < 31 || !SpeechRecognizer.isOnDeviceRecognitionAvailable(context)) throw IllegalStateException("On-device speech is unavailable. No cloud recogniser was used.")
      if (ContextCompat.checkSelfPermission(context, Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) throw IllegalStateException("Microphone permission is required.")
      release()
      text = ""
      val local = SpeechRecognizer.createOnDeviceSpeechRecognizer(context)
      recogniser = local
      local.setRecognitionListener(object : RecognitionListener {
        override fun onReadyForSpeech(params: Bundle?) {}
        override fun onBeginningOfSpeech() {}
        override fun onRmsChanged(rmsdB: Float) {}
        override fun onBufferReceived(buffer: ByteArray?) {}
        override fun onEndOfSpeech() {}
        override fun onEvent(eventType: Int, params: Bundle?) {}
        override fun onPartialResults(results: Bundle?) { update(results, false) }
        override fun onResults(results: Bundle?) { update(results, true); release() }
        override fun onError(error: Int) {
          sendEvent("transcript", mapOf("text" to text, "final" to true, "error" to "On-device speech stopped. Your transcript is kept; you can type instead."))
          release()
        }
      })
      local.startListening(Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
        putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
        putExtra(RecognizerIntent.EXTRA_LANGUAGE, "en-GB")
        putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
        putExtra(RecognizerIntent.EXTRA_PREFER_OFFLINE, true)
      })
    }.runOnQueue(Queues.MAIN)
    AsyncFunction("stop") { val last = text; release(); last }.runOnQueue(Queues.MAIN)
    AsyncFunction("readText") { uri: String, promise: Promise ->
      val context = appContext.reactContext
      if (context == null) { promise.reject("NOT_READY", "The app is not ready.", null); return@AsyncFunction }
      val selected = Uri.parse(uri)
      if (selected.scheme != "file" && selected.scheme != "content") { promise.reject("LOCAL_ONLY", "Only a selected local file can be read.", null); return@AsyncFunction }
      val reader = TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS)
      try {
        reader.process(InputImage.fromFilePath(context, selected))
          .addOnSuccessListener { result -> reader.close(); promise.resolve(result.text) }
          .addOnFailureListener { error -> reader.close(); promise.reject("UNREADABLE", "This file could not be read on this phone.", error) }
      } catch (error: Exception) { reader.close(); promise.reject("UNREADABLE", "This file could not be read on this phone.", error) }
    }
    OnDestroy { appContext.reactContext?.runOnUiQueueThread { release() } }
  }
  private fun unavailableModel(): String = throw IllegalStateException("No on-device language model is installed.")
  private fun update(results: Bundle?, final: Boolean) {
    results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)?.firstOrNull()?.let { text = it }
    sendEvent("transcript", mapOf("text" to text, "final" to final))
  }
  private fun release() {
    val old = recogniser
    recogniser = null
    old?.setRecognitionListener(null)
    old?.cancel()
    old?.destroy()
  }
}
