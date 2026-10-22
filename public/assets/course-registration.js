(() => {
  const form = document.querySelector('#course-registration-form');
  if (!form) return;
  const $ = selector => form.querySelector(selector);
  const status = $('#registration-status');
  const availability = $('#registration-availability');
  const course = $('[name="course"]');
  const semester = $('[name="semester"]');
  const format = $('[name="learningFormat"]');
  const timezone = $('[name="timezone"]');
  const reference = $('[name="reference"]');
  const name = $('[name="name"]');
  const email = $('[name="email"]');
  const next = $('#continue-registration');
  const submit = $('[type="submit"]');
  const picker = $('#course-picker');
  const change = document.querySelector('#change-course');
  const steps = [$('#step-details'), $('#step-review')];
  const terms = {
    'Foundations of Chinese Medicine': {1: 'Fall 2026', 2: 'Spring 2027', 3: 'Term to be confirmed'},
    'The Psyche in Chinese Medicine': {1: 'Proposed Spring 2027'},
    'Advanced Diagnosis & Treatment': {1: 'Proposed Summer 2027'},
  };
  const params = new URLSearchParams(location.search);
  let readiness = {open: false, courses: []};
  let checking = true;
  let submitting = false;
  let completed = false;
  let step = 1;
  let pickerSnapshot;
  const isFoundations = () => course.value === 'Foundations of Chinese Medicine';
  const isBeginner = () => isFoundations() && semester.value === '1';
  const isAdvanced = () => course.value === 'Advanced Diagnosis & Treatment';
  const selectedTerm = () => terms[course.value]?.[semester.value];
  const enabled = () => readiness.open && readiness.courses.includes(course.value) && !!selectedTerm();
  const inputGroups = name => [...form.querySelectorAll(`[name="${name}"]`)];
  reference.value = 'SS-' + crypto.randomUUID();
  try { timezone.value = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch { timezone.value = ''; }

  function updateOptions(preferred = semester.value) {
    semester.replaceChildren(...(isFoundations() ? [1,2,3] : [1]).map(number => new Option(`Semester ${number}${isFoundations() ? ' · ' + terms[course.value][number] : ''}`, String(number))));
    semester.value = [...semester.options].some(option => option.value === preferred) ? preferred : '1';
    $('#semester-picker-field').hidden = !isFoundations();
    $('#picker-format').textContent = isBeginner() ? 'Semester 1 is self-paced catch-up. Live cohort registration is closed.' : 'Live online · Final schedule confirmed before payment.';
  }
  const requested = params.get('course') || document.body.dataset.course;
  if (Object.hasOwn(terms, requested)) course.value = requested;
  updateOptions(params.get('semester') || document.body.dataset.semester || '1');

  function syncLink() {
    const slug = isFoundations() ? ({1:'foundations-semester-1-catch-up',2:'foundations-semester-2',3:'foundations-semester-3'})[semester.value]
      : course.value === 'The Psyche in Chinese Medicine' ? 'psyche-spring-2027' : isAdvanced() ? 'advanced-summer-2027' : null;
    if (slug && ['http:', 'https:'].includes(location.protocol)) {
      const prefix = location.pathname.startsWith('/institute/') ? '/institute' : '';
      history.replaceState(null, '', `${prefix}/register/${slug}`);
    }
  }
  function renderSelection() {
    format.value = isBeginner() ? 'self-paced' : 'live-online';
    document.querySelector('#registration-course-title').textContent = course.value || 'Choose your course';
    document.querySelector('#registration-course-meta').textContent = course.value ? `Semester ${semester.value} · ${selectedTerm()} · ${isBeginner() ? 'Self-paced catch-up' : 'Live online'}` : 'Select a course and semester to begin.';
    document.querySelector('#registration-course-price').textContent = !course.value ? '' : isFoundations() ? '$2,000 for this semester' : 'Tuition confirmed before payment';
    document.querySelector('#registration-course-note').textContent = !course.value ? 'Choose your study, then tell us a little about you.' : isBeginner() ? 'Join after the start, with an agreed catch-up plan.' : 'Previous study is reviewed before admission.';
    document.querySelector('#registration-tuition-detail').textContent = !course.value ? 'Choose your course to see its tuition information.' : isFoundations() ? 'Foundations spans three semesters at $2,000 each ($6,000 total). You choose and pay separately for each semester. Semester 1 catch-up is also $2,000; staff confirm its materials, support and completion plan.' : 'Tuition, semester structure and the final schedule for this course are being confirmed. You will receive those details before deciding to pay.';
    change.firstChild.textContent = course.value ? 'Change' : 'Choose course';
    $('#preparation-description').textContent = isBeginner() ? 'No previous study is required for Foundations Semester 1. Staff will confirm your catch-up plan before admission.' : 'Tell us about your previous study. You can apply while progressing through earlier courses; staff confirm eligibility.';
    const foundationsField = $('#foundations-status-field');
    foundationsField.hidden = isBeginner();
    foundationsField.setAttribute('aria-describedby','foundations-error');
    $('#psyche-status-field').hidden = !isAdvanced();
    $('#psyche-status-field').setAttribute('aria-describedby','psyche-error');
    $('#prior-cohort-field').hidden = isBeginner();
    renderControls();
    renderReview();
  }
  function renderControls() {
    const active = enabled() && !submitting && !completed;
    for (const input of form.querySelectorAll('#registration-details input, #registration-details textarea')) input.disabled = !active;
    for (const input of inputGroups('foundationsStatus')) { input.disabled = !active || isBeginner(); input.required = active && !isBeginner(); }
    for (const input of inputGroups('psycheStatus')) { input.disabled = !active || !isAdvanced(); input.required = active && isAdvanced(); }
    $('[name="priorCohort"]').disabled = !active || isBeginner();
    next.disabled = !active;
    submit.disabled = !active;
    change.disabled = submitting || completed;
    course.disabled = submitting;
    semester.disabled = submitting;
    $('#back-registration').disabled = submitting;
    $('#edit-registration').disabled = submitting;
    submit.firstChild.textContent = submitting ? 'Sending registration…' : 'Submit registration';
    availability.dataset.state = !checking && !enabled() ? 'unavailable' : 'ready';
    availability.textContent = checking ? 'Checking registration availability…' : enabled() ? '' : !course.value ? 'Choose your course to start registration.' : 'Online registration is unavailable for this selection. Please contact onlineclass@liferx.us. No details have been sent.';
    form.setAttribute('aria-busy', String(submitting));
  }
  function summaryRow(label, value) {
    const row = document.createElement('div');
    const dt = document.createElement('dt'); dt.textContent = label;
    const dd = document.createElement('dd'); dd.textContent = value;
    row.append(dt, dd); return row;
  }
  function renderReview() {
    const summary = $('#registration-review-summary');
    summary.replaceChildren(summaryRow('Student', name.value.trim() || 'Your name'), summaryRow('Email', email.value.trim() || 'Your email'), summaryRow('Study', `${course.value || 'Course not selected'} · Semester ${semester.value} · ${selectedTerm() || ''}`), summaryRow('Format', isBeginner() ? 'Self-paced catch-up' : 'Live online'));
  }
  function setStep(number, focus = true) {
    step = number;
    steps.forEach((section, index) => { section.hidden = index !== number - 1; });
    [$('#progress-details'),$('#progress-review')].forEach((item,index) => { if(index === number - 1) item.setAttribute('aria-current','step'); else item.removeAttribute('aria-current'); item.classList.toggle('is-complete',index < number - 1); });
    renderReview();
    if (focus) { const heading = $(number === 1 ? '#details-title' : '#review-title'); form.scrollIntoView({block:'start'}); heading.focus({preventScroll:true}); }
  }
  function fieldError(input, errorId, message) {
    const error = $('#' + errorId);
    error.textContent = message; error.hidden = !message;
    if (message) input.setAttribute('aria-invalid','true'); else input.removeAttribute('aria-invalid');
    return !message;
  }
  function validateDetails() {
    const validName = fieldError(name,'name-error',name.value.trim().length < 2 ? 'Enter your full name.' : '');
    const validEmail = fieldError(email,'email-error',!email.value.trim() || !email.validity.valid ? 'Enter a valid email address.' : '');
    if (!validName || !validEmail) { if(step !== 1) setStep(1,false); (!validName ? name : email).focus(); return false; }
    return true;
  }
  function validateReview() {
    let first;
    for (const [group, errorId, required] of [['foundationsStatus','foundations-error',!isBeginner()],['psycheStatus','psyche-error',isAdvanced()]]) {
      const inputs = inputGroups(group);
      const missing = required && !inputs.some(input => input.checked);
      const error = $('#' + errorId); error.hidden = !missing; error.textContent = missing ? 'Select your previous-study status.' : '';
      inputs.forEach(input => { if(missing) input.setAttribute('aria-invalid','true'); else input.removeAttribute('aria-invalid'); });
      if(missing && !first) first = inputs[0];
    }
    for (const [field,errorId,message] of [['prerequisiteAcknowledgement','preparation-error','Please acknowledge the admission review.'],['consent','consent-error','Please confirm your details and contact permission.']]) {
      const input = $(`[name="${field}"]`);
      if(!fieldError(input,errorId,input.checked ? '' : message) && !first) first = input;
    }
    if(first) { first.focus(); return false; }
    return true;
  }
  next.addEventListener('click',()=> { if(enabled() && validateDetails()) setStep(2); });
  $('#back-registration').addEventListener('click',()=>setStep(1));
  $('#edit-registration').addEventListener('click',()=>setStep(1));
  name.addEventListener('input',()=> { if(name.hasAttribute('aria-invalid') && name.value.trim().length >= 2) fieldError(name,'name-error',''); });
  email.addEventListener('input',()=> { if(email.hasAttribute('aria-invalid') && email.validity.valid && email.value) fieldError(email,'email-error',''); });
  form.addEventListener('change',event=> { if(event.target.type === 'radio' || event.target.type === 'checkbox') { event.target.removeAttribute('aria-invalid'); const groupError = event.target.name === 'foundationsStatus' ? $('#foundations-error') : event.target.name === 'psycheStatus' ? $('#psyche-error') : event.target.name === 'consent' ? $('#consent-error') : $('#preparation-error'); if(groupError) groupError.hidden = true; } });

  function closePicker(apply = false) {
    if(apply) {
      if(!course.value) { course.focus(); return; }
      if(pickerSnapshot?.course !== course.value || pickerSnapshot?.semester !== semester.value) {
        $('[name="consent"]').checked = false;
        $('[name="prerequisiteAcknowledgement"]').checked = false;
      }
      pickerSnapshot = undefined;
      renderSelection(); syncLink(); setStep(1,false); status.textContent = ''; status.removeAttribute('data-state');
    } else if(pickerSnapshot) { course.value = pickerSnapshot.course; updateOptions(pickerSnapshot.semester); pickerSnapshot = undefined; renderSelection(); }
    picker.close(); change.focus();
  }
  change.addEventListener('click',()=> { pickerSnapshot = {course:course.value,semester:semester.value}; updateOptions(); picker.showModal(); course.focus(); });
  $('#close-course-picker').addEventListener('click',()=>closePicker());
  picker.addEventListener('cancel',event=> { event.preventDefault(); closePicker(); });
  $('#apply-course').addEventListener('click',()=>closePicker(true));
  course.addEventListener('change',()=>updateOptions('1'));
  semester.addEventListener('change',()=> { $('#picker-format').textContent = isBeginner() ? 'Self-paced catch-up · An agreed learning plan after the semester starts.' : 'Live online · Final schedule confirmed before payment.'; });

  renderSelection(); setStep(1,false);
  if(['http:','https:'].includes(location.protocol)) {
    fetch('/api/course-registration/status',{cache:'no-store',signal:AbortSignal.timeout(8000)}).then(async response=> {
      if(!response.ok) throw new Error('Unavailable');
      const data = await response.json(); readiness = {open:data.open === true,courses:Array.isArray(data.courses) ? data.courses : []}; checking = false; renderControls();
    }).catch(()=> { checking = false; renderControls(); availability.textContent = 'We couldn’t check registration availability. Contact onlineclass@liferx.us for help.'; });
  } else { checking = false; renderControls(); }

  form.addEventListener('submit',async event=> {
    event.preventDefault();
    if(picker.open) { closePicker(true); return; }
    if(submitting || completed || !enabled()) return;
    if(step === 1) { if(validateDetails()) setStep(2); return; }
    if(!validateDetails() || !validateReview()) return;
    name.value = name.value.trim(); email.value = email.value.trim();
    const body = new URLSearchParams(new FormData(form));
    if(isBeginner()) body.set('foundationsStatus','not-started');
    const submitted = {course:course.value,semester:semester.value,term:selectedTerm(),email:email.value};
    submitting = true; renderControls(); status.removeAttribute('data-state'); status.textContent = 'Sending your registration…';
    try {
      const response = await fetch(form.action,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},body,signal:AbortSignal.timeout(12000)});
      let result;
      try { result = await response.json(); } catch { throw new Error('Receipt is not confirmed. Contact onlineclass@liferx.us before sending again.'); }
      if(!response.ok) {
        if(response.status === 400) throw new Error('Please check your details and preparation, then try again.');
        if(response.status === 429) throw new Error('Please wait a few minutes before trying again.');
        throw new Error('Receipt is not confirmed. Contact onlineclass@liferx.us before sending again.');
      }
      if(result.received !== true || !result.reference) throw new Error('Receipt is not confirmed. Contact onlineclass@liferx.us before sending again.');
      completed = true;
      document.querySelector('#success-course').textContent = `${submitted.course} · Semester ${submitted.semester} · ${submitted.term}`;
      document.querySelector('#success-reference').textContent = result.reference;
      document.querySelector('#success-next').textContent = `The Institute will review your preparation and email ${submitted.email} with the next steps and confirmed semester details.`;
      const success = document.querySelector('#registration-success'); form.hidden = true; success.hidden = false; success.focus(); success.scrollIntoView({block:'start'});
    } catch(error) {
      status.dataset.state = 'error'; status.textContent = error.name === 'TimeoutError' || error.name === 'AbortError' || error instanceof TypeError ? 'We couldn’t confirm receipt. Your answers are still here. Contact onlineclass@liferx.us before sending again.' : error.message; status.focus();
    } finally { submitting = false; renderControls(); }
  });
})();
