const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { URLSearchParams } = require('node:url');
const root = path.join(__dirname, 'public');
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.ico':'image/x-icon'};

const registrationAttempts = new Map();
const registrationCourses = new Set([
  'Foundations of Chinese Medicine',
  'The Psyche in Chinese Medicine',
  'Advanced Diagnosis & Treatment',
]);

function sendJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(body));
}

async function handleRegistration(req, res) {
  const webhook = process.env.COURSE_REGISTRATION_WEBHOOK_URL;
  if (!webhook) {
    return sendJson(res, 503, { message: 'Course registration is not open yet. Please try again later.' });
  }

  let webhookUrl;
  try {
    webhookUrl = new URL(webhook);
  } catch {
    return sendJson(res, 503, { message: 'Registration is temporarily unavailable.' });
  }
  if (webhookUrl.protocol !== 'https:') {
    return sendJson(res, 503, { message: 'Registration is temporarily unavailable.' });
  }

  const now = Date.now();
  const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown').toString().split(',')[0].trim();
  const attempts = (registrationAttempts.get(ip) || []).filter((timestamp) => now - timestamp < 15 * 60 * 1000);
  if (attempts.length >= 5) {
    return sendJson(res, 429, { message: 'Please wait a few minutes before sending another request.' });
  }
  attempts.push(now);
  registrationAttempts.set(ip, attempts);

  let body = '';
  for await (const chunk of req) {
    body += chunk;
    if (body.length > 12_000) return sendJson(res, 413, { message: 'The form is too large. Please shorten your message and try again.' });
  }

  const fields = new URLSearchParams(body);
  if (fields.get('website')) return sendJson(res, 200, { message: 'Thank you. Your request has been received.' });
  const registration = {
    course: (fields.get('course') || '').trim(),
    name: (fields.get('name') || '').trim(),
    email: (fields.get('email') || '').trim(),
    phone: (fields.get('phone') || '').trim(),
    message: (fields.get('message') || '').trim(),
    consent: fields.get('consent') === 'yes',
    submittedAt: new Date().toISOString(),
  };

  if (!registrationCourses.has(registration.course)
      || registration.name.length < 2 || registration.name.length > 120
      || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registration.email) || registration.email.length > 254
      || registration.phone.length > 40 || registration.message.length > 1000
      || !registration.consent) {
    return sendJson(res, 400, { message: 'Please check the form fields and consent, then try again.' });
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registration),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error(`Submission destination returned ${response.status}`);
    return sendJson(res, 200, { message: 'Your course registration has been received. We’ll follow up with cohort details and the next steps to confirm your place.' });
  } catch (error) {
    console.error('Course registration delivery failed:', error.message);
    return sendJson(res, 502, { message: 'We couldn’t send your request just now. Please try again later.' });
  }
}

http.createServer(async (req, res) => {
  let url;
  try { url = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400); return res.end(); }

  if (url === '/api/course-registration') {
    if (req.method !== 'POST') return sendJson(res, 405, { message: 'Method not allowed.' });
    if (!/^application\/x-www-form-urlencoded(?:\s*;|$)/i.test(req.headers['content-type'] || '')) {
      return sendJson(res, 415, { message: 'Unsupported form format.' });
    }
    return handleRegistration(req, res);
  }

  if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405); return res.end(); }
  const host = (req.headers.host || '').split(':')[0].toLowerCase();
  if (host === 'institute.shambasana.com') {
    if (url === '/') url = '/institute/';
    else if (url === '/index.html') url = '/institute/index.html';
    else if (url !== '/health' && !url.startsWith('/institute/') && !url.startsWith('/assets/')) url = path.posix.join('/institute', url);
  }
  let file = path.resolve(root, '.' + url);
  if (file !== root && !file.startsWith(root + path.sep)) { res.writeHead(403); return res.end(); }
  if (url === '/health') { res.writeHead(200, { 'Content-Type': 'text/plain' }); return res.end('ok'); }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  fs.readFile(file, (error, data) => {
    if (error) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff' });
    res.end(req.method === 'HEAD' ? undefined : data);
  });
}).listen(Number(process.env.PORT) || 3000, '0.0.0.0', () => console.log('Shamba Sana server ready'));
