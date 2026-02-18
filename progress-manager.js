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
export async function getProgressData(uid) {
  try {
    console.log('📊 Fetching progress from Firebase for UID:', uid);
    
    // Always fetch fresh from Firebase
    const snapshot = await get(ref(db, `users/${uid}`));
    
    if (snapshot.exists()) {
      const userData = snapshot.val();
      console.log('✅ User data found:', userData);
      
      const result = {
        stars: userData.stars || 0,
        lessons: userData.lessons || 0,
        completedTopics: userData.completedTopics || {},
        completedQuizzes: userData.completedQuizzes || {}
      };
      
      console.log('📈 Progress loaded:', result);
      return result;
    }
    
    console.log('⚠️ No user data found, returning empty progress');
    const emptyResult = {
      stars: 0,
      lessons: 0,
      completedTopics: {},
      completedQuizzes: {}
    };
    
    return emptyResult;
    
  } catch (error) {
    console.error('❌ Error getting progress:', error.message);
    return {
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
    console.log(`🎯 Completing topic: ${topicId}`);
    
    // Get current progress
    const progress = await getProgressData(uid);
    
    // Mark topic as completed
    progress.completedTopics[topicId] = {
      completed: true,
      completedAt: Date.now(),
      starsEarned: starsEarned
    };

    // Update stars
    progress.stars = (progress.stars || 0) + starsEarned;

    // Update Firebase DIRECTLY
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
    console.log(`📝 Completing quiz: ${quizId}`);
    
    // Get current progress
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

    // Extract lesson number from quizId (e.g., "quiz_l1" -> 1)
    const lessonMatch = quizId.match(/\d+/);
    const lessonNum = lessonMatch ? parseInt(lessonMatch[0]) : 0;

    // Check if lesson is now complete (all topics + quiz done)
    if (isLessonComplete(progress, lessonNum)) {
      progress.lessons = Math.max(progress.lessons || 0, lessonNum);
      console.log(`🎊 Lesson ${lessonNum} is now complete!`);
    }

    // Update Firebase DIRECTLY
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

  const complete = allTopicsCompleted && quizCompleted;
  console.log(`Checking lesson ${lessonNum} completion:`, {
    topics: topics,
    topicsCompleted: allTopicsCompleted,
    quiz: quiz,
    quizCompleted: !!quizCompleted,
    isComplete: complete
  });
  
  return complete;
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
