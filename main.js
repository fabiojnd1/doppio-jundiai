document.addEventListener('DOMContentLoaded', () => {
  const header = document.getElementById('header');
  const hamburger = document.getElementById('hamburger');
  const mobileOverlay = document.getElementById('mobile-overlay');
  const allScrollBtns = document.querySelectorAll('[data-scroll-to]');
  const mobileLinks = document.querySelectorAll('.mobile-link');
  const reveals = document.querySelectorAll('.reveal-section');

  // --- Sticky header ---
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });

  // --- Mobile menu ---
  function closeMenu() {
    hamburger.classList.remove('active');
    mobileOverlay.classList.remove('active');
    mobileOverlay.setAttribute('aria-hidden', 'true');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => {
    const isOpen = mobileOverlay.classList.toggle('active');
    hamburger.classList.toggle('active');
    mobileOverlay.setAttribute('aria-hidden', !isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  mobileLinks.forEach(l => l.addEventListener('click', closeMenu));

  // --- Smooth scroll for data-scroll-to buttons ---
  allScrollBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-scroll-to');
      const el = document.getElementById(id);
      if (el) {
        const headerOffset = 80;
        const elementPosition = el.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerOffset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
        closeMenu();
      }
    });
  });

  // --- Intersection Observer for reveal animations ---
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  reveals.forEach(el => observer.observe(el));

  // --- Lazer gallery ---
  const lazerMain = document.getElementById('lazer-gallery-main');
  const lazerThumbs = document.getElementById('lazer-gallery-thumbs');
  if (lazerMain && lazerThumbs) {
    const thumbs = lazerThumbs.querySelectorAll('img');
    thumbs.forEach(thumb => {
      thumb.addEventListener('click', () => {
        const mainImg = lazerMain.querySelector('img');
        mainImg.src = thumb.src;
        mainImg.alt = thumb.alt;
        thumbs.forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
      });
    });
  }

  // --- Plantas carousel ---
  const plantasTrack = document.getElementById('plantas-track');
  const plantasDots = document.getElementById('plantas-dots');
  const plantasPrev = document.getElementById('plantas-prev');
  const plantasNext = document.getElementById('plantas-next');

  if (plantasTrack && plantasDots) {
    const slides = plantasTrack.querySelectorAll('.plantas__slide');
    let currentSlide = 0;

    // Generate dots
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = `plantas__dot${i === 0 ? ' is-active' : ''}`;
      dot.setAttribute('aria-label', `Planta ${i + 1}`);
      dot.addEventListener('click', () => goToSlide(i));
      plantasDots.appendChild(dot);
    });

    function goToSlide(index) {
      slides[currentSlide].classList.remove('is-active');
      plantasDots.children[currentSlide].classList.remove('is-active');
      currentSlide = (index + slides.length) % slides.length;
      slides[currentSlide].classList.add('is-active');
      plantasDots.children[currentSlide].classList.add('is-active');
    }

    if (plantasPrev) plantasPrev.addEventListener('click', () => goToSlide(currentSlide - 1));
    if (plantasNext) plantasNext.addEventListener('click', () => goToSlide(currentSlide + 1));
  }

  // --- Detalhes tabs ---
  const detalheTabs = document.querySelectorAll('.detalhes__tab');
  const detalhePanels = document.querySelectorAll('.detalhes__panel');

  detalheTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const idx = tab.getAttribute('data-tab');

      detalheTabs.forEach(t => {
        t.classList.remove('is-active');
        t.setAttribute('aria-selected', 'false');
      });
      detalhePanels.forEach(p => {
        p.classList.remove('is-active');
        p.setAttribute('hidden', '');
      });

      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');
      const panel = document.getElementById(`panel-${idx}`);
      if (panel) {
        panel.classList.add('is-active');
        panel.removeAttribute('hidden');
      }
    });
  });

  // --- Phone mask ---
  document.querySelectorAll('input[type="tel"]').forEach(input => {
    input.addEventListener('input', (e) => {
      let v = e.target.value.replace(/\D/g, '');
      // If the number starts with Brazil's country code 55 and is longer than 11 digits, strip it
      if (v.length > 11 && v.startsWith('55')) {
        v = v.slice(2);
      }
      v = v.slice(0, 11);
      if (v.length > 6) v = `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`;
      else if (v.length > 2) v = `(${v.slice(0,2)}) ${v.slice(2)}`;
      else if (v.length > 0) v = `(${v}`;
      e.target.value = v;
    });
  });

  // --- Form handling ---
  const GOOGLE_SHEETS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbx_hBPEYV-ew3e9uBsJ31zizb8jF7gAvxHKnnkX1_KXd0qNdLpCmyweNzVkEC9MhaxYYg/exec';

  document.querySelectorAll('.lead-form').forEach(form => {
    const nomeInput = form.querySelector('input[type="text"]');
    const emailInput = form.querySelector('input[type="email"]');
    const telInput = form.querySelector('input[type="tel"]');

    // Remove invalid style dynamically on input
    [nomeInput, emailInput, telInput].forEach(input => {
      if (input) {
        input.addEventListener('input', () => {
          input.classList.remove('invalid');
        });
      }
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Simple client-side validation
      let isValid = true;
      
      if (nomeInput && !nomeInput.value.trim()) {
        nomeInput.classList.add('invalid');
        isValid = false;
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailInput && !emailRegex.test(emailInput.value.trim())) {
        emailInput.classList.add('invalid');
        isValid = false;
      }

      const phoneDigits = telInput ? telInput.value.replace(/\D/g, '') : '';
      if (telInput && phoneDigits.length < 10) {
        telInput.classList.add('invalid');
        isValid = false;
      }

      if (!isValid) {
        return; // Stop submission if fields are invalid
      }

      const btn = form.querySelector('.btn-submit');
      const orig = btn.textContent;
      btn.textContent = 'ENVIANDO...';
      btn.disabled = true;

      const urlEncodedData = new URLSearchParams();
      urlEncodedData.append('nome', nomeInput ? nomeInput.value : '');
      urlEncodedData.append('email', emailInput ? emailInput.value : '');
      urlEncodedData.append('telefone', telInput ? telInput.value : '');

      const sucesso = () => {
        btn.textContent = '✓ ENVIADO COM SUCESSO';
        btn.style.background = '#2d7a3a';
        btn.style.color = '#fff';
        setTimeout(() => {
          form.reset();
          btn.textContent = orig;
          btn.style.background = '';
          btn.style.color = '';
          btn.disabled = false;
        }, 3000);
      };

      if (GOOGLE_SHEETS_WEB_APP_URL === 'COLE_AQUI_O_LINK_DO_GOOGLE_APPS_SCRIPT') {
        // Se o link ainda não foi configurado, apenas simula o envio
        setTimeout(sucesso, 1200);
      } else {
        // Envia os dados para a planilha usando URLSearchParams
        fetch(GOOGLE_SHEETS_WEB_APP_URL, {
          method: 'POST',
          body: urlEncodedData,
          mode: 'no-cors'
        })
        .then(sucesso)
        .catch(err => {
          btn.textContent = 'ERRO AO ENVIAR';
          btn.style.background = '#c9302c';
          btn.style.color = '#fff';
          setTimeout(() => {
            btn.textContent = orig;
            btn.style.background = '';
            btn.style.color = '';
            btn.disabled = false;
          }, 3000);
        });
      }
    });
  });

  // --- Parallax on hero image ---
  const heroImg = document.querySelector('.hero__bg-img');
  if (heroImg) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y < window.innerHeight) {
        heroImg.style.transform = `scale(1.05) translateY(${y * 0.15}px)`;
      }
    }, { passive: true });
  }

  // --- Video player trigger ---
  const videoWrap = document.getElementById('video-wrap');
  if (videoWrap) {
    videoWrap.addEventListener('click', () => {
      videoWrap.innerHTML = `<iframe width="100%" style="aspect-ratio: 16/9; display: block; border-radius: 16px; border: none;" src="https://www.youtube.com/embed/1U55OffpfOI?autoplay=1" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
    });
    // Keyboard support
    videoWrap.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        videoWrap.click();
      }
    });
  }
});
