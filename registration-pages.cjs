// Public, server-rendered pages let messaging crawlers read each course preview.
const origin = 'https://institute.shambasana.com';
const offerings = {
  'foundations-semester-1-catch-up': { course: 'Foundations of Chinese Medicine', semester: 1, format: 'self-paced', title: 'Foundations — Semester 1 catch-up', description: 'Join Foundations of Chinese Medicine through reviewed self-paced catch-up. Fall 2026 · $2,000 for Semester 1. Register online; admission and payment follow separately.', image: 'foundations' },
  'foundations-semester-2': { course: 'Foundations of Chinese Medicine', semester: 2, format: 'live-online', title: 'Foundations — Semester 2', description: 'Register for Foundations Semester 2. Spring 2027 · Live online · $2,000. Previous study and final schedule are reviewed before enrollment and payment.', image: 'foundations' },
  'foundations-semester-3': { course: 'Foundations of Chinese Medicine', semester: 3, format: 'live-online', title: 'Foundations — Semester 3', description: 'Request Foundations Semester 3 enrollment review. Live online · $2,000. Term and schedule to be confirmed. Separate registration and payment for this semester.', image: 'foundations' },
  'psyche-spring-2027': { course: 'The Psyche in Chinese Medicine', semester: 1, format: 'live-online', title: 'The Psyche in Chinese Medicine — Spring 2027', description: 'Register for enrollment review for the proposed Spring 2027 intake. Live online with Dumisani Kambi-Shamba. Prior study, schedule and tuition confirmed before payment.', image: 'psyche' },
  'advanced-summer-2027': { course: 'Advanced Diagnosis & Treatment', semester: 1, format: 'live-online', title: 'Advanced Diagnosis & Treatment — Summer 2027', description: 'Register for enrollment review for the proposed Summer 2027 intake. Foundations and Psyche preparation required; schedule and tuition confirmed before payment.', image: 'advanced' },
};
const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
function socialHead({ title, description, url, image, site = 'Shamba Sana Institute' }) {
  const values = { 'og:type': 'website', 'og:site_name': site, 'og:title': title, 'og:description': description, 'og:url': url, 'og:image': image, 'og:image:width': '1200', 'og:image:height': '630', 'og:image:alt': title, 'twitter:card': 'summary_large_image', 'twitter:title': title, 'twitter:description': description, 'twitter:image': image };
  return `<title>${escape(title)}</title><meta name="description" content="${escape(description)}"><link rel="canonical" href="${escape(url)}">` + Object.entries(values).map(([key, value]) => `<meta ${key.startsWith('og:') ? 'property' : 'name'}="${key}" content="${escape(value)}">`).join('');
}
function registrationPage(html, offering, slug) {
  const title = offering ? offering.title : 'Course registration';
  const description = offering?.description || 'Register for online Chinese medicine study at the Shamba Sana Institute. Choose your course and semester. Admission is reviewed; payment follows separately.';
  const url = slug ? `${origin}/register/${slug}` : `${origin}/registration.html`;
  html = html.replace(/<title>[\s\S]*?<\/title>/i, '').replace(/<meta name="description"[^>]*>/i, '');
  html = html.replace('<head>', '<head><base href="/institute/">');
  html = html.replace('</head>', `${socialHead({title: `${title} | Shamba Sana Institute`, description, url, image: `${origin}/assets/share-${offering?.image || 'institute'}.png`})}</head>`);
  if (offering) {
    html = html.replace('<body class="registration-body">', `<body class="registration-body registration-direct" data-course="${escape(offering.course)}" data-semester="${offering.semester}" data-format="${offering.format}">`);
    html = html.replace(/<h1 id="registration-title">[\s\S]*?<\/h1>/, `<h1 id="registration-title">${escape(title)}</h1>`);
    html = html.replace('Choose your course, semester and study format. We’ll review your preparation and send confirmed details before you decide to pay.', escape(description));
  }
  return html;
}
module.exports = { offerings, registrationPage, socialHead };
