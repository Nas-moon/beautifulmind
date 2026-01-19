let completedLessons = Number(localStorage.getItem("completedLessons")) || 0;

const lessons = document.querySelectorAll(".lesson");

lessons.forEach((lesson, index) => {
  const lessonNumber = index + 1;

  lesson.classList.remove("locked", "completed", "current");

  if (lessonNumber <= completedLessons) {
    lesson.classList.add("completed");
    addChampionBadge(lesson);
  }
  else if (lessonNumber === completedLessons + 1) {
    lesson.classList.add("current");
  }
  else {
    lesson.classList.add("locked");
  }

  lesson.addEventListener("click", () => {
    if (lesson.classList.contains("locked")) return;
    window.location.href = `../lesson${lessonNumber}/l${lessonNumber}topic1.html`;
  });
});

function addChampionBadge(lesson) {
  if (lesson.querySelector(".champion")) return;

  const badge = document.createElement("span");
  badge.className = "champion";
  badge.textContent = " 🏆";
  badge.style.marginLeft = "6px";
  badge.style.fontSize = "1.2rem";

  lesson.appendChild(badge);
}
