/**
 * Health Connect's client needs Android 8 (API 26) or newer, above React Native's default of 24. Expo reads
 * `android.minSdkVersion` from gradle.properties, so this sets it there (BUILD_V26 Phase 26). No library needed.
 */
const { withGradleProperties } = require('expo/config-plugins');

module.exports = function withAndroidMinSdk(config, minSdk = 26) {
  return withGradleProperties(config, cfg => {
    const props = cfg.modResults.filter(p => !(p.type === 'property' && p.key === 'android.minSdkVersion'));
    props.push({ type: 'property', key: 'android.minSdkVersion', value: String(minSdk) });
    cfg.modResults = props;
    return cfg;
  });
};
