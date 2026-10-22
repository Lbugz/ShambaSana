(() => {
  const form = document.querySelector('#course-registration-form');
  if (!form) return;
  const status = document.querySelector('#registration-status');
  const availability = document.querySelector('#registration-availability');
  const course = form.querySelector('[name="course"]');
  const details = document.querySelector('#registration-details');
  const button = form.querySelector('button[type="submit"]');
  const timezone = form.querySelector('[name="timezone"]');
  const courseNote = document.querySelector('#registration-course-note');
  const psyche = form.querySelector('[name="psycheStatus"]');
  const psycheField = document.querySelector('#psyche-status-field');
  const terms = {
    'The Psyche in Chinese Medicine': 'Spring 2027',
    'Advanced Diagnosis & Treatment': 'Summer 2027',
  };
  let readiness = { open: false, courses: [] };
  let submitting = false;
  const closedMessage = 'Spring and Summer 2027 registration are open for eligible learners, but online submission is temporarily unavailable. You can prepare the form below; your details stay in this page until you submit. Please return once online submission is available.';

  const requested = new URLSearchParams(window.location.search).get('course');
  if ([...course.options].some((option) => option.value === requested && !option.disabled)) course.value = requested;
  if (timezone) timezone.value = Intl.DateTimeFormat().resolvedOptions().timeZone || '';

  function renderAvailability() {
    const enabled = readiness.open && readiness.courses.includes(course.value) && Boolean(terms[course.value]);
    details.disabled = submitting;
    const advanced = course.value === 'Advanced Diagnosis & Treatment';
    psycheField.hidden = !advanced;
    psyche.disabled = !advanced || submitting;
    psyche.required = advanced;
    courseNote.textContent = !terms[course.value] ? 'Choose a course to see its term and prerequisites.'
      : `${terms[course.value]} · Virtual online · $1,350. ${advanced ? 'Complete Courses I and II before starting.' : 'Complete Course I before starting.'} You may register while progressing through the earlier courses; admission requires prerequisite review. Exact dates and session times will be confirmed before payment.`;
    button.disabled = !enabled || submitting;
    button.textContent = submitting ? 'Submitting…' : enabled ? 'Submit course registration' : !course.value ? 'Select a course' : 'Online submission unavailable';
    availability.textContent = !readiness.open ? closedMessage : !course.value
      ? 'Select a course to check its registration availability.'
      : enabled ? 'Online registration is available for ' + terms[course.value] + '. Admission is subject to prerequisite review.'
      : 'Online submission for this course is temporarily unavailable. Your details have not been sent.';
  }
  course.addEventListener('change', () => {
    status.removeAttribute('data-state');
    status.textContent = 'Your details are sent only when you submit. Course prerequisites will be reviewed before admission.';
    renderAvailability();
  });
  renderAvailability();

  if (['http:', 'https:'].includes(window.location.protocol)) {
    fetch('/api/course-registration/status', { cache: 'no-store', signal: AbortSignal.timeout(8000) })
      .then(async (response) => {
        if (!response.ok) throw new Error('Unavailable');
        const data = await response.json();
        readiness = { open: data.open === true, courses: Array.isArray(data.courses) ? data.courses : [] };
        renderAvailability();
      })
      .catch(() => {
        renderAvailability();
        availability.textContent = 'Registration availability cannot be checked right now. Please try again later.';
      });
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (submitting || !readiness.open || !readiness.courses.includes(course.value) || !terms[course.value] || !form.reportValidity()) return;
    const selectedCourse = course.value;
    const body = new URLSearchParams(new FormData(form));
    submitting = true;
    course.disabled = true;
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
      try { result = await response.json(); } catch { throw new Error('We couldn’t send your registration. Your details are still here; please try again later.'); }
      if (!response.ok) {
        if (response.status === 503) {
          readiness = { open: false, courses: [] };
          throw new Error('Online submission is currently unavailable. Your registration has not been submitted.');
        }
        if (response.status === 429) throw new Error('Please wait a few minutes before trying again.');
        if (response.status === 400) throw new Error('Please check your details and selected course, then try again.');
        throw new Error('We couldn’t send your registration. Your details are still here; please try again later.');
      }
      if (result.received !== true || !result.reference) throw new Error('We couldn’t confirm receipt. Please try again later.');
      form.reset();
      course.value = selectedCourse;
      if (timezone) timezone.value = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      status.dataset.state = 'success';
      status.textContent = 'Registration received for ' + selectedCourse + ' — ' + terms[selectedCourse] + '. Reference: ' + result.reference + '. The Institute will review your prerequisite status and follow up with confirmed course details and enrollment terms before payment. Your place is not yet confirmed.';
      status.focus();
    } catch (error) {
      status.dataset.state = 'error';
      status.textContent = error.name === 'TimeoutError' || error.name === 'AbortError'
        ? 'The request took too long. Receipt is not confirmed; please try again later.'
        : error instanceof TypeError ? 'We couldn’t connect. Your details are still here; please check your connection and try again.'
        : error.message;
      status.focus();
    } finally {
      submitting = false;
      course.disabled = false;
      form.classList.remove('is-submitting');
      form.removeAttribute('aria-busy');
      renderAvailability();
    }
  });
})();
