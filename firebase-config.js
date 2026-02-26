// ============================================
// FIREBASE CONFIG & AUTHENTICATION
// ============================================

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, get, set, update } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
import { getAuth, signInWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

const firebaseConfig = {
  apiKey: "AIzaSyAEMgcKGhZpui2eEYFA6T6SeYvWB51uRD0",
  authDomain: "beautifulmind-19645.firebaseapp.com",
  databaseURL: "https://beautifulmind-19645-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "beautifulmind-19645",
  storageBucket: "beautifulmind-19645.firebasestorage.app",
  messagingSenderId: "799227957055",
  appId: "1:799227957055:web:6a7397f3c43c7a9ed54d8a"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

console.log('✅ Firebase initialized');

// Valid students and admins
const ALLOWED_EMAILS = [
  "student1@beautifulmind.com","student3@beautifulmind.com","anusuya.cm@bhc.edu.in",
"balamuralikrishnan.cm@bhc.edu.in",
"kavitha.cm@bhc.edu.in",
"sutha.cm@bhc.edu.in",
"vijayalakshmi.cm@bhc.edu.in",
"mohan.cm@bhc.edu.in",
"hemalatha.cm@bhc.edu.in",
"nasrinhussaina.cm@bhc.edu.in",
"selvindelish.cm@bhc.edu.in",
"rajasekar.cm@bhc.edu.in",
"charlesdurai.cm@bhc.edu.in",
"padmavathy.cm@bhc.edu.in",
"karpagam.cm@bhc.edu.in",
"daniel.cm@bhc.edu.in",
"palpandian.cm@bhc.edu.in",
"deepa.cm@bhc.edu.in",
"maheswari.cm@bhc.edu.in",
"manikandan.cm@bhc.edu.in",
"mercypaulin.cm@bhc.edu.in",
"manivannan.cm@bhc.edu.in",
"jeyalakshmi.cm@bhc.edu.in",
"ramar.cm@bhc.edu.in",
"davidantony.cm@bhc.edu.in",
"asaithambi.cm@bhc.edu.in",
"sivasankar.cm@bhc.edu.in",
"elayaraja.cm@bhc.edu.in",
"ravishankar.cm@bhc.edu.in",
"palanikumar.cm@bhc.edu.in",
"shakila.cm@bhc.edu.in",
"samundeeshwari.cm@bhc.edu.in",
"rajesh.cm@bhc.edu.in",
"sujatha.cm@bhc.edu.in",
"vinothkumar.cm@bhc.edu.in",
"lawrenceimmanuel.cm@bhc.edu.in",
"karthik.cm@bhc.edu.in",
"kanagaraju.cm@bhc.edu.in",
"varsha.cm@bhc.edu.in",
"dhevika.cm@bhc.edu.in",
"vani.cm@bhc.edu.in",
"margaret.cm@bhc.edu.in",
"muthu kumar.cm@bhc.edu.in",
"mehraj banu.cm@bhc.edu.in",
"chandrasekar.cm@bhc.edu.in",
"thilagavathi.cm@bhc.edu.in",
"gmklaxman@gmail.com",
"proftmpremnath@gmail.com",
"umamaheswari.cm@bhc.edu.in",
"bhcsumathi@gmail.com",
"lakshmir554@gmail.com"
];

const ADMIN_ACCOUNTS = [
  "nasreenbanu375@gmail.com",
  "admin2@beautifulmind.com",
  "admin3@beautifulmind.com",
];

// ============================================
// LOGIN FUNCTION - CRITICAL FIX
// ============================================
export async function loginStudent(email, password) {
  try {
    console.log('🔐 Attempting login for:', email);
    
    // Validate email
    const validEmails = [...VALID_STUDENTS, ...ADMIN_ACCOUNTS];
    if (!validEmails.includes(email.toLowerCase())) {
      throw new Error('❌ Email not authorized. Access denied.');
    }

    // Sign in with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const uid = user.uid;

    console.log('✅ Auth login successful, UID:', uid);

    // Determine role
    const role = ADMIN_ACCOUNTS.includes(email.toLowerCase()) ? 'admin' : 'student';

    // CHECK if user exists in Firebase
    const existingSnapshot = await get(ref(db, `users/${uid}`));
    let userData;

    if (existingSnapshot.exists()) {
      // USER EXISTS - FETCH THEIR DATA WITH PROGRESS INTACT
      userData = existingSnapshot.val();
      console.log('✅ Existing user found - preserving all progress:', userData);
    } else {
      // NEW USER - CREATE INITIAL RECORD (ONLY ONCE)
      userData = {
        name: email.split('@')[0],
        email: email.toLowerCase(),
        phone: '',
        standard: '',
        role: role,
        stars: 0,
        lessons: 0,
        completedTopics: {},
        completedQuizzes: {},
        createdAt: Date.now(),
        lastUpdated: Date.now()
      };
      
      console.log('📝 New user detected - creating initial record');
      
      // Use set() ONLY for brand new users
      await set(ref(db, `users/${uid}`), userData);
      console.log('✅ New user created in Firebase');
    }

    // Save to localStorage for quick access
    localStorage.setItem('uid', uid);
    localStorage.setItem('userName', userData.name);
    localStorage.setItem('userEmail', email.toLowerCase());
    localStorage.setItem('userRole', role);
    localStorage.setItem('userPhone', userData.phone || '');
    localStorage.setItem('userStandard', userData.standard || '');

    console.log('✅ Login successful:', userData.name, '| Stars:', userData.stars, '| Lessons:', userData.lessons);
    return { success: true, user: userData, role: role, uid: uid };

  } catch (error) {
    console.error('❌ Login error:', error.message);
    return { success: false, error: error.message };
  }
}

// ============================================
// LOGOUT FUNCTION
// ============================================
export async function logoutStudent() {
  try {
    await signOut(auth);
    localStorage.clear();
    console.log('✅ Logout successful');
    return { success: true };
  } catch (error) {
    console.error('❌ Logout error:', error.message);
    return { success: false, error: error.message };
  }
}

// ============================================
// GET CURRENT USER
// ============================================
export function getCurrentUser() {
  const uid = localStorage.getItem('uid');
  const email = localStorage.getItem('userEmail');
  const role = localStorage.getItem('userRole');
  const name = localStorage.getItem('userName');

  if (!uid || !email) {
    return null;
  }

  return {
    uid: uid,
    email: email,
    role: role,
    name: name
  };
}

// ============================================
// CHECK AUTHENTICATION
// ============================================
export function isAuthenticated() {
  return getCurrentUser() !== null;
}

// ============================================
// GET USER DATA FROM FIREBASE
// ============================================
export async function getUserData(uid) {
  try {
    const snapshot = await get(ref(db, `users/${uid}`));
    if (snapshot.exists()) {
      return snapshot.val();
    }
    return null;
  } catch (error) {
    console.error('❌ Error getting user data:', error.message);
    return null;
  }
}

// ============================================
// EXPORT FIREBASE INSTANCES
// ============================================
export { app, db, auth };
