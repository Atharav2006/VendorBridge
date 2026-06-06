const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'Frontend', 'src');

const replacements = [
  { regex: /\btext-white\b/g, replacement: 'text-slate-800' },
  { regex: /\btext-slate-400\b/g, replacement: 'text-slate-500' },
  { regex: /\btext-slate-300\b/g, replacement: 'text-slate-600' },
  { regex: /\btext-slate-200\b/g, replacement: 'text-slate-700' },
  { regex: /\bbg-white\/5\b/g, replacement: 'bg-slate-50' },
  { regex: /\bbg-white\/10\b/g, replacement: 'bg-slate-100' },
  { regex: /\bbg-slate-900\/90\b/g, replacement: 'bg-white' },
  { regex: /\bbg-slate-900\/40\b/g, replacement: 'bg-white' },
  { regex: /\bbg-slate-950\/20\b/g, replacement: 'bg-slate-50' },
  { regex: /\bborder-white\/5\b/g, replacement: 'border-border' },
  { regex: /\bborder-white\/10\b/g, replacement: 'border-border' },
  { regex: /\bborder-white\/20\b/g, replacement: 'border-border' },
  { regex: /\bborder-white\/30\b/g, replacement: 'border-border' },
  { regex: /\bbg-black\/15\b/g, replacement: 'bg-slate-100' },
  { regex: /\bbg-slate-900\b/g, replacement: 'bg-white' },
  { regex: /\bbg-slate-950\b/g, replacement: 'bg-white' },
  { regex: /\bbg-slate-800\b/g, replacement: 'bg-slate-100' },
  { regex: /\btext-secondary-light\b/g, replacement: 'text-primary' },
  { regex: /\btext-secondary\b/g, replacement: 'text-primary' },
  { regex: /\bglow-ring-teal\b/g, replacement: 'glow-ring-primary' },
  { regex: /\bbg-slate-950\/5\b/g, replacement: 'bg-white/60' },
  { regex: /\btext-sky-50\b/g, replacement: 'text-slate-500' },
  { regex: /\bdivide-white\/5\b/g, replacement: 'divide-border' },
  { regex: /\bshadow-xl\b/g, replacement: 'shadow-md' },
  { regex: /\bglass-card\b/g, replacement: 'bg-white border border-border shadow-sm rounded-2xl' },
  // specific to modals/tables
  { regex: /rgba\(255,255,255,0\.05\)/g, replacement: '"#e2e8f0"' },
  { regex: /stroke="#94a3b8"/g, replacement: 'stroke="#64748b"' },
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;

      for (const { regex, replacement } of replacements) {
        content = content.replace(regex, replacement);
      }

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

processDirectory(directoryPath);
console.log('Refactor complete.');
