const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const { withUniwindConfig } = require("uniwind/metro");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");
const coreRoot = path.resolve(monorepoRoot, "packages/core");
const brainRoot = path.resolve(monorepoRoot, "packages/brain");
const rootReactDir = path.resolve(monorepoRoot, "node_modules/react");
const rootReactDomDir = path.resolve(monorepoRoot, "node_modules/react-dom");

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const CORE_ALIASES = {
  "@life/brain": path.resolve(brainRoot, "src/index.ts"),
  "@life/core": path.resolve(coreRoot, "src/index.ts"),
  "@life/core/engine": path.resolve(coreRoot, "src/data/lifeosEngine.ts"),
  "@life/core/types": path.resolve(coreRoot, "src/types/lifeos.ts"),
  "@life/core/finance": path.resolve(coreRoot, "src/data/finance.ts"),
  "@life/core/health": path.resolve(coreRoot, "src/data/health.ts"),
  "@life/core/housing": path.resolve(coreRoot, "src/data/housing.ts"),
  "@life/core/growth": path.resolve(coreRoot, "src/data/growth.ts"),
  "@life/core/onboarding": path.resolve(coreRoot, "src/data/onboarding.ts"),
  "@life/core/gambits": path.resolve(coreRoot, "src/data/gambits.ts"),
  "@life/core/weeklyRecap": path.resolve(coreRoot, "src/data/weeklyRecap.ts"),
};

const config = getDefaultConfig(projectRoot);

// Watch @life/core while preventing Metro from ever resolving root React 18,
// keeping hierarchical lookup enabled for nested packages (e.g. reanimated's semver@7).
config.watchFolders = [coreRoot, brainRoot];
config.resolver.nodeModulesPaths = [path.resolve(projectRoot, "node_modules")];
config.resolver.blockList = [
  new RegExp(`^${escapeRegex(rootReactDir)}[/\\\\].*$`),
  new RegExp(`^${escapeRegex(rootReactDomDir)}[/\\\\].*$`),
];

const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const mappedTarget = CORE_ALIASES[moduleName];
  if (mappedTarget) {
    return { type: "sourceFile", filePath: mappedTarget };
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withUniwindConfig(config, {
  cssEntryFile: "./src/global.css",
  dtsFile: "./src/uniwind-types.d.ts",
});
