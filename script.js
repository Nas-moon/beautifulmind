// ============================================
// SKIP FORM IF ALREADY LOGGED IN ON THIS DEVICE
// ============================================
if (localStorage.getItem('userName')) {
  window.location.href = 'lessonmap/lesson-map.html';
}

// ============================================
// HELPERS
// ============================================
function toggleLesson(header) {
  const lesson = header.parentElement;
  lesson.classList.toggle("open");
}

const burgerBtn  = document.getElementById("burgerBtn");
const mobileMenu = document.getElementById("mobileMenu");

burgerBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  mobileMenu.classList.toggle("show");
});

document.addEventListener("click", (e) => {
  if (!mobileMenu.contains(e.target) && e.target !== burgerBtn) {
    mobileMenu.classList.remove("show");
  }
});

// ============================================
// FORM SUBMISSION
// ============================================
const form    = document.querySelector("form");
const status  = document.getElementById("form-status");
const iframe  = document.getElementById("hidden_iframe");

let submitted    = false;
let savedUserData = {};

form.addEventListener("submit", function () {
  // Read ALL values immediately
  const userName    = document.getElementById('name').value.trim();
  const userStd     = document.getElementById('std').value.trim();
  const userEmail   = document.getElementById('email').value.trim();
  const userPhone   = document.getElementById('number').value.trim();
  const userAddress = document.getElementById('add').value.trim();

  // Store for Firebase
  savedUserData = { name: userName, standard: userStd, email: userEmail,
                    phone: userPhone, address: userAddress };
  submitted = true;
});

// After Google Form confirms submission via iframe
iframe.addEventListener("load", async () => {
  if (!submitted) return;
  submitted = false;

  status.hidden = false;
  status.focus();
  form.reset();

  const userName = savedUserData.name;
  const userId   = userName.toLowerCase().replace(/[^a-z0-9]/g, '_');

  // ============================================
  // CHECK FIREBASE: Does this student exist?
  // ============================================
  try {
    const checkRes  = await fetch(
      `https://beautifulmind-19645-default-rtdb.asia-southeast1.firebasedatabase.app/users/${userId}.json`
    );
    const existing = await checkRes.json();

    if (existing && existing.name) {
      // ✅ RETURNING STUDENT — restore their progress to localStorage
      localStorage.setItem('userName',        existing.name);
      localStorage.setItem('userStandard',    existing.standard    || '');
      localStorage.setItem('userEmail',       existing.email       || '');
      localStorage.setItem('userPhone',       existing.phone       || '');
      localStorage.setItem('userAddress',     existing.address     || '');
      localStorage.setItem('totalStars',      existing.stars       || 0);
      localStorage.setItem('completedLessons',existing.lessons     || 0);

      // Restore topic completion flags
      if (existing.completedTopics) {
        Object.entries(existing.completedTopics).forEach(([key, val]) => {
          localStorage.setItem(key, val);
        });
      }

      // Restore quiz completion flags
      if (existing.completedQuizzes) {
        Object.entries(existing.completedQuizzes).forEach(([key, val]) => {
          localStorage.setItem(key, val);
        });
      }

      console.log('✅ Returning student! Progress restored:', existing.stars, 'stars');

    } else {
      // 🆕 NEW STUDENT — create fresh profile in Firebase
      const newProfile = {
        name:             userName,
        standard:         savedUserData.standard,
        email:            savedUserData.email,
        phone:            savedUserData.phone,
        address:          savedUserData.address,
        stars:            0,
        lessons:          0,
        completedTopics:  {},
        completedQuizzes: {},
        registeredAt:     Date.now(),
        lastUpdated:      Date.now()
      };

      await fetch(
        `https://beautifulmind-19645-default-rtdb.asia-southeast1.firebasedatabase.app/users/${userId}.json`,
        {
          method:  'PUT',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(newProfile)
        }
      );

      // Save to localStorage
      localStorage.setItem('userName',         userName);
      localStorage.setItem('userStandard',     savedUserData.standard);
      localStorage.setItem('userEmail',        savedUserData.email);
      localStorage.setItem('userPhone',        savedUserData.phone);
      localStorage.setItem('userAddress',      savedUserData.address);
      localStorage.setItem('totalStars',       0);
      localStorage.setItem('completedLessons', 0);

      console.log('✅ New student registered!');
    }

  } catch (err) {
    // Firebase failed — save locally anyway
    localStorage.setItem('userName',         userName);
    localStorage.setItem('totalStars',       0);
    localStorage.setItem('completedLessons', 0);
    console.error('❌ Firebase check failed:', err);
  }

  // Redirect after 2 seconds
  setTimeout(() => {
    window.location.href = 'lessonmap/lesson-map.html';
  }, 2000);
});
