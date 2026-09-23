// PINKY Wristband — site behaviour

// Change this to the inbox that should receive demo and pilot requests.
const CONTACT_EMAIL = 'pinkywristband.team@yahoo.com';

(function () {
  document.documentElement.classList.remove('no-js');

  // Year in footer
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // Contact email link
  const emailLink = document.getElementById('contactEmailLink');
  if (emailLink) { emailLink.href = 'mailto:' + CONTACT_EMAIL; emailLink.textContent = CONTACT_EMAIL; }

  // Sticky nav border
  const nav = document.querySelector('.nav');
  const onScroll = () => nav && nav.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile menu
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  if (toggle && links) {
    const setOpen = (open) => {
      links.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
    links.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
  }

  // Reveal on scroll
  const items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach((el) => io.observe(el));
  } else {
    items.forEach((el) => el.classList.add('is-in'));
  }

  // Play the product video when it scrolls into view (muted, respects reduced motion)
  const video = document.querySelector('.video video');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (video && !reduce && 'IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { video.preload = 'auto'; video.play().catch(() => {}); }
        else video.pause();
      });
    }, { threshold: 0.4 }).observe(video);
  }

  // Contact form → opens the visitor's email app with the details filled in.
  // (A static site has no server. To collect requests without email, point the
  //  form at a service like Formspree or Netlify Forms. See README.md.)
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let ok = true;
      ['name', 'daycare', 'email'].forEach((n) => {
        const f = form.elements[n];
        const bad = !f.value.trim() || (n === 'email' && !/^\S+@\S+\.\S+$/.test(f.value));
        f.setAttribute('aria-invalid', String(bad));
        if (bad) ok = false;
      });
      if (!ok) {
        status.textContent = 'Please fill in your name, daycare name and a valid email.';
        status.classList.add('is-error');
        return;
      }
      const d = Object.fromEntries(new FormData(form));
      const subject = `PINKY: ${d.interest} for ${d.daycare}`;
      const body = [
        `Name: ${d.name}`, `Daycare: ${d.daycare}`, `Email: ${d.email}`,
        `Children: ${d.children}`, `Interested in: ${d.interest}`, '', d.message || ''
      ].join('\n');
      window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      status.classList.remove('is-error');
      status.textContent = 'Your email app should open with your message ready to send.';
    });
  }
})();
