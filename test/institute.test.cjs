const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const vm = require('node:vm');
const { spawn } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const courses = ['Foundations of Chinese Medicine', 'The Psyche in Chinese Medicine', 'Advanced Diagnosis & Treatment'];
let port = 32930;

async function server(env = {}, acknowledgement = true) {
  const assignedPort = ++port;
  const code = `global.fetch=async()=>new Response(JSON.stringify({received:${acknowledgement}}),{status:200});require('./server.cjs');`;
  const child = spawn(process.execPath, ['-e', code], {
    cwd: root, stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, PORT: String(assignedPort), COURSE_REGISTRATION_OPEN: '', COURSE_REGISTRATION_WEBHOOK_URL: '', COURSE_REGISTRATION_COURSES: '', ...env },
  });
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => { child.kill(); reject(new Error('Server startup timed out')); }, 8000);
    child.stdout.once('data', () => { clearTimeout(timer); resolve(); });
    child.once('error', (error) => { clearTimeout(timer); reject(error); });
    child.once('exit', (code) => { clearTimeout(timer); if (code) reject(new Error('Server exited: ' + code)); });
  });
  return { child, port: assignedPort, base: `http://127.0.0.1:${assignedPort}` };
}

test('closed intake, complete page assets, anchors, section order and canonical URLs', async () => {
  const app = await server();
  try {
    const status = await (await fetch(app.base + '/api/course-registration/status')).json();
    assert.deepEqual(status, { open: false, courses: [] });
    assert.equal((await fetch(app.base + '/api/course-registration', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: '' })).status, 503);
    const redirect = await fetch(app.base + '/institute?course=test', { redirect: 'manual' });
    assert.equal(redirect.status, 308);
    assert.equal(redirect.headers.get('location'), '/institute/?course=test');
    for (const route of ['/institute/', '/institute/registration.html']) {
      const response = await fetch(app.base + route);
      assert.equal(response.status, 200);
      const html = await response.text();
      for (const [, reference] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
        if (reference.startsWith('http')) continue;
        if (reference.startsWith('#')) { assert.ok(html.includes(`id="${reference.slice(1)}"`), reference); continue; }
        const asset = await fetch(new URL(reference, app.base + route));
        assert.equal(asset.status, 200, reference);
        if (reference.endsWith('.webp')) assert.equal(asset.headers.get('content-type'), 'image/webp');
      }
      if (route === '/institute/') {
        let previous = -1;
        for (const id of ['learning-path', 'how-we-learn', 'instructor', 'assessment-title', 'enrollment']) {
          const position = html.indexOf(`id="${id}"`);
          assert.ok(position > previous, 'Section order: ' + id); previous = position;
        }
        assert.ok(html.includes('Founder &amp; Instructor'));
        assert.ok(!html.includes('institute-online-class-dumisani.png'));
      }
    }
    for (const route of ['/', '/registration.html', '/style.css', '/assets/dumisani-portrait.webp']) {
      const code = await new Promise((resolve, reject) => {
        http.get({ hostname: '127.0.0.1', port: app.port, path: route, headers: { host: 'institute.shambasana.com' } }, (res) => {
          res.resume(); res.on('end', () => resolve(res.statusCode));
        }).on('error', reject);
      });
      assert.equal(code, 200, route);
    }
  } finally { app.child.kill(); }
});

test('opening requires both explicit authorization and a valid destination', async () => {
  const app = await server({ COURSE_REGISTRATION_OPEN: 'true', COURSE_REGISTRATION_WEBHOOK_URL: 'http://example.invalid' });
  try { assert.equal((await (await fetch(app.base + '/api/course-registration/status')).json()).open, false); }
  finally { app.child.kill(); }
});

test('open course validation and acknowledged receipt; no actual external delivery', async () => {
  const app = await server({ COURSE_REGISTRATION_OPEN: 'true', COURSE_REGISTRATION_WEBHOOK_URL: 'https://example.invalid/mock' });
  const valid = { course: courses[0], name: 'Audit Learner', email: 'audit@example.invalid', consent: 'yes', timezone: 'America/New_York' };
  let attempt = 0;
  const post = (fields) => fetch(app.base + '/api/course-registration', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'x-forwarded-for': '192.0.2.' + ++attempt }, body: new URLSearchParams(fields),
  });
  try {
    const availability = await (await fetch(app.base + '/api/course-registration/status')).json();
    assert.deepEqual(availability, { open: true, courses: [courses[0]] });
    const received = await (await post(valid)).json();
    assert.equal(received.received, true); assert.match(received.reference, /^SS-/);
    for (const invalid of [{ ...valid, email: 'invalid' }, { ...valid, name: 'A' }, { ...valid, consent: '' }, { ...valid, course: courses[1] }, { ...valid, message: 'x'.repeat(1001) }, { ...valid, timezone: 'x'.repeat(81) }]) {
      assert.equal((await post(invalid)).status, 400);
    }
    assert.equal((await fetch(app.base + '/api/course-registration')).status, 405);
    assert.equal((await fetch(app.base + '/api/course-registration', { method: 'POST', body: '{}' })).status, 415);
  } finally { app.child.kill(); }
});

