(() => {
  const form = document.querySelector('#course-registration-form');
  const status = document.querySelector('#registration-status');
  if (!form || !status) return;

  const courseSelect = form.querySelector('[name="course"]');
  const requestedCourse = new URLSearchParams(window.location.search).get('course');
  if (requestedCourse && [...courseSelect.options].some((option) => option.value === requestedCourse)) {
    courseSelect.value = requestedCourse;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    status.removeAttribute('data-state');
    status.textContent = 'Sending your request…';

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
        body: new URLSearchParams(new FormData(form)),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Your request could not be sent.');
      status.dataset.state = 'success';
      status.textContent = result.message;
      form.reset();
    } catch (error) {
      status.dataset.state = 'error';
      status.textContent = error.message || 'We could not send your request. Please try again later.';
    } finally {
      button.disabled = false;
    }
  });
})();
