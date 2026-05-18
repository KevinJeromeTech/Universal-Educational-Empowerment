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
    const closeModal = document.getElementById('closeModal');
    const modalMessage = document.getElementById('modalMessage');
    const modalImage = document.getElementById('modalImage');

    // --- Mobile menu ---
    mobileMenuBtn.addEventListener('click', () => {
      const isOpen = !mobileMenu.classList.contains('hidden');
      mobileMenu.classList.toggle('hidden');
      mobileMenuBtn.setAttribute('aria-expanded', String(!isOpen));
    });

    // Close mobile menu when a nav link is clicked
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
      localStorage.setItem('darkMode', isDark ? '1' : '0');
    }

    const savedDark = localStorage.getItem('darkMode') === '1';
    applyDarkMode(savedDark);

    toggleModeButton.addEventListener('click', () => applyDarkMode(!document.body.classList.contains('dark')));
    toggleModeMobileButton.addEventListener('click', () => applyDarkMode(!document.body.classList.contains('dark')));

    // --- Reduce motion ---
    function applyReduceMotion(reduce) {
      document.body.classList.toggle('reduce-motion', reduce);
      const label = reduce ? 'Enable Motion' : 'Reduce Motion: OFF';
      reduceMotionButton.textContent = label;
      reduceMotionMobileButton.textContent = label;
      localStorage.setItem('reduceMotion', reduce ? '1' : '0');
    }

    const savedMotion = localStorage.getItem('reduceMotion') === '1';
    applyReduceMotion(savedMotion);

    reduceMotionButton.addEventListener('click', () => applyReduceMotion(!document.body.classList.contains('reduce-motion')));
    reduceMotionMobileButton.addEventListener('click', () => applyReduceMotion(!document.body.classList.contains('reduce-motion')));

    // --- Signatures (persisted via localStorage) ---
    let signatures = JSON.parse(localStorage.getItem('signatures') || '[]');

    function renderSignatures() {
      signatureList.innerHTML = '';
      signatures.forEach(({ name, message }) => {
        const li = document.createElement('li');
        li.textContent = message ? `${name} — ${message}` : name;
        li.classList.add('text-gray-900');
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

      if (name === '' || !validateEmail(email)) {
        highlightInvalidFields(name, email);
        return;
      }

      signatures.push({ name, message });
      localStorage.setItem('signatures', JSON.stringify(signatures));
      renderSignatures();

      modalMessage.textContent = `Thank you, ${name}, for your support!`;
      modal.classList.remove('hidden');
      modalImage.classList.remove('hidden');
      modalImage.classList.add('animated');

      setTimeout(() => {
        modal.classList.add('hidden');
        modalImage.classList.remove('animated');
      }, 5000);

      form.reset();
      removeHighlights();
    });

    // --- Modal close ---
    closeModal.addEventListener('click', () => {
      modal.classList.add('hidden');
      modalImage.classList.remove('animated');
    });

    // --- Helpers ---
    function validateEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function highlightInvalidFields(name, email) {
      if (name === '') document.getElementById('name').classList.add('invalid-input');
      if (!validateEmail(email)) document.getElementById('email').classList.add('invalid-input');
    }

    function removeHighlights() {
      document.getElementById('name').classList.remove('invalid-input');
      document.getElementById('email').classList.remove('invalid-input');
    }

    // --- Scroll animations ---
    const sections = document.querySelectorAll('[data-scroll]');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        } else {
          entry.target.classList.remove('visible');
        }
      });
    }, { threshold: 0.1 });

    sections.forEach((section) => observer.observe(section));

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
