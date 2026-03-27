/* ════════════════════════════════════════════════
   MAIN.JS — WE SEE YOU, PHIL.
   GSAP + Locomotive Scroll
════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ─── Custom Ease ──────────────────────────────
  CustomEase.create('sharpIn', 'M0,0 C0.19,1 0.22,1 1,1');
  CustomEase.create('brutalist', 'M0,0 C0.4,0 0.6,1 1,1');

  // ─── Register ScrollTrigger ───────────────────
  gsap.registerPlugin(ScrollTrigger, CustomEase);

  // ─── Locomotive Scroll ────────────────────────
  const locoScroll = new LocomotiveScroll({
    el: document.querySelector('#scroll-container'),
    smooth: true,
    multiplier: 0.9,
    lerp: 0.07,
  });

  // Sync Loco + ScrollTrigger
  locoScroll.on('scroll', ScrollTrigger.update);

  ScrollTrigger.scrollerProxy('#scroll-container', {
    scrollTop(value) {
      return arguments.length
        ? locoScroll.scrollTo(value, { duration: 0, disableLerp: true })
        : locoScroll.scroll.instance.scroll.y;
    },
    getBoundingClientRect() {
      return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
    },
    pinType: 'transform',
  });

  ScrollTrigger.addEventListener('refresh', () => locoScroll.update());
  ScrollTrigger.refresh();

  // ─── Custom Cursor ────────────────────────────
  const cursor   = document.getElementById('cursor');
  const follower = document.getElementById('cursor-follower');

  let mouseX = 0, mouseY = 0;
  let followerX = 0, followerY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top  = mouseY + 'px';
  });

  // Smooth follower via rAF
  function animateFollower() {
    followerX += (mouseX - followerX) * 0.12;
    followerY += (mouseY - followerY) * 0.12;
    follower.style.left = followerX + 'px';
    follower.style.top  = followerY + 'px';
    requestAnimationFrame(animateFollower);
  }
  animateFollower();

  // Hover states
  document.querySelectorAll('a, button, .video-cell__inner, .testimonial-card').forEach((el) => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('cursor--hover');
      follower.classList.add('cursor-follower--hover');
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('cursor--hover');
      follower.classList.remove('cursor-follower--hover');
    });
  });

  // ─── Utility: Split text into chars ──────────
  function splitIntoChars(el) {
    const text = el.textContent;
    el.textContent = '';
    el.setAttribute('aria-label', text);
    text.split('').forEach((char) => {
      const span = document.createElement('span');
      span.className = 'split-char';
      span.textContent = char === ' ' ? '\u00A0' : char;
      el.appendChild(span);
    });
    return el.querySelectorAll('.split-char');
  }

  // ─── Utility: Split text into words ──────────
  function splitIntoWords(el) {
    const rawText = el.innerHTML;
    const words = rawText.split(/(\s+)/);
    el.innerHTML = '';
    words.forEach((part) => {
      if (/^\s+$/.test(part)) {
        el.insertAdjacentHTML('beforeend', part);
      } else {
        const wrap  = document.createElement('span');
        wrap.className = 'word';
        const inner = document.createElement('span');
        inner.className = 'word-inner';
        inner.textContent = part;
        wrap.appendChild(inner);
        el.appendChild(wrap);
      }
    });
    return el.querySelectorAll('.word-inner');
  }

  // ─── HERO ANIMATION ───────────────────────────
  const heroTl = gsap.timeline({ delay: 0.2 });

  // Split title words
  document.querySelectorAll('.split-word').forEach((word) => {
    splitIntoChars(word);
  });

  const allChars = document.querySelectorAll('.hero__title .split-char');

  heroTl
    .to('.hero__eyebrow', {
      opacity: 1,
      duration: 0.6,
      ease: 'brutalist',
    })
    .to(allChars, {
      y: '0%',
      duration: 0.8,
      stagger: 0.025,
      ease: 'sharpIn',
    }, '-=0.2')
    .to('.hero__subtitle p', {
      y: 0,
      opacity: 1,
      duration: 0.7,
      ease: 'brutalist',
    }, '-=0.3')
    .to('.hero__scroll-cue', {
      opacity: 1,
      duration: 0.5,
      ease: 'none',
    }, '-=0.2');

  // ─── STATEMENT SECTION ────────────────────────
  const stEl = document.querySelector('.statement__body p');
  const wordInners = splitIntoWords(stEl);

  ScrollTrigger.create({
    trigger: '.s-statement',
    scroller: '#scroll-container',
    start: 'top 80%',
    end: 'bottom 30%',
    onEnter: () => {
      gsap.to(wordInners, {
        y: '0%',
        duration: 0.9,
        stagger: 0.018,
        ease: 'sharpIn',
      });
    },
    once: true,
  });

  // ─── VIDEO SECTION — Hover preview (muted) + click for sound ────
  document.querySelectorAll('.video-cell__inner').forEach((cell) => {
    const video = cell.querySelector('video');
    const tag   = cell.querySelector('.video-cell__tag');

    cell.addEventListener('mouseenter', () => {
      video.muted = true;
      video.play().catch(() => {});
    });

    cell.addEventListener('mouseleave', () => {
      video.pause();
      video.currentTime = 0;
      video.muted = true;
      tag.textContent = '[ PLAY ]';
    });

    cell.addEventListener('click', () => {
      if (video.muted) {
        video.muted = false;
        video.play().catch(() => {});
        tag.textContent = '[ SOUND ON ]';
      } else {
        video.muted = true;
        tag.textContent = '[ PLAY ]';
      }
    });
  });

  // ─── TESTIMONIALS — Drag-to-scroll ────────────
  const trackWrap = document.getElementById('testimonials-track-wrap');
  let isDragging = false;
  let dragStartX = 0;
  let dragScrollLeft = 0;

  trackWrap.addEventListener('mousedown', (e) => {
    isDragging = true;
    dragStartX = e.pageX - trackWrap.getBoundingClientRect().left;
    dragScrollLeft = trackWrap.scrollLeft;
  });

  document.addEventListener('mouseup', () => { isDragging = false; });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - trackWrap.getBoundingClientRect().left;
    trackWrap.scrollLeft = dragScrollLeft - (x - dragStartX) * 1.5;
  });

  // Touch
  trackWrap.addEventListener('touchstart', (e) => {
    dragStartX = e.touches[0].pageX;
    dragScrollLeft = trackWrap.scrollLeft;
  }, { passive: true });

  trackWrap.addEventListener('touchmove', (e) => {
    const dx = e.touches[0].pageX - dragStartX;
    trackWrap.scrollLeft = dragScrollLeft - dx;
  }, { passive: true });

  // ─── CV SECTION — Data Scramble ───────────────
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&/\\[]{}!?';

  function scrambleText(el, finalText, duration = 1000) {
    const steps = 18;
    const stepTime = duration / steps;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      const progress = step / steps;
      const revealedCount = Math.floor(finalText.length * progress);

      let display = '';
      for (let i = 0; i < finalText.length; i++) {
        if (finalText[i] === ' ') {
          display += ' ';
        } else if (i < revealedCount) {
          display += finalText[i];
        } else {
          display += CHARS[Math.floor(Math.random() * CHARS.length)];
        }
      }
      el.textContent = display;

      if (step >= steps) {
        clearInterval(interval);
        el.textContent = finalText;
      }
    }, stepTime);
  }

  document.querySelectorAll('.scramble-text').forEach((el) => {
    const original = el.getAttribute('data-original');
    ScrollTrigger.create({
      trigger: el,
      scroller: '#scroll-container',
      start: 'top 85%',
      once: true,
      onEnter: () => scrambleText(el, original, 900),
    });
  });

  // ─── CV IMAGE PARALLAX ────────────────────────
  gsap.to('.cv__image', {
    yPercent: -8,
    ease: 'none',
    scrollTrigger: {
      trigger: '.cv__image-wrap',
      scroller: '#scroll-container',
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
    },
  });

  // ─── FOOTER TEXT REVEAL ───────────────────────
  const footerChars = splitIntoChars(document.getElementById('footer-text'));

  gsap.fromTo(
    footerChars,
    { y: '110%' },
    {
      y: '0%',
      duration: 1.0,
      stagger: 0.015,
      ease: 'sharpIn',
      scrollTrigger: {
        trigger: '.s-footer',
        scroller: '#scroll-container',
        start: 'top 85%',
        once: true,
      },
    }
  );

  // ─── SECTION HEADER ENTRANCE ──────────────────
  document.querySelectorAll('.section-header__title').forEach((el) => {
    gsap.fromTo(
      el,
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.9,
        ease: 'brutalist',
        scrollTrigger: {
          trigger: el,
          scroller: '#scroll-container',
          start: 'top 88%',
          once: true,
        },
      }
    );
  });

  // ─── CV BLOCKS STAGGER IN ─────────────────────
  gsap.fromTo(
    '.cv__block',
    { y: 50, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      stagger: 0.15,
      duration: 0.8,
      ease: 'brutalist',
      scrollTrigger: {
        trigger: '.cv__grid',
        scroller: '#scroll-container',
        start: 'top 80%',
        once: true,
      },
    }
  );

  // ─── VIDEO CELLS STAGGER IN ───────────────────
  gsap.fromTo(
    '.video-cell',
    { y: 40, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      stagger: 0.1,
      duration: 0.7,
      ease: 'brutalist',
      scrollTrigger: {
        trigger: '.videos__grid',
        scroller: '#scroll-container',
        start: 'top 82%',
        once: true,
      },
    }
  );

  // ─── Refresh after all setup ──────────────────
  // Must refresh Loco AFTER ScrollTrigger so it accounts for pin-spacers
  window.addEventListener('load', () => {
    locoScroll.update();
    ScrollTrigger.refresh();
    setTimeout(() => locoScroll.update(), 300);
  });

})();
