// Firebase Configuration
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getDatabase, ref, get, set } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

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
const auth = getAuth(app);
const db = getDatabase(app);

// ============================================
// WHITELIST - STUDENTS WHO CAN REGISTER
// ============================================
const ALLOWED_EMAILS = [
  "student1@beautifulmind.com",
  "student2@beautifulmind.com",
  "student3@beautifulmind.com",
  "student4@beautifulmind.com",
  "student5@beautifulmind.com",
  "anusuya.cm@bhc.edu.in",
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
  // Add more student emails here
];

// ============================================
// ADMIN ACCOUNTS
// ============================================
const ADMIN_ACCOUNTS = [
  "admin1@beautifulmind.com",
  "nasreenbanu375@gmail.com",
  // Add more admin emails here
];

// ============================================
// LOGIN FUNCTION
// ============================================
export async function loginStudent(email, password) {
  try {
    // Step 1: Sign in with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    console.log('✅ Auth login successful for:', user.email);

    // Step 2: Get user data from Database
    const userSnapshot = await get(ref(db, `users/${user.uid}`));

    if (!userSnapshot.exists()) {
      return {
        success: false,
        error: '❌ User profile not found. Please contact admin.',
        role: null
      };
    }

    const userData = userSnapshot.val();
    const userRole = userData.role || 'student';

    console.log('✅ User data retrieved. Role:', userRole);

    return {
      success: true,
      error: null,
      role: userRole,
      userData: userData
    };

  } catch (error) {
    console.error('❌ Login error:', error.code, error.message);

    let errorMsg = '❌ Login failed. Please try again.';

    if (error.code === 'auth/user-not-found') {
      errorMsg = '❌ Email not found. Please register first.';
    } else if (error.code === 'auth/wrong-password') {
      errorMsg = '❌ Incorrect password. Please try again.';
    } else if (error.code === 'auth/invalid-email') {
      errorMsg = '❌ Invalid email address.';
    } else if (error.code === 'auth/user-disabled') {
      errorMsg = '❌ This account has been disabled.';
    } else if (error.code === 'auth/too-many-requests') {
      errorMsg = '❌ Too many failed attempts. Please try again later.';
    }

    return {
      success: false,
      error: errorMsg,
      role: null
    };
  }
}

// ============================================
// REGISTRATION FUNCTION
// ============================================
export async function registerStudent(email, password, name, phone, standard) {
  try {
    // Step 1: Check if email is in whitelist
    if (!ALLOWED_EMAILS.includes(email)) {
      return {
        success: false,
        error: '❌ This email is not registered. Please ask your administrator.'
      };
    }

    // Step 2: Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    console.log('✅ Auth user created:', user.uid);

    // Step 3: Create user profile in Database
    const userRef = ref(db, `users/${user.uid}`);
    await set(userRef, {
      name: name,
      email: email,
      phone: phone,
      standard: standard,
      role: "student",
      stars: 0,
      lessons: 0,
      completedTopics: {},
      completedQuizzes: {},
      lastUpdated: Date.now(),
      createdAt: Date.now()
    });

    console.log('✅ User profile created in database');

    return {
      success: true,
      error: null
    };

  } catch (error) {
    console.error('❌ Registration error:', error.code, error.message);

    let errorMsg = '❌ Registration failed. Please try again.';

    if (error.code === 'auth/email-already-in-use') {
      errorMsg = '❌ This email is already registered. Please login instead.';
    } else if (error.code === 'auth/weak-password') {
      errorMsg = '❌ Password is too weak. Use at least 6 characters.';
    } else if (error.code === 'auth/invalid-email') {
      errorMsg = '❌ Invalid email address.';
    }

    return {
      success: false,
      error: errorMsg
    };
  }
}

// ============================================
// EXPORTS
// ============================================
export { auth, db, app };
