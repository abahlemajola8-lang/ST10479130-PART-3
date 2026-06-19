(function(){
  let lastScroll = 0;
  const header = document.querySelector('header');
  if(!header) return;

  const THRESHOLD = 80; // pixels before hiding on first scroll

  window.addEventListener('scroll', () => {
    const current = window.scrollY || window.pageYOffset;
    // add a class on body when we have scrolled at all (optional visual)
    if(current > 10) document.body.classList.add('scrolled'); else document.body.classList.remove('scrolled');

    if (current > lastScroll && current > THRESHOLD) {
      // scrolling down
      header.classList.add('hidden');
    } else {
      // scrolling up
      header.classList.remove('hidden');
    }
    lastScroll = current <= 0 ? 0 : current; // For Mobile or negative scroll
  }, {passive:true});
})();

(function(){
  const form = document.querySelector('form');
  if(!form) return;

  const submit = form.querySelector('input[type="submit"], button[type="submit"]');
  if(!submit) return;

  // status node (aria-live for accessibility)
  let status = form.querySelector('.form-status');
  if(!status){
    status = document.createElement('div');
    status.className = 'form-status';
    status.setAttribute('aria-live', 'polite');
    status.style.marginTop = '8px';
    form.appendChild(status);
  }

  function setSubmitText(text){
    if(submit.tagName.toLowerCase() === 'input') submit.value = text; else submit.textContent = text;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    status.textContent = '';

    // Basic client-side validation: check required controls
    const required = Array.from(form.querySelectorAll('[required]'));
    for(const el of required){
      if(!el.value || el.value.trim() === ''){
        status.textContent = 'Message was not sent / an error occurred — please re-enter your credentials.';
        status.style.color = 'red';
        return;
      }
    }

    setSubmitText('Sending...');
    submit.disabled = true;

    const action = (form.getAttribute('action') || '').trim();

    // If action is a mailto: link, try to open the mail client. We can't detect success reliably,
    // so we provide guidance to the user and treat lack of mail client as a possible error.
    if(action.toLowerCase().startsWith('mailto:')){
      // build simple mailto body from form fields
      const subject = encodeURIComponent(form.getAttribute('data-subject') || 'Contact form message');
      let body = '';
      for(const el of Array.from(form.elements)){
        if(!el.name) continue;
        if(el.type === 'submit' || el.type === 'button') continue;
        body += `${el.name}: ${el.value}\n`;
      }
      const mailto = action + '?subject=' + subject + '&body=' + encodeURIComponent(body);
      try{
        window.location.href = mailto;
        // give user quick feedback; we cannot detect mail client success
        status.textContent = 'If your mail client opened the message will be sent from there. If not, message was not sent — please re-enter your credentials.';
        status.style.color = 'orange';
        setTimeout(() => setSubmitText('Sent'), 1000);
      } catch (err){
        status.textContent = 'Message was not sent / an error occurred — please re-enter your credentials.';
        status.style.color = 'red';
        submit.disabled = false;
        setSubmitText('Send');
      }
      return;
    }

    // If action is an HTTP endpoint, try to POST via fetch
    if(action.toLowerCase().startsWith('http')){
      const fd = new FormData(form);
      fetch(action, { method: (form.method || 'POST').toUpperCase(), body: fd })
        .then(res => {
          if(res.ok){
            status.textContent = 'Sent';
            status.style.color = 'green';
            setSubmitText('Sent');
          } else {
            throw new Error('Network response not OK');
          }
        })
        .catch(() => {
          status.textContent = 'Message was not sent / an error occurred — please re-enter your credentials.';
          status.style.color = 'red';
          submit.disabled = false;
          setSubmitText('Send');
        });
      return;
    }

    // Unknown or missing action — best effort fallback
    status.textContent = 'Message was not sent / an error occurred — please re-enter your credentials.';
    status.style.color = 'red';
    submit.disabled = false;
    setSubmitText('Send');
  });
})();

(function(){
  // reveal-on-scroll using IntersectionObserver
  const selectors = 'main section, main h1, main h2, main h3, .details, img';
  const els = Array.from(document.querySelectorAll(selectors));
  if(!els.length) return;
  els.forEach(el => el.classList.add('reveal'));

  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('in-view');
        obs.unobserve(entry.target);
      }
    });
  }, {threshold: 0.15, rootMargin: '0px 0px -10% 0px'});

  els.forEach(el => io.observe(el));
})();

// Page-ready class for page-load animations
(function(){
  // Add `.page-ready` after rendering so CSS transition runs
  if(document.readyState === 'complete' || document.readyState === 'interactive'){
    requestAnimationFrame(() => document.body.classList.add('page-ready'));
  } else {
    window.addEventListener('DOMContentLoaded', () => requestAnimationFrame(() => document.body.classList.add('page-ready')));
  }
})();
