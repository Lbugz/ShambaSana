(() => {
  const form = document.querySelector('#course-registration-form');
  if (!form) return;
  const status = document.querySelector('#registration-status');
  const availability = document.querySelector('#registration-availability');
  const course = form.querySelector('[name="course"]');
  const details = document.querySelector('#registration-details');
  const button = form.querySelector('button[type="submit"]');
  const timezone = form.querySelector('[name="timezone"]');
  let readiness = { open: false, courses: [] };
  let submitting = false;
  const closedMessage = 'Registration is not open yet. Cohort dates, session times and final student policies will be announced before enrollment opens.';

  const requested = new URLSearchParams(window.location.search).get('course');
  if ([...course.options].some((option) => option.value === requested)) course.value = requested;
  if (timezone) timezone.value = Intl.DateTimeFormat().resolvedOptions().timeZone || '';

  function renderAvailability() {
    const enabled = readiness.open && readiness.courses.includes(course.value);
    details.disabled = !enabled || submitting;
    button.disabled = !enabled || submitting;
    button.textContent = submitting ? 'Submitting…' : enabled ? 'Submit course registration' : 'Registration not open yet';
    availability.textContent = !readiness.open ? closedMessage : !course.value
      ? 'Select a course to check its registration availability.'
      : enabled ? 'Registration is open for ' + course.value + '.'
      : 'Registration for this upcoming course is not open yet. Please check again for cohort dates.';
  }
  course.addEventListener('change', () => {
    status.removeAttribute('data-state');
    status.textContent = 'Your details will only be collected when registration is open for your selected course.';
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
    if (submitting || !readiness.open || !readiness.courses.includes(course.value) || !form.reportValidity()) return;
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
          throw new Error('Registration is currently closed. Your registration has not been submitted.');
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
      status.textContent = 'Registration received for ' + selectedCourse + '. Reference: ' + result.reference + '. We’ll follow up with cohort details and payment instructions before your place is confirmed.';
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