test('destination must acknowledge receipt before student success', async () => {
  const app = await server({ COURSE_REGISTRATION_OPEN: 'true', COURSE_REGISTRATION_WEBHOOK_URL: 'https://example.invalid/mock' }, false);
  try {
    const response = await fetch(app.base + '/api/course-registration', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ course: courses[0], name: 'Audit Learner', email: 'audit@example.invalid', consent: 'yes' }) });
    assert.equal(response.status, 502);
  } finally { app.child.kill(); }
});

async function client({ selected = courses[0], protocol = 'https:', open = true, response, valid = true } = {}) {
  const handlers = {};
  const course = { value: '', options: courses.map(value => ({ value })), addEventListener: (_, fn) => { handlers.change = fn; } };
  const details = { disabled: true }, button = { disabled: true }, status = { dataset: {}, removeAttribute() {}, focus() {} }, availability = {}, timezone = {};
  const form = { action: '/api/course-registration', querySelector: (selector) => selector.includes('course') ? course : selector.includes('timezone') ? timezone : button,
    reportValidity: () => valid, addEventListener: (_, fn) => { handlers.submit = fn; }, classList: { add() {}, remove() {} }, setAttribute() {}, removeAttribute() {}, reset() { this.resetCalled = true; course.value = ''; } };
  let submissions = 0;
  const context = { document: { querySelector: (selector) => ({ '#course-registration-form': form, '#registration-status': status, '#registration-availability': availability, '#registration-details': details })[selector] },
    window: { location: { protocol, search: '?course=' + encodeURIComponent(selected) } }, URLSearchParams, Intl, AbortSignal,
    FormData: class { *[Symbol.iterator]() { yield ['name', 'Audit Learner']; } },
    fetch: async (url) => {
      if (url.endsWith('/status')) return { ok: true, json: async () => ({ open, courses: open ? [courses[0]] : [] }) };
      submissions++; return response;
    },
  };
  vm.runInNewContext(fs.readFileSync(path.join(root, 'public/assets/course-registration.js'), 'utf8'), context);
  await new Promise(setImmediate);
  return { handlers, course, details, button, status, form, submissions: () => submissions };
}

test('client preselection, closed courses, validation and friendly failure recovery', async () => {
  for (const selected of courses) {
    const ui = await client({ selected }); assert.equal(ui.course.value, selected);
    assert.equal(ui.details.disabled, selected !== courses[0]);
  }
  for (const settings of [{ open: false }, { protocol: 'file:' }, { valid: false }]) {
    const ui = await client(settings); await ui.handlers.submit({ preventDefault() {} }); assert.equal(ui.submissions(), 0);
  }
  const ui = await client({ response: { ok: false, json: async () => { throw new SyntaxError('Internal parser details'); } } });
  await ui.handlers.submit({ preventDefault() {} });
  assert.equal(ui.status.dataset.state, 'error'); assert.ok(!ui.status.textContent.includes('parser'));
  assert.ok(!ui.form.resetCalled); assert.equal(ui.button.disabled, false);
});

test('client confirms acknowledged reference and retains selected course', async () => {
  const ui = await client({ response: { ok: true, json: async () => ({ received: true, reference: 'SS-audit' }) } });
  await ui.handlers.submit({ preventDefault() {} });
  assert.equal(ui.form.resetCalled, true); assert.equal(ui.course.value, courses[0]);
  assert.equal(ui.status.dataset.state, 'success'); assert.ok(ui.status.textContent.includes('SS-audit'));
});

test('Escape closes navigation and returns focus to its toggle', () => {
  const events = {}, classes = new Set();
  const attrs = { 'aria-expanded': 'false' };
  let click, focused = false;
  const toggle = { getAttribute: key => attrs[key], setAttribute: (key, value) => { attrs[key] = value; }, addEventListener: (_, fn) => { click = fn; }, focus: () => { focused = true; } };
  const nav = { querySelectorAll: () => [], addEventListener() {} };
  const header = { querySelector: selector => selector === 'nav' ? nav : toggle,
    classList: { contains: name => classes.has(name), toggle: (name, on) => on ? classes.add(name) : classes.delete(name) },
    getBoundingClientRect: () => ({ height: 80 }), contains: () => true };
  vm.runInNewContext(fs.readFileSync(path.join(root, 'public/assets/site-navigation.js'), 'utf8'), {
    document: { querySelectorAll: () => [header], addEventListener: (name, fn) => { events[name] = fn; } },
    window: { scrollY: 0, addEventListener() {} },
  });
  click(); assert.equal(attrs['aria-expanded'], 'true');
  events.keydown({ key: 'Escape' });
  assert.equal(attrs['aria-expanded'], 'false'); assert.equal(focused, true);
});
