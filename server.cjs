const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const { URLSearchParams } = require('node:url');
const { offerings, registrationPage } = require('./registration-pages.cjs');
const root = path.join(__dirname, 'public');
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.ico':'image/x-icon'};

const registrationAttempts = new Map();
const registrationCourses = new Set([
  'Foundations of Chinese Medicine',
  'The Psyche in Chinese Medicine',
  'Advanced Diagnosis & Treatment',
]);
const registrationTerms = {
  'Foundations of Chinese Medicine': 'Fall 2026',
  'The Psyche in Chinese Medicine': 'Spring 2027',
  'Advanced Diagnosis & Treatment': 'Summer 2027',
};

function sendJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(body));
}

function enrollmentSettings() {
  let webhook;
  try { webhook = new URL(process.env.COURSE_REGISTRATION_WEBHOOK_URL); } catch { /* Intake stays closed. */ }
  const courses = (process.env.COURSE_REGISTRATION_COURSES || Object.keys(registrationTerms).join('|'))
    .split('|').map((value) => value.trim()).filter((value) => registrationCourses.has(value) && registrationTerms[value]);
  // Foundations now accepts reviewed catch-up/continuation requests. The global
  // registration switch and authenticated backend delivery still control intake.
  if (!courses.includes('Foundations of Chinese Medicine')) courses.push('Foundations of Chinese Medicine');
  const open = process.env.COURSE_REGISTRATION_OPEN === 'true' && webhook?.protocol === 'https:' && courses.length > 0;
  return { open: Boolean(open), courses: open ? courses : [], webhook };
}

async function handleRegistration(req, res) {
  const settings = enrollmentSettings();
  if (!settings.open) {
    return sendJson(res, 503, { message: 'Course registration is not open yet. Please try again later.' });
  }

  const now = Date.now();
  if (registrationAttempts.size > 1000) {
    for (const [key, timestamps] of registrationAttempts) {
      if (!timestamps.some((timestamp) => now - timestamp < 15 * 60 * 1000)) registrationAttempts.delete(key);
    }
  }
  const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown').toString().split(',')[0].trim();
  const attempts = (registrationAttempts.get(ip) || []).filter((timestamp) => now - timestamp < 15 * 60 * 1000);
  if (attempts.length >= 5) {
    return sendJson(res, 429, { message: 'Please wait a few minutes before sending another request.' });
  }
  if (registrationAttempts.size >= 5000 && !registrationAttempts.has(ip)) {
    return sendJson(res, 503, { message: 'Registration is busy. Please try again later.' });
  }
  attempts.push(now);
  registrationAttempts.set(ip, attempts);
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 12_000) return sendJson(res, 413, { message: 'The form is too large. Please shorten your message and try again.' });
    chunks.push(chunk);
  }

  const fields = new URLSearchParams(Buffer.concat(chunks).toString('utf8'));
  if (fields.get('website')) return sendJson(res, 200, { message: 'Thank you. Your request has been received.' });
  const selectedCourse = (fields.get('course') || '').trim();
  const selectedSemester = fields.has('semester') ? Number(fields.get('semester')) : 1;
  const selectedFormat = fields.get('learningFormat') || 'live-online';
  const term = selectedCourse === 'Foundations of Chinese Medicine' ? ({ 1: 'Fall 2026', 2: 'Spring 2027', 3: 'To be confirmed' })[selectedSemester] : registrationTerms[selectedCourse];
  const registration = {
    course: selectedCourse,
    term,
    semester: selectedSemester,
    learningFormat: selectedFormat,
    foundationsStatus: fields.get('foundationsStatus') || (selectedCourse === 'Foundations of Chinese Medicine' && selectedSemester === 1 ? 'not-started' : ''),
    psycheStatus: fields.get('course') === 'Advanced Diagnosis & Treatment' ? fields.get('psycheStatus') || '' : undefined,
    priorCohort: (fields.get('priorCohort') || '').trim(),
    prerequisiteAcknowledgement: fields.get('prerequisiteAcknowledgement') === 'yes',
    name: (fields.get('name') || '').trim(),
    email: (fields.get('email') || '').trim(),
    phone: (fields.get('phone') || '').trim(),
    timezone: (fields.get('timezone') || '').trim(),
    message: (fields.get('message') || '').trim(),
    consent: fields.get('consent') === 'yes',
    paymentPlan: fields.get('paymentPlan') || undefined,
    paymentConsent: fields.get('paymentConsent') === 'yes',
    paymentTermsVersion: fields.get('paymentTermsVersion') || undefined,
    submittedAt: new Date().toISOString(),
    reference: /^SS-[a-f0-9-]{36}$/i.test(fields.get('reference') || '') ? fields.get('reference') : 'SS-' + randomUUID(),
  };

  if (!settings.courses.includes(registration.course)
      || ![1, 2, 3].includes(registration.semester) || !registration.term
      || !['live-online', 'self-paced'].includes(registration.learningFormat)
      || (registration.course !== 'Foundations of Chinese Medicine' && (registration.semester !== 1 || registration.learningFormat !== 'live-online'))
      || (registration.course === 'Foundations of Chinese Medicine' && (registration.semester === 1 ? registration.learningFormat !== 'self-paced' : registration.learningFormat !== 'live-online'))
      || !['completed', 'in-progress', 'registered', 'not-started'].includes(registration.foundationsStatus)
      || (registration.course === 'Advanced Diagnosis & Treatment' && !['completed', 'in-progress', 'registered', 'not-started'].includes(registration.psycheStatus))
      || !registration.prerequisiteAcknowledgement || registration.priorCohort.length > 240
      || registration.name.length < 2 || registration.name.length > 120
      || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registration.email) || registration.email.length > 254
      || registration.phone.length > 40 || registration.message.length > 1000 || registration.timezone.length > 80
      || (registration.paymentPlan && (!['full', 'monthly'].includes(registration.paymentPlan) || registration.course !== 'Foundations of Chinese Medicine' || !registration.paymentConsent || typeof registration.paymentTermsVersion !== 'string' || !registration.paymentTermsVersion.length || registration.paymentTermsVersion.length > 120))
      || !registration.consent) {
    return sendJson(res, 400, { message: 'Please check the form fields and consent, then try again.' });
  }

  try {
    const response = await fetch(settings.webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(process.env.COURSE_REGISTRATION_SERVICE_TOKEN ? { Authorization: `Bearer ${process.env.COURSE_REGISTRATION_SERVICE_TOKEN}` } : {}) },
      body: JSON.stringify(registration),
      signal: AbortSignal.timeout(30000),
    });
    if (!response.ok) throw new Error(`Submission destination returned ${response.status}`);
    const acknowledgement = await response.json();
    if (acknowledgement.received !== true) throw new Error('Submission destination did not acknowledge receipt');
    const checkoutUrl = typeof acknowledgement.checkoutUrl === 'string' && acknowledgement.checkoutUrl.startsWith('https://checkout.stripe.com/') ? acknowledgement.checkoutUrl : undefined;
    let paymentUrl;
    try { const candidate = new URL(acknowledgement.paymentUrl); if (candidate.origin === settings.webhook.origin && candidate.hash.startsWith('#/course-payment?')) paymentUrl = candidate.href; } catch { /* No private payment page for reviewed applications. */ }
    return sendJson(res, 200, { received: true, reference: registration.reference, checkoutUrl, paymentUrl, sandbox: acknowledgement.sandbox === true });
  } catch (error) {
    console.error('Course registration delivery failed:', error.message);
    return sendJson(res, 502, { message: 'Receipt is not confirmed. Contact onlineclass@liferx.us before submitting again.' });
  }
}

