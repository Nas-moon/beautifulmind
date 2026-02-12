function toggleLesson(header) {
  const lesson = header.parentElement;
  lesson.classList.toggle("open");
}

const form = document.querySelector("form");
const status = document.getElementById("form-status");
const iframe = document.getElementById("hidden_iframe");
const burgerBtn = document.getElementById("burgerBtn");
const mobileMenu = document.getElementById("mobileMenu");

// Burger menu
burgerBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  mobileMenu.classList.toggle("show");
});

document.addEventListener("click", () => {
  mobileMenu.classList.remove("show");
});

// ============================================
// SINGLE SUBMIT HANDLER - Handles everything
// ============================================
let submitted = false;
let savedUserData = {}; // Store form data BEFORE form resets

form.addEventListener("submit", async function(e) {
  // Read ALL form values immediately before anything resets them
  const userName    = document.getElementById('name').value.trim();
  const userStd     = document.getElementById('std').value.trim();
  const userEmail   = document.getElementById('email').value.trim();
  const userPhone   = document.getElementById('number').value.trim();
  const userAddress = document.getElementById('add').value.trim();

  // Save to localStorage immediately
  localStorage.setItem('userName',    userName);
  localStorage.setItem('userStandard', userStd);
  localStorage.setItem('userEmail',   userEmail);
  localStorage.setItem('userPhone',   userPhone);
  localStorage.setItem('userAddress', userAddress);

  // Store for Firebase (in case iframe loads before fetch completes)
  savedUserData = {
    name:        userName,
    standard:    userStd,
    email:       userEmail,
    phone:       userPhone,
    address:     userAddress,
    stars:       0,
    lessons:     0,
    registeredAt: Date.now(),
    lastUpdated:  Date.now()
  };

  submitted = true;

  // Save to Firebase
  const userId = userName.toLowerCase().replace(/\s+/g, '_');
  try {
    const response = await fetch(
      `https://beautifulmind-19645-default-rtdb.asia-southeast1.firebasedatabase.app/users/${userId}.json`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(savedUserData)
      }
    );

    if (response.ok) {
      console.log('✅ User registered in Firebase with all details!');
    } else {
      console.error('❌ Firebase registration failed:', response.status);
    }
  } catch (error) {
    console.error('❌ Firebase error:', error);
  }
});

// Iframe load → form submitted to Google successfully
iframe.addEventListener("load", () => {
  if (!submitted) return;

  submitted = false;

  // Show success message
  status.hidden = false;
  status.focus();
  form.reset();

  // Redirect to lesson map after 2 seconds
  setTimeout(() => {
    window.location.href = 'lessonmap/lesson-map.html';
  }, 2000);
});
