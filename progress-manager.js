// ============================================
// PROGRESS MANAGER
// Handles all progress tracking from Firebase
// NO localStorage for progress data
// ============================================

import { db } from './firebase-config.js';
import { ref, get, update } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

// ============================================
// GET FRESH PROGRESS DATA FROM FIREBASE
// ============================================
let lastProgressCache = null;
let lastProgressTime = 0;

export async function getProgressData(uid) {
  try {
    // Use cache if data is less than 5 seconds old
    const now = Date.now();
    if (lastProgressCache && (now - lastProgressTime) < 5000) {
      console.log('✅ Using cached progress data');
      return lastProgressCache;
    }

    const snapshot = await get(ref(db, `users/${uid}`));
    if (snapshot.exists()) {
      const data = snapshot.val();
      const result = {
        stars: data.stars || 0,
        lessons: data.lessons || 0,
        completedTopics: data.completedTopics || {},
        completedQuizzes: data.completedQuizzes || {}
      };
      
      // Cache the result
      lastProgressCache = result;
      lastProgressTime = now;
      
      return result;
    }
    
    const emptyResult = {
      stars: 0,
      lessons: 0,
      completedTopics: {},
      completedQuizzes: {}
    };
    
    lastProgressCache = emptyResult;
    lastProgressTime = now;
    return emptyResult;
    
  } catch (error) {
    console.error('❌ Error getting progress:', error.message);
    // Return cached data on error instead of null
    return lastProgressCache || {
      stars: 0,
      lessons: 0,
      completedTopics: {},
      completedQuizzes: {}
    };
  }
}

// ============================================
// MARK TOPIC AS COMPLETED
// ============================================
export async function completeTopicInFirebase(uid, topicId, starsEarned) {
  try {
    const progress = await getProgressData(uid);
    
    // Mark topic as completed
    progress.completedTopics[topicId] = {
      completed: true,
      completedAt: Date.now(),
      starsEarned: starsEarned
    };

    // Update stars
    progress.stars = (progress.stars || 0) + starsEarned;

    // Update Firebase
    await update(ref(db, `users/${uid}`), {
      stars: progress.stars,
      completedTopics: progress.completedTopics,
      lastUpdated: Date.now()
    });

    console.log(`✅ Topic ${topicId} completed! Earned ${starsEarned} stars. Total: ${progress.stars}`);
    return { success: true, totalStars: progress.stars };

  } catch (error) {
    console.error('❌ Error completing topic:', error.message);
    return { success: false, error: error.message };
  }
}

// ============================================
// MARK QUIZ AS COMPLETED
// ============================================
export async function completeQuizInFirebase(uid, quizId, starsEarned, score) {
  try {
    const progress = await getProgressData(uid);

    // Mark quiz as completed
    progress.completedQuizzes[quizId] = {
      completed: true,
      completedAt: Date.now(),
      starsEarned: starsEarned,
      score: score
    };

    // Update stars
    progress.stars = (progress.stars || 0) + starsEarned;

    // Check if lesson is now complete
    const lessonNum = extractLessonNumber(quizId);
    if (isLessonComplete(progress, lessonNum)) {
      progress.lessons = Math.max(progress.lessons || 0, lessonNum);
    }

    // Update Firebase
    await update(ref(db, `users/${uid}`), {
      stars: progress.stars,
      lessons: progress.lessons,
      completedQuizzes: progress.completedQuizzes,
      lastUpdated: Date.now()
    });

    console.log(`✅ Quiz ${quizId} completed! Score: ${score}% | Stars: ${starsEarned} | Total: ${progress.stars}`);
    return { success: true, totalStars: progress.stars, lessonsCompleted: progress.lessons };

  } catch (error) {
    console.error('❌ Error completing quiz:', error.message);
    return { success: false, error: error.message };
  }
}

// ============================================
// CHECK IF TOPIC IS COMPLETED
// ============================================
export async function isTopicCompleted(uid, topicId) {
  try {
    const progress = await getProgressData(uid);
    return progress.completedTopics[topicId] ? true : false;
  } catch (error) {
    console.error('❌ Error checking topic:', error.message);
    return false;
  }
}

// ============================================
// CHECK IF QUIZ IS COMPLETED
// ============================================
export async function isQuizCompleted(uid, quizId) {
  try {
    const progress = await getProgressData(uid);
    return progress.completedQuizzes[quizId] ? true : false;
  } catch (error) {
    console.error('❌ Error checking quiz:', error.message);
    return false;
  }
}

// ============================================
// GET LESSON COMPLETION STATUS
// ============================================
export async function getLessonStatus(uid, lessonNum) {
  try {
    const progress = await getProgressData(uid);
    const topics = [`l${lessonNum}topic1`, `l${lessonNum}topic2`, `l${lessonNum}topic3`];
    const quiz = `quiz_l${lessonNum}`;

    const topicsCompleted = topics.filter(t => progress.completedTopics[t]).length;
    const quizCompleted = progress.completedQuizzes[quiz] ? true : false;

    return {
      topicsCompleted: topicsCompleted,
      topicsTotal: 3,
      quizCompleted: quizCompleted,
      lessonCompleted: topicsCompleted === 3 && quizCompleted
    };
  } catch (error) {
    console.error('❌ Error getting lesson status:', error.message);
    return null;
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function extractLessonNumber(topicOrQuizId) {
  const match = topicOrQuizId.match(/\d+/);
  return match ? parseInt(match[0]) : 0;
}

function isLessonComplete(progress, lessonNum) {
  const topics = [`l${lessonNum}topic1`, `l${lessonNum}topic2`, `l${lessonNum}topic3`];
  const quiz = `quiz_l${lessonNum}`;

  const allTopicsCompleted = topics.every(t => progress.completedTopics[t]);
  const quizCompleted = progress.completedQuizzes[quiz];

  return allTopicsCompleted && quizCompleted;
}

// ============================================
// GET CURRENT PROGRESS FOR DISPLAY
// ============================================
export async function getCurrentProgress(uid) {
  try {
    const progress = await getProgressData(uid);
    
    return {
      totalStars: progress.stars,
      lessonsCompleted: progress.lessons,
      topicsCompleted: Object.keys(progress.completedTopics).length,
      quizzesCompleted: Object.keys(progress.completedQuizzes).length
    };
  } catch (error) {
    console.error('❌ Error getting progress:', error.message);
    return null;
  }
}

// ============================================
// RESET PROGRESS (ADMIN ONLY)
// ============================================
export async function resetProgress(uid) {
  try {
    await update(ref(db, `users/${uid}`), {
      stars: 0,
      lessons: 0,
      completedTopics: {},
      completedQuizzes: {},
      lastUpdated: Date.now()
    });

    console.log('✅ Progress reset for user');
    return { success: true };
  } catch (error) {
    console.error('❌ Error resetting progress:', error.message);
    return { success: false, error: error.message };
  }
}
