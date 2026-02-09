function toggleLesson(header) {
  const lesson = header.parentElement;
  lesson.classList.toggle("open");
}

const form = document.querySelector("form");
const status = document.getElementById("form-status");
const iframe = document.getElementById("hidden_iframe");
let submitted = false;

form.addEventListener("submit", () => {
  submitted = true;
});

iframe.addEventListener("load", () => {
  if (!submitted) return;
  // Safe: Google has received the data
  status.hidden = false;
  status.focus();
  form.reset();
  submitted = false;
});

const submitBtn = form.querySelector("input[type='submit']");
submitBtn.disabled = false;

const burgerBtn = document.getElementById("burgerBtn");
const mobileMenu = document.getElementById("mobileMenu");

burgerBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  mobileMenu.classList.toggle("show");
});

document.addEventListener("click", () => {
  mobileMenu.classList.remove("show");
});

// ============================================
// SAVE USER DATA TO FIREBASE + LOCALSTORAGE
// ============================================
document.querySelector('form').addEventListener('submit', async function(e) {
  const userName = document.getElementById('name').value;
  const userStandard = document.getElementById('std').value;
  const userEmail = document.getElementById('email').value;
  const userPhone = document.getElementById('number').value;
  const userAddress = document.getElementById('add').value;
  
  // Save to localStorage
  localStorage.setItem('userName', userName);
  localStorage.setItem('userStandard', userStandard);
  localStorage.setItem('userEmail', userEmail);
  localStorage.setItem('userPhone', userPhone);
  localStorage.setItem('userAddress', userAddress);
  
  // Save to Firebase
  const userId = userName.toLowerCase().replace(/\s+/g, '_');
  try {
    const response = await fetch(
      `https://beautifulmind-19645-default-rtdb.asia-southeast1.firebasedatabase.app/users/${userId}.json`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: userName,
          standard: userStandard,
          email: userEmail,
          phone: userPhone,
          address: userAddress,
          stars: 0,
          lessons: 0,
          registeredAt: Date.now(),
          lastUpdated: Date.now()
        })
      }
    );
    
    if (response.ok) {
      console.log('✅ User registered in Firebase!');
    } else {
      console.error('❌ Firebase registration failed');
    }
  } catch (error) {
    console.error('❌ Firebase registration error:', error);
  }
  
  // Show success message and redirect
  setTimeout(() => {
    const status = document.getElementById('form-status');
    status.hidden = false;
    status.focus();
    
    // Redirect to lesson map after 2 seconds
    setTimeout(() => {
      window.location.href = 'lessonmap/lesson-map.html'; 
    }, 2000);
  }, 1000);
});
