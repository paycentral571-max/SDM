const path = require('path');
const fs = require('fs');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
const workspaceRoot = path.resolve(__dirname, '../..');
const mobileNodeModules = path.join(__dirname, 'node_modules');
const linkedPackages = [];
let virtualStore;
for (const entry of fs.readdirSync(mobileNodeModules, { withFileTypes: true })) {
  const entryPath = path.join(mobileNodeModules, entry.name);
  const packages = entry.name.startsWith('@') && entry.isDirectory()
    ? fs.readdirSync(entryPath).map(name => path.join(entryPath, name))
    : [entryPath];
  for (const packagePath of packages) {
    try {
      if (fs.lstatSync(packagePath).isSymbolicLink()) {
        const realPath = fs.realpathSync(packagePath);
        linkedPackages.push(realPath);
        if (!virtualStore && entry.name === 'expo') virtualStore = path.resolve(realPath, '../../..');
      }
    } catch { /* optional dependency */ }
  }
}
const virtualNodeModules = virtualStore ? fs.readdirSync(virtualStore).map(entry => path.join(virtualStore, entry, 'node_modules')).filter(candidate => fs.existsSync(candidate)) : [];
config.watchFolders = [workspaceRoot, ...(virtualStore ? [virtualStore] : []), ...linkedPackages];
config.resolver.nodeModulesPaths = [mobileNodeModules, path.join(workspaceRoot, 'node_modules'), ...virtualNodeModules];
config.resolver.unstable_enableSymlinks = true;

module.exports = config;
