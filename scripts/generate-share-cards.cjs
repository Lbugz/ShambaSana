/* Regenerate branded link previews with Sharp. Set SHARP_MODULE_PATH if needed. */
const fs = require('node:fs');
const path = require('node:path');

let sharp;
try {
  sharp = require('sharp');
} catch (error) {
  // Codex desktop installations can provide Sharp without adding a site dependency.
  const bundled = process.env.SHARP_MODULE_PATH || path.join(process.env.USERPROFILE || '', '.cache', 'codex-runtimes', 'codex-primary-runtime', 'dependencies', 'node', 'node_modules', 'sharp');
  sharp = require(bundled);
}

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'public', 'assets');
const logo = fs.readFileSync(path.join(output, 'shamba-logo-transparent.png')).toString('base64');
const escape = (text) => text.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[char]));
const fonts = path.join(__dirname, 'assets', 'fonts');
const photoCards = {
  main: { source: 'public/assets/share-main-nature-source.png', heading: 'Ancient wisdom.\nModern wellness.', label: 'LEARNING · CARE · COMMUNITY', crop: 'centre' },
  institute: { source: 'public/assets/institute-online-class-dumisani.webp', heading: 'Learn Traditional\nChinese Medicine\n(TCM) online.', label: 'THE INSTITUTE', crop: 'centre' },
};
async function type(text, family, size, maxWidth, color = '#103d2b', tracking = 0) {
  let buffer, info;
  do {
    const markup = `<span foreground="${color}"${tracking ? ` letter_spacing="${tracking * 1024}"` : ''}>${escape(text)}</span>`;
    ({ data: buffer, info } = await sharp({ text: { text: markup, font: `${family} ${size}`, fontfile: path.join(fonts, family === 'Lora' ? 'Lora.ttf' : 'PlusJakartaSans.ttf'), rgba: true, dpi: 72, spacing: 12 } }).png().toBuffer({ resolveWithObject: true }));
    size -= 1;
  } while (info.width > maxWidth && size > 24);
  return { buffer, info };
}
async function photoCard(name, card) {
  const panel = 480;
  const photograph = await sharp(path.join(root, card.source)).resize(720, 630, { fit: 'cover', position: card.crop }).toBuffer();
  const crest = await sharp(path.join(output, 'shamba-logo-transparent.png')).resize(66, 74, { fit: 'inside' }).toBuffer();
  const brand = await type('SHAMBA SANA', 'Plus Jakarta Sans', 19, 280, '#103d2b', 2);
  const label = await type(card.label, 'Plus Jakarta Sans', 10, 280, '#526050', 1);
  const heading = await type(card.heading, 'Lora', 53, 392);
  const jpg = await sharp({ create: { width: 1200, height: 630, channels: 3, background: '#f7f5ef' } }).composite([
    { input: photograph, left: panel, top: 0 },
    { input: crest, left: 44, top: 47 },
    { input: brand.buffer, left: 129, top: 62 },
    { input: label.buffer, left: 131, top: 96 },
    { input: heading.buffer, left: 44, top: Math.round((630 - heading.info.height) / 2) + 30 },
  ]).jpeg({ quality: 93, mozjpeg: true, chromaSubsampling: '4:4:4' }).toBuffer();
  fs.writeFileSync(path.join(output, `share-${name}-v3.jpg`), jpg);
  process.stdout.write(`Created share-${name}-v3.jpg (1200 × 630, ${jpg.length} bytes)\n`);
}
const cards = [
  { name: 'main', label: 'ANCIENT WISDOM · MODERN WELLNESS', lines: ['Shamba Sana'], subtitle: 'Learning, care & community', url: 'www.shambasana.com', size: 90 },
  { name: 'institute', label: 'SHAMBA SANA INSTITUTE', lines: ['Study Chinese', 'medicine online'], subtitle: 'Courses, tuition & student registration', url: 'institute.shambasana.com', size: 76 },
  { name: 'foundations-v3', label: 'SHAMBA SANA INSTITUTE · COURSE I', lines: ['Foundations of', 'Chinese Medicine'], subtitle: 'Semester-by-semester registration', url: 'institute.shambasana.com', size: 76 },
  { name: 'psyche-v3', label: 'SHAMBA SANA INSTITUTE · COURSE II', lines: ['The Psyche in', 'Chinese Medicine'], subtitle: 'Spring 2027 · Enrollment review', url: 'institute.shambasana.com', size: 76 },
  { name: 'advanced', label: 'SHAMBA SANA INSTITUTE · COURSE III', lines: ['Advanced Diagnosis', '& Treatment'], subtitle: 'Summer 2027 · Enrollment review', url: 'institute.shambasana.com', size: 76 },
];

async function generate() {
  for (const card of cards) {
    if (photoCards[card.name]) { await photoCard(card.name, photoCards[card.name]); continue; }
    const threeLines = card.lines.length === 3;
    const firstY = threeLines ? 245 : card.lines.length === 1 ? 323 : 278;
    const lineHeight = threeLines ? 68 : 88;
    const heading = card.lines.map((line, index) => `<tspan x="82" y="${firstY + index * lineHeight}">${escape(line)}</tspan>`).join('');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#f7f5ef"/>
  <rect x="25" y="25" width="1150" height="580" rx="3" fill="none" stroke="#d9ccb0"/>
  <path d="M1055 24H1175V605H1055" fill="#eeeee5"/>
  <path d="M1090 72V560" stroke="#cdbb94" stroke-width="1"/>
  <path d="M1125 118V514" stroke="#d9ccb0" stroke-width="1"/>
  <image href="data:image/png;base64,${logo}" x="78" y="62" width="72" height="78" preserveAspectRatio="xMidYMid meet"/>
  <text x="176" y="105" fill="#103d2b" font-family="Arial, sans-serif" font-size="19" letter-spacing="3">${escape(card.label)}</text>
  <path d="M82 183H137" stroke="#af8234" stroke-width="3"/>
  <text fill="#103d2b" font-family="Georgia, serif" font-size="${threeLines ? 62 : card.size}" letter-spacing="-1">${heading}</text>
  <text x="84" y="442" fill="#4f6259" font-family="Arial, sans-serif" font-size="30">${escape(card.subtitle)}</text>
  <path d="M82 502H990" stroke="#d8dcd0"/>
  <text x="84" y="552" fill="#315b46" font-family="Arial, sans-serif" font-size="23" letter-spacing="1">${escape(card.url)}</text>
  <path d="M954 533H978V557M978 533L950 561" fill="none" stroke="#103d2b" stroke-width="2"/>
</svg>`;
    const base = path.join(output, `share-${card.name}`);
    fs.writeFileSync(`${base}.svg`, svg, 'utf8');
    await sharp(Buffer.from(svg)).png().toFile(`${base}.png`);
    process.stdout.write(`Created share-${card.name}.png (1200 × 630)\n`);
  }
  fs.writeFileSync(path.join(__dirname, 'assets', 'share-previews.json'), JSON.stringify({ width: 1200, height: 630, format: 'jpeg', logo: 'public/assets/shamba-logo-transparent.png', fonts: ['Lora', 'Plus Jakarta Sans'], cards: photoCards, note: 'Main nature photograph generated with ImageGen; logo and text composed deterministically. Existing approved Institute imagery is cropped without generative changes; instructor identity is preserved.' }, null, 2) + '\n');
}

generate().catch((error) => { process.stderr.write(`${error.message}\n`); process.exitCode = 1; });
