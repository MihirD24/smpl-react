const fs = require('fs');
const { execSync } = require('child_process');
const pkg = require('./package.json');
const deps = Object.keys(pkg.dependencies);
const unused = [];
for (const dep of deps) {
  try {
    const res = execSync(`grep -rn "${dep}" src/ App.tsx index.js 2>/dev/null`, { encoding: 'utf8' });
    if (!res.trim()) {
      unused.push(dep);
    }
  } catch (e) {
    unused.push(dep); // grep exits with 1 if not found
  }
}
console.log("Unused dependencies:");
console.log(unused.join('\n'));
