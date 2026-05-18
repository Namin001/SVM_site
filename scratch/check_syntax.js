const fs = require('fs');
const content = fs.readFileSync('app/(protected)/admin/page.tsx', 'utf8');

let braces = 0;
let parens = 0;
let tags = 0;

for (let i = 0; i < content.length; i++) {
    if (content[i] === '{') braces++;
    if (content[i] === '}') braces--;
    if (content[i] === '(') parens++;
    if (content[i] === ')') parens--;
}

console.log('Braces:', braces);
console.log('Parens:', parens);

// Count tags (crude)
const openTags = (content.match(/<[a-zA-Z]/g) || []).length;
const closeTags = (content.match(/<\/[a-zA-Z]/g) || []).length;
const selfClosing = (content.match(/\/>/g) || []).length;
const fragmentsOpen = (content.match(/<>/g) || []).length;
const fragmentsClose = (content.match(/<\/>/g) || []).length;

console.log('Open Tags:', openTags);
console.log('Close Tags:', closeTags);
console.log('Self-Closing:', selfClosing);
console.log('Fragments:', fragmentsOpen, '/', fragmentsClose);
console.log('Net Tags:', openTags - closeTags - selfClosing + (fragmentsOpen - fragmentsClose));
