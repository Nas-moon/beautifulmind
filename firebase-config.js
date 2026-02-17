// ============================================
// FIREBASE CONFIG & AUTHENTICATION
// ============================================

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, get, set, update } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

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

// ============================================
// VALID STUDENT & ADMIN EMAILS
// ============================================
const VALID_STUDENTS = [
  "student1@beautifulmind.com",
  "student2@beautifulmind.com",
  "student3@beautifulmind.com",
  "student4@beautifulmind.com",
  "student5@beautifulmind.com",
  // Add all 30 students here
  "student6@beautifulmind.com",
  "student7@beautifulmind.com",
  "student8@beautifulmind.com",
  "student9@beautifulmind.com",
  "student10@beautifulmind.com",
  "student11@beautifulmind.com",
  "student12@beautifulmind.com",
  "student13@beautifulmind.com",
  "student14@beautifulmind.com",
  "student15@beautifulmind.com",
  "student16@beautifulmind.com",
  "student17@beautifulmind.com",
  "student18@beautifulmind.com",
  "student19@beautifulmind.com",
  "student20@beautifulmind.com",
  "student21@beautifulmind.com",
  "student22@beautifulmind.com",
  "student23@beautifulmind.com",
  "student24@beautifulmind.com",
  "student25@beautifulmind.com",
  "student26@beautifulmind.com",
  "student27@beautifulmind.com",
  "student28@beautifulmind.com",
  "student29@beautifulmind.com",
  "student30@beautifulmind.com",
];

const ADMIN_ACCOUNTS = [
  "admin1@beautifulmind.com",
  "admin2@beautifulmind.com",
  "admin3@beautifulmind.com",
];

// ============================================
// STUDENT DATA STRUCTURE (Pre-loaded in Firebase)
// ============================================
const STUDENT_DATABASE = {
  "student1@beautifulmind.com": {
    name: "Aarav Sharma",
    email: "student1@beautifulmind.com",
    phone: "9876543210",
    standard: "7th Grade",
    role: "student"
  },
  "student2@beautifulmind.com": {
    name: "Priya Desai",
    email: "student2@beautifulmind.com",
    phone: "9876543211",
    standard: "8th Grade",
    role: "student"
  },
  // Add data for all 30 students...
};

// ============================================
// LOGIN FUNCTION
// ============================================
export async function loginStudent(email, password) {
  try {
    // Validate email
    const validEmails = [...VALID_STUDENTS, ...ADMIN_ACCOUNTS];
    if (!validEmails.includes(email.toLowerCase())) {
      throw new Error('❌ Email not authorized. Access denied.');
    }

    // Sign in with Firebase
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Determine role
    const role = ADMIN_ACCOUNTS.includes(email.toLowerCase()) ? 'admin' : 'student';

    // Get or create user data
    let userData = STUDENT_DATABASE[email.toLowerCase()];
    
    if (!userData) {
      // Create new student record
      userData = {
        name: email.split('@')[0],
        email: email,
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
    }

    // Save to Firebase
    await set(ref(db, `users/${user.uid}`), userData);

    // Save to localStorage
    localStorage.setItem('uid', user.uid);
    localStorage.setItem('userName', userData.name);
    localStorage.setItem('userEmail', email.toLowerCase());
    localStorage.setItem('userRole', role);
    localStorage.setItem('userPhone', userData.phone || '');
    localStorage.setItem('userStandard', userData.standard || '');

    console.log('✅ Login successful:', userData.name, role);
    return { success: true, user: userData, role: role };

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

  if (!uid || !email) return null;

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
// SAVE PROGRESS TO FIREBASE
// ============================================
export async function saveProgress(uid, progressData) {
  try {
    const updateData = {
      stars: progressData.stars,
      lessons: progressData.lessons,
      completedTopics: progressData.completedTopics,
      completedQuizzes: progressData.completedQuizzes,
      lastUpdated: Date.now()
    };

    await update(ref(db, `users/${uid}`), updateData);
    console.log('✅ Progress saved to Firebase');
    return { success: true };

  } catch (error) {
    console.error('❌ Error saving progress:', error.message);
    return { success: false, error: error.message };
  }
}

// ============================================
// EXPORT FIREBASE INSTANCES
// ============================================
export { app, db, auth };
