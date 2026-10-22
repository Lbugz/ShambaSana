(() => {
  const form = document.querySelector('#course-registration-form');
  if (!form) return;
  const status = document.querySelector('#registration-status');
  const availability = document.querySelector('#registration-availability');
  const course = form.querySelector('[name="course"]');
  const semester = form.querySelector('[name="semester"]');
  const format = form.querySelector('[name="learningFormat"]');
  const details = document.querySelector('#registration-details');
  const button = form.querySelector('button[type="submit"]');
  const timezone = form.querySelector('[name="timezone"]');
  const courseNote = document.querySelector('#registration-course-note');
  const foundationsStatus = form.querySelector('[name="foundationsStatus"]');
  const foundationsField = document.querySelector('#foundations-status-field');
  const reference = form.querySelector('[name="reference"]');
  const newReference = () => { reference.value = 'SS-' + crypto.randomUUID(); };
  newReference();
  const psyche = form.querySelector('[name="psycheStatus"]');
  const psycheField = document.querySelector('#psyche-status-field');
  const terms = {
    'Foundations of Chinese Medicine': { 1: 'Fall 2026', 2: 'Spring 2027', 3: 'To be confirmed' },
    'The Psyche in Chinese Medicine': { 1: 'Spring 2027' },
    'Advanced Diagnosis & Treatment': { 1: 'Summer 2027' },
  };
  const selectionTerm = () => terms[course.value]?.[semester.value];
  const params = new URLSearchParams(window.location.search);
  function syncSelectionLink() {
    const slug = course.value === 'Foundations of Chinese Medicine'
      ? ({ 1: 'foundations-semester-1-catch-up', 2: 'foundations-semester-2', 3: 'foundations-semester-3' })[semester.value]
      : course.value === 'The Psyche in Chinese Medicine' ? 'psyche-spring-2027'
      : course.value === 'Advanced Diagnosis & Treatment' ? 'advanced-summer-2027' : null;
    if (slug && ['http:', 'https:'].includes(location.protocol)) {
      const prefix = location.pathname.startsWith('/institute/') ? '/institute' : '';
      history.replaceState(null, '', `${prefix}/register/${slug}`);
      if (document.body.classList.contains('registration-direct')) {
        document.querySelector('#registration-title').textContent = course.value + (course.value === 'Foundations of Chinese Medicine' ? ` — Semester ${semester.value}${semester.value === '1' ? ' catch-up' : ''}` : '');
        document.querySelector('.registration-intro > p:not(.eyebrow)').textContent = 'Complete your registration below. We review your preparation and confirm the semester details before you decide to pay.';
      }
    }
  }
  function updateOptions() {
    const foundations = course.value === 'Foundations of Chinese Medicine';
    const previousSemester = semester.value;
    semester.replaceChildren(...(foundations ? [1, 2, 3] : [1]).map((value) => {
      const option = new Option(`Semester ${value}${!foundations ? '' : value === 2 ? ' — Spring 2027' : value === 3 ? ' — Term TBD' : ' — Fall 2026'}`, String(value));
      return option;
    }));
    if ([...semester.options].some(option => option.value === previousSemester)) semester.value = previousSemester;
    updateFormat();
  }
  function updateFormat() {
    const catchUp = course.value === 'Foundations of Chinese Medicine' && semester.value === '1';
    format.replaceChildren(new Option(catchUp ? 'Self-paced catch-up' : 'Live online', catchUp ? 'self-paced' : 'live-online'));
  }
  let readiness = { open: false, courses: [] };
  let checkingAvailability = ['http:', 'https:'].includes(window.location.protocol);
  let submitting = false;
  const closedMessage = 'Online submission is unavailable. No details have been sent. Please email onlineclass@liferx.us for enrollment support.';

  const requested = params.get('course') || document.body.dataset.course;
  if ([...course.options].some((option) => option.value === requested && !option.disabled)) course.value = requested;
  updateOptions();
  const requestedSemester = params.get('semester') || document.body.dataset.semester;
  if ([...semester.options].some(option => option.value === requestedSemester)) semester.value = requestedSemester;
  updateFormat();
  if (timezone) timezone.value = Intl.DateTimeFormat().resolvedOptions().timeZone || '';

  function renderAvailability() {
    const enabled = readiness.open && readiness.courses.includes(course.value) && Boolean(selectionTerm());
    details.disabled = !enabled || submitting;
    const advanced = course.value === 'Advanced Diagnosis & Treatment';
    psycheField.hidden = !advanced;
    psyche.disabled = !advanced || !enabled || submitting;
    psyche.required = advanced && enabled;
    const foundations = course.value === 'Foundations of Chinese Medicine';
    const beginner = foundations && semester.value === '1';
    foundationsField.hidden = beginner;
    foundationsStatus.disabled = beginner || !enabled || submitting;
    foundationsStatus.required = !beginner && enabled;
    courseNote.textContent = !selectionTerm() ? 'Choose your course, semester and study format.'
      : foundations ? `Foundations · Semester ${semester.value} · ${selectionTerm()} · $2,000 per semester. ${semester.value === '1' ? 'Self-paced catch-up: staff confirm materials, support and completion arrangements before admission.' : 'Wednesdays and Fridays · Eastern Time (EST/EDT) · Times and dates TBD. Continuation and previous study are reviewed.'} Pay only for this semester; no automatic continuation charge.`
      : `${course.value} · ${selectionTerm()} · Virtual online. ${advanced ? 'Foundations and Psyche' : 'Foundations'} preparation is reviewed. Semester structure, tuition and schedule are confirmed before payment.`;
    button.disabled = !enabled || submitting;
    button.textContent = submitting ? 'Submitting…' : checkingAvailability ? 'Checking availability…' : enabled ? 'Submit registration' : !course.value ? 'Select a course' : 'Online submission unavailable';
    availability.textContent = checkingAvailability ? 'Checking registration availability…' : !readiness.open ? closedMessage : !course.value
      ? 'Select a course to check its registration availability.'
      : enabled ? 'Registration requests are available for this selection. Admission and any catch-up arrangements require staff review.'
      : 'Online submission for this course is not enabled yet. Email onlineclass@liferx.us to request enrollment review. Your details have not been sent.';
  }
  course.addEventListener('change', () => {
    status.removeAttribute('data-state');
    status.textContent = 'Your details are sent only when you submit. Course prerequisites will be reviewed before admission.';
    updateOptions();
    renderAvailability();
    syncSelectionLink();
  });
  semester.addEventListener('change', () => { updateFormat(); renderAvailability(); syncSelectionLink(); });
  renderAvailability();

  if (['http:', 'https:'].includes(window.location.protocol)) {
    fetch('/api/course-registration/status', { cache: 'no-store', signal: AbortSignal.timeout(8000) })
      .then(async (response) => {
        if (!response.ok) throw new Error('Unavailable');
        const data = await response.json();
        readiness = { open: data.open === true, courses: Array.isArray(data.courses) ? data.courses : [] };
        checkingAvailability = false;
        renderAvailability();
      })
      .catch(() => {
        checkingAvailability = false;
        renderAvailability();
        availability.textContent = 'Registration availability cannot be checked right now. Please try again later.';
      });
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (submitting || !readiness.open || !readiness.courses.includes(course.value) || !selectionTerm() || !form.reportValidity()) return;
    const selectedCourse = course.value;
    const selectedSemester = semester.value;
    const selectedFormat = format.value;
    const selectedTerm = selectionTerm();
    const body = new URLSearchParams(new FormData(form));
    if (selectedCourse === 'Foundations of Chinese Medicine' && selectedSemester === '1') body.set('foundationsStatus', 'not-started');
    submitting = true;
    course.disabled = true;
    semester.disabled = true;
    format.disabled = true;
    form.classList.add('is-submitting');
    form.setAttribute('aria-busy', 'true');
    status.removeAttribute('data-state');
    status.textContent = 'Sending your registration…';
    renderAvailability();
    try {
      const response = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
        body,
        signal: AbortSignal.timeout(12000),
      });
      let result;
      try { result = await response.json(); } catch { throw new Error('We couldn’t confirm receipt. Your details are still here. Contact onlineclass@liferx.us before sending again.'); }
      if (!response.ok) {
        if (response.status === 503) {
          readiness = { open: false, courses: [] };
          throw new Error('Online submission is currently unavailable. Your registration has not been submitted.');
        }
        if (response.status === 429) throw new Error('Please wait a few minutes before trying again.');
        if (response.status === 400) throw new Error('Please check your details and selected course, then try again.');
        throw new Error('We couldn’t confirm receipt. Your details are still here. Contact onlineclass@liferx.us before sending again.');
      }
      if (result.received !== true || !result.reference) throw new Error('We couldn’t confirm receipt. Contact onlineclass@liferx.us before sending again.');
      form.reset();
      newReference();
      course.value = selectedCourse;
      updateOptions();
      semester.value = selectedSemester;
      updateFormat();
      format.value = selectedFormat;
      if (timezone) timezone.value = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      status.dataset.state = 'success';
      status.textContent = 'Registration received for ' + selectedCourse + ' — Semester ' + selectedSemester + ' · ' + selectedTerm + '. Reference: ' + result.reference + '. The Institute will review your prerequisite status and follow up with confirmed course details and enrollment terms before payment. Your place is not yet confirmed.';
      status.focus();
    } catch (error) {
      status.dataset.state = 'error';
      status.textContent = error.name === 'TimeoutError' || error.name === 'AbortError'
        ? 'Receipt is not confirmed. Contact onlineclass@liferx.us with your email address before sending again.'
        : error instanceof TypeError ? 'We couldn’t confirm receipt. Your details are still here. Contact onlineclass@liferx.us before sending again.'
        : error.message;
      status.focus();
    } finally {
      submitting = false;
      course.disabled = false;
      semester.disabled = false;
      format.disabled = false;
      form.classList.remove('is-submitting');
      form.removeAttribute('aria-busy');
      renderAvailability();
    }
  });
})();
