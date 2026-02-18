// ============================================
// PROGRESS MANAGER
// Handles all progress tracking from Firebase
// ============================================

import { db } from './firebase-config.js';
import { ref, get, update } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

// Cache management
let progressCache = {};
let cacheTimes = {};
const CACHE_DURATION = 2000; // 2 second cache to avoid stale data

export async function getProgressData(uid) {
  try {
    const now = Date.now();
    const cacheKey = `progress_${uid}`;
    
    // Return cache only if very fresh (< 2 seconds)
    if (progressCache[uid] && cacheTimes[uid] && (now - cacheTimes[uid]) < CACHE_DURATION) {
      console.log('✅ Using cached progress');
      return progressCache[uid];
    }

    // Fetch fresh data from Firebase
    const snapshot = await get(ref(db, `users/${uid}`));
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      const result = {
        stars: data.stars || 0,
        lessons: data.lessons || 0,
        completedTopics: data.completedTopics || {},
        completedQuizzes: data.completedQuizzes || {}
      };
      
      // Update cache
      progressCache[uid] = result;
      cacheTimes[uid] = now;
      
      console.log(`✅ Progress fetched from Firebase - Stars: ${result.stars}, Lessons: ${result.lessons}`);
      return result;
    }
    
    const emptyResult = {
      stars: 0,
      lessons: 0,
      completedTopics: {},
      completedQuizzes: {}
    };
    
    progressCache[uid] = emptyResult;
    cacheTimes[uid] = now;
    
    console.log('ℹ️ No progress found, returning empty');
    return emptyResult;
    
  } catch (error) {
    console.error('❌ Error getting progress:', error.message);
    // Return cached data if available, otherwise empty
    return progressCache[uid] || {
      stars: 0,
      lessons: 0,
      completedTopics: {},
      completedQuizzes: {}
    };
  }
}

// Clear cache to force fresh load
export function clearProgressCache(uid) {
  delete progressCache[uid];
  delete cacheTimes[uid];
  console.log('🔄 Progress cache cleared');
}

export async function completeTopicInFirebase(uid, topicId, starsEarned) {
  try {
    console.log(`🎯 Completing topic: ${topicId}, earning ${starsEarned} stars`);
    
    // Get fresh data (don't use old cache for this operation)
    const snapshot = await get(ref(db, `users/${uid}`));
    
    let progress;
    if (snapshot.exists()) {
      progress = snapshot.val();
    } else {
      progress = {
        stars: 0,
        lessons: 0,
        completedTopics: {},
        completedQuizzes: {}
      };
    }

    // Check if already completed (prevent double counting)
    if (progress.completedTopics && progress.completedTopics[topicId]) {
      console.log(`⚠️ Topic ${topicId} already completed, skipping`);
      return { 
        success: true, 
        totalStars: progress.stars || 0,
        alreadyCompleted: true
      };
    }

    // Mark topic as completed
    if (!progress.completedTopics) progress.completedTopics = {};
    progress.completedTopics[topicId] = {
      completed: true,
      completedAt: Date.now(),
      starsEarned: starsEarned
    };

    // Add stars
    const oldStars = progress.stars || 0;
    progress.stars = oldStars + starsEarned;

    // Update Firebase
    await update(ref(db, `users/${uid}`), {
      stars: progress.stars,
      completedTopics: progress.completedTopics,
      lastUpdated: Date.now()
    });

    // Clear cache to force fresh load next time
    clearProgressCache(uid);

    console.log(`✅ Topic ${topicId} saved! Stars: ${oldStars} → ${progress.stars}`);
    return { success: true, totalStars: progress.stars };

  } catch (error) {
    console.error('❌ Error completing topic:', error.message);
    return { success: false, error: error.message };
  }
}

export async function completeQuizInFirebase(uid, quizId, starsEarned, score) {
  try {
    console.log(`🎯 Completing quiz: ${quizId}, score: ${score}%, earning ${starsEarned} stars`);
    
    // Get fresh data
    const snapshot = await get(ref(db, `users/${uid}`));
    
    let progress;
    if (snapshot.exists()) {
      progress = snapshot.val();
    } else {
      progress = {
        stars: 0,
        lessons: 0,
        completedTopics: {},
        completedQuizzes: {}
      };
    }

    // Check if already completed
    if (progress.completedQuizzes && progress.completedQuizzes[quizId]) {
      console.log(`⚠️ Quiz ${quizId} already completed, skipping`);
      return {
        success: true,
        totalStars: progress.stars || 0,
        lessonsCompleted: progress.lessons || 0,
        alreadyCompleted: true
      };
    }

    // Mark quiz as completed
    if (!progress.completedQuizzes) progress.completedQuizzes = {};
    progress.completedQuizzes[quizId] = {
      completed: true,
      completedAt: Date.now(),
      starsEarned: starsEarned,
      score: score
    };

    // Add stars
    const oldStars = progress.stars || 0;
    progress.stars = oldStars + starsEarned;

    // Check if lesson is complete
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

    // Clear cache
    clearProgressCache(uid);

    console.log(`✅ Quiz ${quizId} saved! Stars: ${oldStars} → ${progress.stars}`);
    return { 
      success: true, 
      totalStars: progress.stars, 
      lessonsCompleted: progress.lessons 
    };

  } catch (error) {
    console.error('❌ Error completing quiz:', error.message);
    return { success: false, error: error.message };
  }
}

export async function isTopicCompleted(uid, topicId) {
  try {
    const progress = await getProgressData(uid);
    return progress.completedTopics[topicId] ? true : false;
  } catch (error) {
    console.error('❌ Error checking topic:', error.message);
    return false;
  }
}

export async function isQuizCompleted(uid, quizId) {
  try {
    const progress = await getProgressData(uid);
    return progress.completedQuizzes[quizId] ? true : false;
  } catch (error) {
    console.error('❌ Error checking quiz:', error.message);
    return false;
  }
}

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

export async function resetProgress(uid) {
  try {
    await update(ref(db, `users/${uid}`), {
      stars: 0,
      lessons: 0,
      completedTopics: {},
      completedQuizzes: {},
      lastUpdated: Date.now()
    });

    clearProgressCache(uid);
    console.log('✅ Progress reset for user');
    return { success: true };
  } catch (error) {
    console.error('❌ Error resetting progress:', error.message);
    return { success: false, error: error.message };
  }
}
