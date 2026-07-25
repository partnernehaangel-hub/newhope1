import fs from 'fs';
import path from 'path';

function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function(file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            if (file.endsWith('.ts') || file.endsWith('.tsx')) {
                arrayOfFiles.push(path.join(dirPath, "/", file));
            }
        }
    });

    return arrayOfFiles;
}

const files = getAllFiles('src');
const allUnused = [];

for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n');

    // 1. Check Imports
    let inImport = false;
    let iconImports = [];
    for (let line of lines) {
        if (line.includes("from 'lucide-react'") || line.includes('from "lucide-react"')) {
            inImport = false;
            continue;
        }
        if (line.includes('import {') && (line.includes('lucide-react'))) {
            inImport = true;
            continue;
        }
        if (inImport && line.includes(',')) {
            const parts = line.split(',');
            for (let part of parts) {
                const match = part.trim().match(/^([A-Z][a-zA-Z0-9]+)/);
                if (match) iconImports.push(match[1]);
            }
        }
    }

    for (let name of iconImports) {
        const regex = new RegExp(`\\b${name}\\b`, 'g');
        const matches = content.match(regex);
        if (matches && matches.length <= 1) {
            allUnused.push({ file, name, type: 'icon' });
        }
    }

    // 2. Check useState variables
    const useStateRegex = /const\s+\[\s*([a-zA-Z0-9_]+)\s*,\s*([a-zA-Z0-9_]+)\s*\]\s*=\s*useState/g;
    let match;
    while ((match = useStateRegex.exec(content)) !== null) {
        const [_, varName, setterName] = match;
        const varRegex = new RegExp(`\\b${varName}\\b`, 'g');
        const varMatches = content.match(varRegex);
        if (varMatches && varMatches.length <= 1) allUnused.push({ file, name: varName, type: 'useState-var' });

        const setterRegex = new RegExp(`\\b${setterName}\\b`, 'g');
        const setterMatches = content.match(setterRegex);
        if (setterMatches && setterMatches.length <= 1) allUnused.push({ file, name: setterName, type: 'useState-setter' });
    }

    // 3. Check regular variables (simple)
    const constRegex = /(?:const|let|var)\s+([a-zA-Z0-9_]+)\s*=/g;
    while ((match = constRegex.exec(content)) !== null) {
        const name = match[1];
        if (['const', 'let', 'var', 'if', 'for', 'while', 'return'].includes(name)) continue;
        const countRegex = new RegExp(`\\b${name}\\b`, 'g');
        const countMatches = content.match(countRegex);
        if (countMatches && countMatches.length <= 1) allUnused.push({ file, name, type: 'variable' });
    }
}

console.log(`Total Unused Items found in ${files.length} files: ${allUnused.length}`);
allUnused.forEach(item => {
    console.log(`${item.file}: ${item.name} (${item.type})`);
});