http.createServer(async (req, res) => {
 try {
  const requestUrl = new URL(req.url, 'http://localhost');
  let url;
  try { url = decodeURIComponent(requestUrl.pathname); }
  catch { res.writeHead(400); return res.end(); }

  if (url === '/api/course-registration/status') {
    if (!['GET', 'HEAD'].includes(req.method)) return sendJson(res, 405, { message: 'Method not allowed.' });
    const { open, courses, webhook } = enrollmentSettings();
    if (!open) return sendJson(res, 200, { open: false, courses: [] });
    try {
      const endpoint = new URL('/api/institute/registration-settings', webhook.origin);
      const response = await fetch(endpoint, { signal: AbortSignal.timeout(5000) });
      if (!response.ok) throw new Error('Registration settings unavailable');
      const payment = await response.json();
      if (!['sandbox', 'live'].includes(payment.paymentMode) || typeof payment.paymentTermsVersion !== 'string') throw new Error('Invalid registration settings');
      return sendJson(res, 200, { open, courses, paymentMode: payment.paymentMode, paymentTermsVersion: payment.paymentTermsVersion, liveCheckoutOpen: payment.liveCheckoutOpen === true });
    } catch { return sendJson(res, 503, { open: false, courses: [], message: 'Registration availability could not be confirmed.' }); }
  }

  if (url === '/api/course-registration') {
    if (req.method !== 'POST') return sendJson(res, 405, { message: 'Method not allowed.' });
    if (!/^application\/x-www-form-urlencoded(?:\s*;|$)/i.test(req.headers['content-type'] || '')) {
      return sendJson(res, 415, { message: 'Unsupported form format.' });
    }
    return await handleRegistration(req, res);
  }

  if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405); return res.end(); }
  const registrationPath = url.replace(/^\/institute(?=\/)/, '');
  const registrationSlug = registrationPath.match(/^\/register\/([a-z0-9-]+)\/?$/)?.[1];
  if (registrationSlug || registrationPath === '/registration.html') {
    if (registrationSlug && !offerings[registrationSlug]) { res.writeHead(404); return res.end('Course link not found'); }
    const html = registrationPage(fs.readFileSync(path.join(root, 'institute', 'registration.html'), 'utf8'), offerings[registrationSlug], registrationSlug);
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'no-cache' });
    return res.end(req.method === 'HEAD' ? undefined : html);
  }
  const host = (req.headers.host || '').split(':')[0].toLowerCase();
  if (host === 'institute.shambasana.com') {
    if (url === '/') url = '/institute/';
    else if (url === '/index.html') url = '/institute/index.html';
    else if (url !== '/health' && !url.startsWith('/institute/') && !url.startsWith('/assets/')) url = path.posix.join('/institute', url);
  }
  let file = path.resolve(root, '.' + url);
  if (file !== root && !file.startsWith(root + path.sep)) { res.writeHead(403); return res.end(); }
  if (url === '/health') { res.writeHead(200, { 'Content-Type': 'text/plain' }); return res.end('ok'); }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
    if (!url.endsWith('/')) {
      res.writeHead(308, { Location: requestUrl.pathname + '/' + requestUrl.search });
      return res.end();
    }
    file = path.join(file, 'index.html');
  }
  fs.readFile(file, (error, data) => {
    if (error) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff' });
    res.end(req.method === 'HEAD' ? undefined : data);
  });
 } catch {
  if (!res.headersSent && !req.aborted) sendJson(res, 500, { message: 'We could not process this request. Please try again later.' });
  else if (!res.writableEnded) res.end();
 }
}).listen(Number(process.env.PORT) || 3000, '0.0.0.0', () => console.log('Shamba Sana server ready'));
