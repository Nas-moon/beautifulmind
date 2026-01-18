let completedLessons = Number(localStorage.getItem("completedLessons")) || 0;

const lessons = document.querySelectorAll(".lesson");

lessons.forEach((lesson, index) => {
  const lessonNumber = index + 1;

  // reset states
  lesson.classList.remove("locked", "completed", "current");

  // ✅ COMPLETED LESSONS
  if (lessonNumber <= completedLessons) {
    lesson.classList.add("completed");
    addChampionBadge(lesson);
  }
  // ▶️ CURRENT (next unlocked)
  else if (lessonNumber === completedLessons + 1) {
    lesson.classList.add("current");
  }
  // 🔒 LOCKED
  else {
    lesson.classList.add("locked");
  }

  // CLICK HANDLER
  lesson.addEventListener("click", () => {
    if (lesson.classList.contains("locked")) return;

    // ♻️ allow replay of completed lessons
    window.location.href = `l${lessonNumber}topic1.html`;
  });
});

/* 🏆 CHAMPION BADGE FOR COMPLETED LESSONS */
function addChampionBadge(lesson) {
  // prevent duplicate emoji
  if (lesson.querySelector(".champion")) return;

  const badge = document.createElement("span");
  badge.className = "champion";
  badge.textContent = " 🏆";
  badge.style.marginLeft = "6px";
  badge.style.fontSize = "1.2rem";

  lesson.appendChild(badge);
}
