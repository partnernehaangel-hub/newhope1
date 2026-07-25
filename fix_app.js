import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Handle multiline <img ... /> or <img>...</img>
// More robust regex for img tags
content = content.replace(/<img([\s\S]*?)\/?>/g, (match, p1) => {
    // Correctly handle parameters and ensure it's a valid JSX tag
    let attributes = p1.trim().replace(/\/$/, '').trim();
    attributes = attributes.replace(/\/ referrerPolicy/g, 'referrerPolicy');
    if (!attributes.includes('referrerPolicy')) {
        attributes += ' referrerPolicy="no-referrer"';
    }
    if (!attributes.includes('alt=')) {
        attributes += ' alt=""';
    }
    return `<img ${attributes} />`;
});

// Cleanup specific unused things
content = content.replace(/  MapPin,\n/g, '');
content = content.replace(/  LineChart,\n  Line,\n/g, '');

// Remove common debug logs
content = content.replace(/console\.log\(['"][^'"]*['"](?:,\s*[^)]*)?\);?\n?/g, '');
// But keep console.error for error handling

fs.writeFileSync('src/App.tsx', content);
console.log('App.tsx robust cleanup done (with logs)');
