document.addEventListener('DOMContentLoaded', () => {
    const toggleModeButton = document.getElementById('toggleMode');
    const toggleModeMobileButton = document.getElementById('toggleModeMobile');
    const reduceMotionButton = document.getElementById('reduceMotion');
    const reduceMotionMobileButton = document.getElementById('reduceMotionMobile');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const form = document.getElementById('petitionForm');
    const signatureList = document.querySelector('#signatureList ul');
    const signatureCountDisplay = document.getElementById('signatureCount');
    const modal = document.getElementById('thankYouModal');
    const closeModalBtn = document.getElementById('closeModal');
    const modalMessage = document.getElementById('modalMessage');
    const modalImage = document.getElementById('modalImage');
    const formError = document.getElementById('formError');
    const backToTopBtn = document.getElementById('backToTop');

    // --- Mobile menu ---
    mobileMenuBtn.addEventListener('click', () => {
      const isOpen = !mobileMenu.classList.contains('hidden');
      mobileMenu.classList.toggle('hidden');
      mobileMenuBtn.setAttribute('aria-expanded', String(!isOpen));
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
      });
    });

    // --- Dark mode ---
    function applyDarkMode(isDark) {
      document.body.classList.toggle('dark', isDark);
      document.body.classList.toggle('light', !isDark);
      // Tailwind v3 dark mode requires the class on <html> when darkMode: 'class'
      document.documentElement.classList.toggle('dark', isDark);
      const pressed = String(isDark);
      toggleModeButton.setAttribute('aria-pressed', pressed);
      toggleModeMobileButton.setAttribute('aria-pressed', pressed);
      localStorage.setItem('darkMode', isDark ? '1' : '0');
    }

    applyDarkMode(localStorage.getItem('darkMode') === '1');

    toggleModeButton.addEventListener('click', () => applyDarkMode(!document.documentElement.classList.contains('dark')));
    toggleModeMobileButton.addEventListener('click', () => applyDarkMode(!document.documentElement.classList.contains('dark')));

    // --- Reduce motion ---
    function applyReduceMotion(reduce) {
      document.body.classList.toggle('reduce-motion', reduce);
      const label = reduce ? 'Enable Motion' : 'Reduce Motion: OFF';
      reduceMotionButton.textContent = label;
      reduceMotionMobileButton.textContent = label;
      reduceMotionButton.setAttribute('aria-pressed', String(reduce));
      reduceMotionMobileButton.setAttribute('aria-pressed', String(reduce));
      localStorage.setItem('reduceMotion', reduce ? '1' : '0');
    }

    applyReduceMotion(localStorage.getItem('reduceMotion') === '1');

    reduceMotionButton.addEventListener('click', () => applyReduceMotion(!document.body.classList.contains('reduce-motion')));
    reduceMotionMobileButton.addEventListener('click', () => applyReduceMotion(!document.body.classList.contains('reduce-motion')));

    // --- Signatures (persisted via localStorage) ---
    let signatures = JSON.parse(localStorage.getItem('signatures') || '[]');

    function renderSignatures() {
      signatureList.innerHTML = '';
      signatures.forEach(({ name, message }) => {
        const li = document.createElement('li');
        li.textContent = message ? `${name} — ${message}` : name;
        li.classList.add('text-gray-900', 'dark:text-gray-100');
        signatureList.appendChild(li);
      });
      signatureCountDisplay.textContent = `Total Signatures: ${signatures.length}`;
    }

    renderSignatures();

    // --- Petition form ---
    form.addEventListener('submit', (event) => {
      event.preventDefault();

      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const message = document.getElementById('message').value.trim();

      removeHighlights();
      formError.classList.add('hidden');

      const errors = [];
      if (!name) errors.push('Name is required.');
      if (!validateEmail(email)) errors.push('A valid email address is required.');

      if (errors.length > 0) {
        formError.textContent = errors.join(' ');
        formError.classList.remove('hidden');
        if (!name) document.getElementById('name').classList.add('invalid-input');
        if (!validateEmail(email)) document.getElementById('email').classList.add('invalid-input');
        formError.focus();
        return;
      }

      signatures.push({ name, message });
      localStorage.setItem('signatures', JSON.stringify(signatures));
      renderSignatures();

      openModal(`Thank you, ${name}, for your support!`);
      form.reset();
    });

    // --- Modal ---
    function openModal(message) {
      modalMessage.textContent = message;
      modal.classList.remove('hidden');
      modalImage.classList.remove('hidden');
      modalImage.classList.add('animated');
      closeModalBtn.focus();

      setTimeout(closeModal, 5000);
    }

    function closeModal() {
      modal.classList.add('hidden');
      modalImage.classList.remove('animated');
    }

    closeModalBtn.addEventListener('click', closeModal);

    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
        closeModal();
      }
    });

    // Close modal on backdrop click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    // --- Helpers ---
    function validateEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function removeHighlights() {
      document.getElementById('name').classList.remove('invalid-input');
      document.getElementById('email').classList.remove('invalid-input');
    }

    // --- Scroll animations ---
    const sections = document.querySelectorAll('[data-scroll]');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle('visible', entry.isIntersecting);
      });
    }, { threshold: 0.1 });

    sections.forEach((section) => observer.observe(section));

    // --- Back to top ---
    window.addEventListener('scroll', () => {
      backToTopBtn.classList.toggle('hidden', window.scrollY < 400);
    }, { passive: true });

    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // --- Footer contact form ---
    const footerForm = document.getElementById('footerContactForm');
    const footerSuccess = document.getElementById('footerFormSuccess');
    footerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      footerSuccess.classList.remove('hidden');
      footerForm.reset();
      setTimeout(() => footerSuccess.classList.add('hidden'), 5000);
    });
  });
