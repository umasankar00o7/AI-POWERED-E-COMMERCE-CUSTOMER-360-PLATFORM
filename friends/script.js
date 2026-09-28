document.addEventListener('DOMContentLoaded', function() {

  
  
  // --- CONFIG & INITIALIZATION ---
  const firebaseConfig = {
    apiKey: "AIzaSyDcVLYs57ncKY4dKGJv_g0W_VgW0UIJc2M",
    authDomain: "designer-portfolio-f53db.firebaseapp.com",
    projectId: "designer-portfolio-f53db",
    storageBucket: "designer-portfolio-f53db.firebasestorage.app",
    messagingSenderId: "475317815859",
    appId: "1:475317815859:web:d3d13f14ef449758687146"
  };
  
  let db;
  try {
    if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
  } catch (e) { console.error("Firebase initialization failed:", e); }
  
  AOS.init({ duration: 800, once: true, offset: 50 });
  
  if (document.getElementById('typed-text-hero')) {
    new Typed('#typed-text-hero', {
      strings: ["Timeless Elegance.", "Rs Sisters..", "Handcrafted Passion."],
      typeSpeed: 70, backSpeed: 50, loop: true, startDelay: 500,
    });
  }

  

  

  const creationsData = [
    { image: 'https://res.cloudinary.com/dljmxltfr/image/upload/v1755833875/updated_ryz5ty.png', title: 'Style Rack', link: 'https://youtube.com/@rssisters_stylerack?si=Kbr-mu_uP6iD-ims' },
    { image: 'https://res.cloudinary.com/dljmxltfr/image/upload/v1755712237/TAILORING_llhqnk.jpg', title: 'Tailoring classes', link: 'https://youtube.com/playlist?list=PLcfbGUXX-23SSWO5BI79oxCPivWIyoJXY&si=xs5RLozUGAtWoJtn' },
    { image: 'https://res.cloudinary.com/dljmxltfr/image/upload/v1755712603/MAGGAM_nou3np.jpg', title: 'Maggam work classes', link: 'https://youtube.com/playlist?list=PLcfbGUXX-23RtlEL3qsZG4BEM99_xPk-L&si=Vt3_8uE2brY9cpTG' },
    { image: 'https://res.cloudinary.com/dljmxltfr/image/upload/v1755712700/FUNNY_agij39.jpg', title: 'Stress Busters', link: 'https://youtube.com/@sailuarts?si=jghur0NAKWuAFjYj' },
  ];

  function renderCreations() {
    const container = document.getElementById('creations-container');
    if (!container) return;
    container.innerHTML = creationsData.map((item, index) => `
      <div class="col-lg-3 col-md-6" data-aos="zoom-in-up" data-aos-delay="${index * 100}">
        <a href="${item.link}" target="_blank" class="creation-card">
          <img src="${item.image}" alt="${item.title}" class="creation-image">
          <div class="creation-body"><h4 class="creation-title">${item.title}</h4></div>
        </a>
      </div>`).join('');
  }
  
  // (The rest of the JS is unchanged until the very end...)
  // GUESTBOOK LOGIC
  const guestbookForm = document.getElementById('guestbook-form');
  const entriesContainer = document.getElementById('guestbook-entries-container');
  async function fetchGuestbookEntries() {
    if (!db || !entriesContainer) return;
    try {
      const snapshot = await db.collection("guestbookEntries").orderBy("timestamp", "desc").limit(5).get();
      if (snapshot.empty) {
        entriesContainer.innerHTML = '<p class="text-center text-muted">Be the first to leave a note!</p>';
        return;
      }
      entriesContainer.innerHTML = snapshot.docs.map(doc => {
        const entry = doc.data();
        const date = entry.timestamp ? entry.timestamp.toDate().toLocaleDateString() : 'A while ago';
        const sanitizedMessage = entry.message.replace(/</g, "<").replace(/>/g, ">");
        const sanitizedName = entry.name.replace(/</g, "<").replace(/>/g, ">");
        return `<div class="guestbook-entry" data-aos="fade-up"><p>"${sanitizedMessage}"</p><div class="guest-meta d-flex justify-content-between align-items-center"><span class="guest-name">- ${sanitizedName}</span> <span class="guest-date">${date}</span></div></div>`;
      }).join('');
    } catch (e) {
      entriesContainer.innerHTML = '<p class="text-center text-danger">Could not load guestbook.</p>';
      console.error("Guestbook fetch error:", e);
    }
  }
  if (guestbookForm) {
    guestbookForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const sessionKey = 'guestbook_session_posted_v3';
      if (sessionStorage.getItem(sessionKey)) return showToast("Already Posted", "You've already left a note in this session.", "info");
      
      const name = document.getElementById('guestbook-name').value.trim();
      const message = document.getElementById('guestbook-message').value.trim();
      if (!name || !message) return showToast('Incomplete', 'Please fill out both name and message.', 'danger');
      
      const submitBtn = guestbookForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true; submitBtn.textContent = 'Posting...';

      try {
        await db.collection("guestbookEntries").add({ name, message, timestamp: firebase.firestore.FieldValue.serverTimestamp() });
        await db.collection('portfolio_stats').doc('main_counters').set({ guestbookEntries: firebase.firestore.FieldValue.increment(1) }, { merge: true });
        sessionStorage.setItem(sessionKey, 'true');
        guestbookForm.reset();
        fetchGuestbookEntries();
        showToast("Thank You!", "Your note has been posted to the guestbook.", "success");
      } catch (e) {
        showToast('Error', 'Could not save your note. Please try again.', 'danger');
      } finally {
        submitBtn.disabled = false; submitBtn.textContent = 'Leave a Note';
      }
    });
  }

  // REAL-TIME STATS & SOCIALS LOGIC
     function initStats() {
    if (!db) return;
    const statsRef = db.collection('portfolio_stats').doc('main_counters');
    
    // This listener's ONLY job is to keep the hidden data spans updated in real-time.
    statsRef.onSnapshot(doc => {
      const data = doc.data() || { views: 0, shares: 0, guestbookEntries: 0, likes: 0 };
      document.getElementById('views-count').textContent = data.views;
      document.getElementById('shares-count').textContent = data.shares;
      document.getElementById('guestbook-count').textContent = data.guestbookEntries;
      document.getElementById('likes-count').textContent = data.likes;
    }, err => console.error("Stats listener failed:", err));

    // Logic for incrementing views on session start remains unchanged.
    const sessionKey = 'portfolio_session_viewed_v4';
    if (!sessionStorage.getItem(sessionKey)) {
      statsRef.set({ views: firebase.firestore.FieldValue.increment(1) }, { merge: true });
      sessionStorage.setItem(sessionKey, 'true');
    }
  }
  function animateStat(element, finalValue) {
      if (!element || typeof finalValue !== 'number') return;
      let startValue = 0;
      let startTimestamp = null; const duration = 1500;
      const step = (timestamp) => {
          if (!startTimestamp) startTimestamp = timestamp;
          const progress = Math.min((timestamp - startTimestamp) / duration, 1);
          element.textContent = Math.floor(progress * (finalValue - startValue) + startValue).toLocaleString();
          if (progress < 1) window.requestAnimationFrame(step);
      };
      window.requestAnimationFrame(step);
  }

  function initializeAnimatedStats() {
    const statsSection = document.getElementById('portfolio-stats');
    if (!statsSection) return;
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        animateStat(document.getElementById('animatedViewsCount'), parseInt(document.getElementById('views-count').textContent || 0));
        animateStat(document.getElementById('animatedLikesCount'), parseInt(document.getElementById('likes-count').textContent || 0));
        animateStat(document.getElementById('animatedSharesCount'), parseInt(document.getElementById('shares-count').textContent || 0));
        animateStat(document.getElementById('animatedGuestbookCount'), parseInt(document.getElementById('guestbook-count').textContent || 0));
      }
    }, { threshold: 0.5 });
    observer.observe(statsSection);
  }

  // TELEGRAM CONTACT FORM
  const contactForm = document.getElementById('portfolioContactForm');
  if(contactForm) {
      const submitBtn = document.getElementById('contactSubmitButton');
      const formContainer = document.getElementById('contactFormContainer');
      const successContainer = document.getElementById('contactSuccessContainer');

      contactForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          const TELEGRAM_BOT_TOKEN = '7974633442:AAE8BZrDgrXZBvAE3pKBVbvJ0SJbUfY7G-Y'; 

          const TELEGRAM_CHAT_ID = '7773175837';   
          const name = document.getElementById('contactName').value;
          const email = document.getElementById('contactEmail').value;
          const message = document.getElementById('contactMessage').value;
          if (TELEGRAM_BOT_TOKEN === 'YOUR_TELEGRAM_BOT_TOKEN') {
              showToast('Configuration Error', 'Telegram Bot is not configured in jrkJS.js.', 'danger');
              return;
          }
          const text = `*📬 INCOMING! New Message from Your Portfolio! 📬*

Someone was impressed by your work and reached out. Here are the details:\n\n👤  *From:* ${name}\n✉️  *Email:* ${email}\n*Message:*\n${message}`;
          const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${TELEGRAM_CHAT_ID}&text=${encodeURIComponent(text)}&parse_mode=Markdown`;
          submitBtn.disabled = true;
          submitBtn.querySelector('.btn-text').textContent = 'Sending...';
          try {
              const response = await fetch(url, { method: 'POST' });
              const data = await response.json();
              if (!data.ok) throw new Error(data.description || 'Telegram API error');
              formContainer.style.display = 'none';
              successContainer.style.display = 'block';
              contactForm.reset();
          } catch (error) {
              showToast('Send Error', 'Could not send message. Please try again later.', 'danger');
              console.error("Telegram send error:", error);
          } finally {
              submitBtn.disabled = false;
              submitBtn.querySelector('.btn-text').textContent = 'Send Message';
          }
      });
  }

  // READ MORE TOGGLE
  const readMoreToggle = document.getElementById('readMoreAboutToggle');
  const textWrapper = document.getElementById('aboutMeTextWrapper');
  if(readMoreToggle && textWrapper) {
    readMoreToggle.addEventListener('click', () => {
      const isExpanded = textWrapper.classList.toggle('expanded');
      readMoreToggle.classList.toggle('expanded');
      readMoreToggle.innerHTML = isExpanded 
          ? 'Read Less <i class="fas fa-chevron-up ms-1"></i>'
          : 'Read More <i class="fas fa-chevron-down ms-1"></i>';
    });
  }

  // THEME TOGGLE
  const themeToggle = document.getElementById('themeToggleCheckbox');
  function applyTheme(isLight) {
    document.body.classList.toggle('light-mode', isLight);
    if(themeToggle) themeToggle.checked = !isLight;
  }
  if(themeToggle) {
    themeToggle.addEventListener('change', () => {
      const isLight = !themeToggle.checked;
      localStorage.setItem('theme', isLight ? 'light' : 'dark');
      applyTheme(isLight);
    });
  }
  const savedTheme = localStorage.getItem('theme');
  const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  applyTheme(savedTheme === 'light' || (savedTheme === null && prefersLight));
  
  // GENERAL UTILITIES & EVENT LISTENERS
  const backToTopBtn = document.getElementById("backToTopBtn");
  const shareBtn = document.getElementById("fabPortfolioShareButton");
  const likeBtn = document.getElementById("fabPortfolioLikeButton");
  const allFabs = [backToTopBtn, shareBtn, likeBtn].filter(Boolean);

  window.onscroll = () => {
    const show = document.body.scrollTop > 300 || document.documentElement.scrollTop > 300;
    allFabs.forEach(fab => fab.style.display = show ? "flex" : "none");
  };
  if(backToTopBtn) backToTopBtn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  if(shareBtn) shareBtn.addEventListener('click', async () => {
    const shareData = { title: "Rs Sisters Portfolio", text: "Check out this amazing creative portfolio!", url: window.location.href };
    try {
        await navigator.share(shareData);
        if(db) db.collection('portfolio_stats').doc('main_counters').update({ shares: firebase.firestore.FieldValue.increment(1) });
    } catch (err) {
        if (err.name !== 'AbortError') {
           showToast('Share Failed', 'Could not share the portfolio.', 'info');
        }
    }
  });
  
        if (likeBtn) {
      const sessionLikeKey = 'portfolio_session_liked_v2';
      
      if (sessionStorage.getItem(sessionLikeKey)) {
          likeBtn.classList.add('liked');
      }

      likeBtn.addEventListener('click', () => {
          if (sessionStorage.getItem(sessionLikeKey)) {
              showToast("Already Liked!", "You can like the portfolio once per session.", "info");
              return;
          }

          const statsRef = db.collection('portfolio_stats').doc('main_counters');
          
          statsRef.update({ likes: firebase.firestore.FieldValue.increment(1) })
            .then(() => {
                // --- Success Actions ---
                // The onSnapshot listener now handles the counter animation automatically.
                // We ONLY handle the button state and toast message here.
                sessionStorage.setItem(sessionLikeKey, 'true');
                likeBtn.classList.add('liked');
                showToast("Thank You!", "Your like has been recorded!", "success");
            })
            .catch((error) => {
                console.error("Error updating likes:", error);
                showToast("Error", "Could not record your like. Please try again.", "danger");
            });
      });
  }
  // DYNAMIC MODAL LOGIC & OFF-CANVAS FIX
  const serviceModal = document.getElementById('serviceModal');
  if (serviceModal) {
    serviceModal.addEventListener('show.bs.modal', function (event) {
      const card = event.relatedTarget;
      const serviceId = card.getAttribute('data-service-id');
      const data = modalData[serviceId];
      const modalTitle = serviceModal.querySelector('#serviceModalLabel');
      const modalBody = serviceModal.querySelector('#serviceModalBody');

      modalBody.innerHTML = '';

      if (data) {
        modalTitle.textContent = data.title;
        data.items.forEach(item => {
          const link = document.createElement('a');
          link.href = item.link;
          link.textContent = item.name;
          link.target = '_blank';
          modalBody.appendChild(link);
        });
      } else {
        modalTitle.textContent = 'Error';
        modalBody.innerHTML = '<p>Could not find details for this service.</p>';
      }
    });
  }

  document.querySelectorAll('.offcanvas a.nav-link, .offcanvas .btn-primary-offcanvas, .navbar-nav a.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        const offcanvasEl = document.querySelector('.offcanvas.show');
        if (offcanvasEl) {
            bootstrap.Offcanvas.getInstance(offcanvasEl)?.hide();
        }
        const collapseEl = document.querySelector('.navbar-collapse.show');
        if (collapseEl) {
            bootstrap.Collapse.getInstance(collapseEl)?.hide();
        }
    });
  });

  function showToast(title, body, type = 'info') {
    const toastEl = document.getElementById('appToast');
    if (!toastEl) return;
    document.getElementById('toastTitle').textContent = title;
    document.getElementById('toastBody').textContent = body;
    const toastHeader = toastEl.querySelector('.toast-header');
    toastHeader.className = 'toast-header';
    toastEl.querySelector('.toast-body').className = 'toast-body';
    
    if (type === 'success') {
      toastHeader.classList.add('bg-success', 'text-white');
    } else if (type === 'danger') {
      toastHeader.classList.add('bg-danger', 'text-white');
    } else {
      toastHeader.classList.add('bg-secondary', 'text-white');
    }
    const toast = new bootstrap.Toast(toastEl, { delay: 5000 });
    toast.show();
  }

  // --- INITIAL RENDER CALLS ---
  
  renderCreations();
  if (db) {
    fetchGuestbookEntries();
    initStats();
    initializeAnimatedStats();
  } else {
    document.getElementById('guestbook-entries-container').innerHTML = '<p class="text-center text-danger">Database connection failed. Features are disabled.</p>';
  }
  document.getElementById('currentYear').textContent = new Date().getFullYear();

   // ====================================================== //
  //    DEFINITIVE & ISOLATED DOUBTS SESSION FORM LOGIC     //
  // ====================================================== //
  // --- START: JAVASCRIPT FOR DOUBT SESSION FORM ---

const doubtForm = document.getElementById('doubtSessionForm');

if (doubtForm) {
  doubtForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = doubtForm.querySelector('.btn-submit-doubt');
    const originalBtnText = submitBtn.textContent;
    
    // Provide user feedback
    submitBtn.disabled = true;
    submitBtn.textContent = 'Requesting...';

    // Get form values
    const name = document.getElementById('doubtName').value.trim();
    const phone = document.getElementById('doubtPhone').value.trim();
    const doubt = document.getElementById('doubtMessage').value.trim();

    // --- IMPORTANT: REPLACE WITH YOUR ACTUAL TELEGRAM DETAILS ---
    // These should be the same as your other contact form
    const telegramBotToken = "7974633442:AAE8BZrDgrXZBvAE3pKBVbvJ0SJbUfY7G-Y";

    const telegramChatId = "7773175837";   
    // -----------------------------------------------------------

    // Create a clear message for Telegram
    const message = `
🔔 *New Doubt Session Request!* 🔔
--------------------------------------
👤 *Name:* ${name}
📞  *Phone:* ${phone}
*Doubt/Question:*
${doubt}
`;

    const url = `https://api.telegram.org/bot${telegramBotToken}/sendMessage?chat_id=${telegramChatId}&text=${encodeURIComponent(message)}&parse_mode=Markdown`;

    try {
      const response = await fetch(url);
      if (response.ok) {
        showToast("Request Sent!", "Thank you! I will get back to you soon.", "success");
        
        // Reset form and close the modal on success
        doubtForm.reset();
        const doubtModal = bootstrap.Modal.getInstance(document.getElementById('doubtSessionModal'));
        if (doubtModal) {
          doubtModal.hide();
        }
      } else {
        throw new Error('Telegram API response was not OK.');
      }
    } catch (error) {
      console.error("Failed to send doubt request:", error);
      showToast("Submission Error", "Could not send your request. Please try again or reach out directly.", "danger");
    } finally {
      // Always restore the button state
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
    }
  });
}

// --- END: JAVASCRIPT FOR DOUBT SESSION FORM ---

  // --- FINAL & CORRECT PRELOADER LOGIC (with Timed Reveal) ---
  const preloader = document.getElementById('preloader');
  
  // Immediately add 'preloading' to the body to hide scrollbars and prevent content flash
  document.body.classList.add('preloading');

  // This waits for the entire page, including all images, to be fully loaded
  window.onload = function() {
    if (preloader) {
      
      // THE PAUSE: This function waits for 2.5 seconds AFTER the page is loaded.
      // You can change 2500 to 2000 (2s) or 3000 (3s).
      setTimeout(function() {
        
        // THE REVEAL: After the pause, add the 'loaded' class.
        // This single class triggers all the animations in the CSS.
        preloader.classList.add('loaded');
        
        // Re-enable scrolling on the main page.
        document.body.classList.remove('preloading');

      }, 2000); // 2500 milliseconds = 2.5 seconds

      // THE CLEANUP: This function removes the preloader from the HTML after
      // all animations are finished, so it cannot interfere with clicking on your site.
      // Total time = 2500ms (delay) + 1200ms (animation) = 3700ms.
      setTimeout(function() {
        preloader.style.display = 'none';
      }, 3700);
    }
  };
});
