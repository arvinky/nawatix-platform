const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const enumsFile = path.join(srcDir, 'common', 'enums.ts');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir(srcDir, (filePath) => {
  if (filePath.endsWith('.ts') && filePath !== enumsFile) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if the file imports anything OTHER than PrismaClient from @prisma/client
    if (content.includes("'@prisma/client'") && !filePath.includes('prisma.service.ts')) {
      // Calculate relative path from this file to enums.ts
      let relativePath = path.relative(path.dirname(filePath), enumsFile);
      // Remove .ts extension and normalize slashes
      relativePath = relativePath.replace(/\\/g, '/').replace(/\.ts$/, '');
      if (!relativePath.startsWith('.')) {
        relativePath = './' + relativePath;
      }
      
      content = content.replace(/'@prisma\/client'/g, `'${relativePath}'`);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Patched ${filePath} -> ${relativePath}`);
    }
  }
});
