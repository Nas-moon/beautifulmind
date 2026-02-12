function toggleLesson(header) {
  const lesson = header.parentElement;
  lesson.classList.toggle("open");
}

const form    = document.querySelector("form");
const status  = document.getElementById("form-status");
const iframe  = document.getElementById("hidden_iframe");
const burgerBtn  = document.getElementById("burgerBtn");
const mobileMenu = document.getElementById("mobileMenu");

// Create a visible debug box on screen
const debugBox = document.createElement('div');
debugBox.id = 'debugBox';
debugBox.style.cssText = `
  position: fixed; bottom: 10px; left: 10px; right: 10px;
  background: rgba(0,0,0,0.85); color: #0f0; font-family: monospace;
  font-size: 13px; padding: 10px; border-radius: 8px;
  z-index: 9999; max-height: 150px; overflow-y: auto;
  display: none;
`;
document.body.appendChild(debugBox);

function log(msg) {
  debugBox.style.display = 'block';
  debugBox.innerHTML += msg + '<br>';
  debugBox.scrollTop = debugBox.scrollHeight;
}

// Burger menu
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
// SINGLE SUBMIT HANDLER
// ============================================
let submitted  = false;
let savedUserData = {};

form.addEventListener("submit", function() {
  // Grab ALL values immediately
  const userName    = document.getElementById('name').value.trim();
  const userStd     = document.getElementById('std').value.trim();
  const userEmail   = document.getElementById('email').value.trim();
  const userPhone   = document.getElementById('number').value.trim();
  const userAddress = document.getElementById('add').value.trim();

  log('📝 Form submitted by: ' + userName);

  // Save to localStorage right away
  localStorage.setItem('userName',     userName);
  localStorage.setItem('userStandard', userStd);
  localStorage.setItem('userEmail',    userEmail);
  localStorage.setItem('userPhone',    userPhone);
  localStorage.setItem('userAddress',  userAddress);

  savedUserData = {
    name:         userName,
    standard:     userStd,
    email:        userEmail,
    phone:        userPhone,
    address:      userAddress,
    stars:        0,
    lessons:      0,
    registeredAt: Date.now(),
    lastUpdated:  Date.now()
  };

  submitted = true;
  log('💾 Saved to localStorage ✅');
});

// After Google Form iframe confirms submission
iframe.addEventListener("load", async () => {
  if (!submitted) return;
  submitted = false;

  status.hidden = false;
  status.focus();
  form.reset();

  log('📡 Sending to Firebase...');

  const userId = savedUserData.name.toLowerCase().replace(/[^a-z0-9]/g, '_');

  try {
    const res = await fetch(
      `https://beautifulmind-19645-default-rtdb.asia-southeast1.firebasedatabase.app/users/${userId}.json`,
      {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(savedUserData)
      }
    );

    if (res.ok) {
      log('✅ Firebase saved! Status: ' + res.status);
      log('👤 User: ' + savedUserData.name + ' | Email: ' + savedUserData.email);
    } else {
      log('❌ Firebase failed! Status: ' + res.status);
    }
  } catch (err) {
    log('❌ Network error: ' + err.message);
  }

  // Redirect after 3 seconds (enough time to see debug messages)
  log('⏳ Redirecting in 3 seconds...');
  setTimeout(() => {
    window.location.href = 'lessonmap/lesson-map.html';
  }, 3000);
});
