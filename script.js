document.addEventListener('DOMContentLoaded', () => {
    // --- Element references ---
    const toggleModeButton = document.getElementById('toggleMode');
    const toggleModeMobileButton = document.getElementById('toggleModeMobile');
    const reduceMotionButton = document.getElementById('reduceMotion');
    const reduceMotionMobileButton = document.getElementById('reduceMotionMobile');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const form = document.getElementById('petitionForm');
    const signatureListUl = document.querySelector('#signatureList ul');
    const signatureCountDisplay = document.getElementById('signatureCount');
    const signatureProgressDisplay = document.getElementById('signatureProgress');
    const progressBar = document.getElementById('progressBar');
    const modal = document.getElementById('thankYouModal');
    const closeModalBtn = document.getElementById('closeModal');
    const modalMessage = document.getElementById('modalMessage');
    const modalImage = document.getElementById('modalImage');
    const shareSection = document.getElementById('shareSection');
    const shareTextInput = document.getElementById('shareText');
    const copyShareBtn = document.getElementById('copyShareBtn');
    const charCountEl = document.getElementById('charCount');
    const nameEl = document.getElementById('name');
    const emailEl = document.getElementById('email');
    const messageEl = document.getElementById('message');
    const nameErrorEl = document.getElementById('nameError');
    const emailErrorEl = document.getElementById('emailError');
    const backToTopBtn = document.getElementById('backToTop');

    const GOAL = 1000;
    const MILESTONES = [5, 10, 25, 50, 100, 250, 500, 1000];
    const MAX_CHARS = 500;

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

    // --- Avatar helpers ---
    const AVATAR_COLORS = ['#800020', '#1d4ed8', '#15803d', '#b45309', '#6d28d9', '#0e7490', '#be185d', '#c2410c'];

    function getAvatarColor(name) {
      let hash = 0;
      for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
      return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
    }

    function getInitials(name) {
      const parts = name.trim().split(/\s+/);
      if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }

    // --- Relative time ---
    function timeAgo(isoString) {
      const seconds = Math.floor((Date.now() - new Date(isoString)) / 1000);
      if (seconds < 60) return 'just now';
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      if (days < 30) return `${days}d ago`;
      return new Date(isoString).toLocaleDateString();
    }

    // --- Safe HTML escape ---
    function escapeHtml(str) {
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }

    // --- Signatures ---
    let signatures = JSON.parse(localStorage.getItem('signatures') || '[]');
    // Migrate old format entries that may lack email/timestamp
    signatures = signatures.map(s => ({
      name: s.name || '',
      message: s.message || '',
      email: s.email || '',
      timestamp: s.timestamp || new Date().toISOString(),
    }));

    function renderSignatures() {
      signatureListUl.innerHTML = '';
      [...signatures].reverse().forEach(({ name, message, timestamp }) => {
        const li = document.createElement('li');
        li.className = 'signature-item';
        const color = getAvatarColor(name);
        const initials = getInitials(name);
        const msg = message ? ` <span class="sig-message">— ${escapeHtml(message)}</span>` : '';
        li.innerHTML = `
          <div class="sig-avatar" style="background-color:${color}" aria-hidden="true">${escapeHtml(initials)}</div>
          <div class="sig-content">
            <div class="sig-name">${escapeHtml(name)}${msg}</div>
            <div class="sig-time">${escapeHtml(timeAgo(timestamp))}</div>
          </div>`;
        signatureListUl.appendChild(li);
      });
      updateProgress();
    }

    function updateProgress() {
      const count = signatures.length;
      const pct = Math.min((count / GOAL) * 100, 100);
      signatureCountDisplay.textContent = `${count.toLocaleString()} signature${count !== 1 ? 's' : ''}`;
      signatureProgressDisplay.textContent = `${count.toLocaleString()} / ${GOAL.toLocaleString()}`;
      progressBar.style.width = `${pct}%`;
    }

    renderSignatures();

    // Refresh relative timestamps every minute
    setInterval(() => { if (signatures.length > 0) renderSignatures(); }, 60000);

    // --- Draft autosave ---
    ['name', 'email', 'message'].forEach(id => {
      const el = document.getElementById(id);
      const saved = localStorage.getItem(`draft_${id}`);
      if (saved) el.value = saved;
      el.addEventListener('input', () => localStorage.setItem(`draft_${id}`, el.value));
    });

    function clearDraft() {
      ['name', 'email', 'message'].forEach(id => localStorage.removeItem(`draft_${id}`));
    }

    // --- Character counter ---
    messageEl.addEventListener('input', () => {
      const len = messageEl.value.length;
      charCountEl.textContent = `${len} / ${MAX_CHARS}`;
      const nearLimit = len >= MAX_CHARS * 0.85;
      charCountEl.style.color = nearLimit ? '#ef4444' : '';
    });

    // --- Real-time field validation (on blur) ---
    nameEl.addEventListener('blur', () => {
      if (!nameEl.value.trim()) {
        showFieldError(nameEl, nameErrorEl, 'Name is required.');
      } else {
        clearFieldError(nameEl, nameErrorEl);
      }
    });

    emailEl.addEventListener('blur', () => {
      const val = emailEl.value.trim();
      if (!val) {
        showFieldError(emailEl, emailErrorEl, 'Email is required.');
      } else if (!validateEmail(val)) {
        showFieldError(emailEl, emailErrorEl, 'Please enter a valid email address.');
      } else if (isDuplicateEmail(val)) {
        showFieldError(emailEl, emailErrorEl, 'This email has already signed the petition.');
      } else {
        clearFieldError(emailEl, emailErrorEl);
      }
    });

    function showFieldError(input, errorEl, message) {
      input.classList.add('invalid-input');
      errorEl.textContent = message;
      errorEl.classList.remove('hidden');
    }

    function clearFieldError(input, errorEl) {
      input.classList.remove('invalid-input');
      errorEl.textContent = '';
      errorEl.classList.add('hidden');
    }

    function isDuplicateEmail(email) {
      return signatures.some(s => s.email.toLowerCase() === email.toLowerCase());
    }

    // --- Milestone confetti ---
    function checkMilestone(count) {
      if (!MILESTONES.includes(count)) return;
      if (document.body.classList.contains('reduce-motion')) return;
      if (typeof confetti !== 'function') return;
      confetti({
        particleCount: count >= 100 ? 250 : 120,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#800020', '#FFD700', '#ffffff', '#1d4ed8', '#15803d'],
      });
    }

    // --- Petition form submit ---
    form.addEventListener('submit', (event) => {
      event.preventDefault();

      // Honeypot: if filled, silently abort (bot detected)
      if (document.getElementById('hp_website').value !== '') return;

      const name = nameEl.value.trim();
      const email = emailEl.value.trim();
      const message = messageEl.value.trim();

      // Full validation on submit
      clearFieldError(nameEl, nameErrorEl);
      clearFieldError(emailEl, emailErrorEl);

      let firstInvalidEl = null;

      if (!name) {
        showFieldError(nameEl, nameErrorEl, 'Name is required.');
        firstInvalidEl = firstInvalidEl || nameEl;
      }
      if (!email) {
        showFieldError(emailEl, emailErrorEl, 'Email is required.');
        firstInvalidEl = firstInvalidEl || emailEl;
      } else if (!validateEmail(email)) {
        showFieldError(emailEl, emailErrorEl, 'Please enter a valid email address.');
        firstInvalidEl = firstInvalidEl || emailEl;
      } else if (isDuplicateEmail(email)) {
        showFieldError(emailEl, emailErrorEl, 'This email has already signed the petition.');
        firstInvalidEl = firstInvalidEl || emailEl;
      }

      if (firstInvalidEl) {
        firstInvalidEl.focus();
        return;
      }

      const newSig = { name, message, email, timestamp: new Date().toISOString() };
      signatures.push(newSig);
      localStorage.setItem('signatures', JSON.stringify(signatures));

      checkMilestone(signatures.length);
      renderSignatures();
      clearDraft();
      form.reset();
      charCountEl.textContent = `0 / ${MAX_CHARS}`;

      openModal(`Thank you, ${name}, for your support!`);
    });

    // --- Modal ---
    let autoCloseTimer = null;

    function openModal(message) {
      modalMessage.textContent = message;

      const shareUrl = window.location.href.split('#')[0];
      shareTextInput.value = `I just signed the UEE petition! Join me in supporting universal education: ${shareUrl}`;
      shareSection.classList.remove('hidden');
      copyShareBtn.textContent = 'Copy';
      copyShareBtn.classList.remove('bg-green-700');

      modal.classList.remove('hidden');
      modalImage.classList.remove('hidden');
      modalImage.classList.add('animated');
      closeModalBtn.focus();

      clearTimeout(autoCloseTimer);
      autoCloseTimer = setTimeout(closeModal, 8000);
    }

    function closeModal() {
      clearTimeout(autoCloseTimer);
      modal.classList.add('hidden');
      modalImage.classList.remove('animated');
      shareSection.classList.add('hidden');
    }

    closeModalBtn.addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal.classList.contains('hidden')) closeModal();
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    // --- Copy share text ---
    copyShareBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(shareTextInput.value);
      } catch {
        shareTextInput.select();
        document.execCommand('copy');
      }
      copyShareBtn.textContent = 'Copied!';
      copyShareBtn.classList.add('bg-green-700');
      setTimeout(() => {
        copyShareBtn.textContent = 'Copy';
        copyShareBtn.classList.remove('bg-green-700');
      }, 2000);
    });

    // --- Helpers ---
    function validateEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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
