Pod::Spec.new do |s|
  s.name = 'LifeIntelligence'
  s.version = '0.1.0'
  s.summary = 'On-device speech, document text and optional OS foundation model'
  s.description = s.summary
  s.author = 'Emotive Impact'
  s.homepage = 'https://github.com/EmotiveImpact/LifeOS'
  s.license = { :type => 'MIT' }
  s.platforms = { :ios => '16.4' }
  s.source = { :git => '' }
  s.static_framework = true
  s.swift_version = '5.9'
  s.dependency 'ExpoModulesCore'
  s.source_files = '**/*.{h,m,swift}'
  s.frameworks = 'Speech', 'AVFoundation', 'Vision', 'PDFKit'
  s.pod_target_xcconfig = { 'DEFINES_MODULE' => 'YES' }
end
