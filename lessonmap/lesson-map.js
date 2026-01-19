let completedLessons = Number(localStorage.getItem("completedLessons")) || 0;

const lessons = document.querySelectorAll(".lesson");

lessons.forEach((lesson, index) => {
  const lessonNumber = index + 1;
  const node = lesson.querySelector(".node");

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

  // 🔥 CLICK ON NODE (not lesson)
  node.addEventListener("click", (e) => {
    e.stopPropagation();

    if (lesson.classList.contains("locked")) return;

    window.location.href = `../lesson${lessonNumber}/l${lessonNumber}topic1.html`;
  });
});

function addChampionBadge(lesson) {
  if (lesson.querySelector(".champion")) return;

  const badge = document.createElement("span");
  badge.className = "champion";
  badge.textContent = "🏆";

  badge.style.position = "absolute";
  badge.style.fontSize = "1.6rem";
  badge.style.background = "transparent";
  badge.style.border = "none";

  // random left / right
  badge.style.left = Math.random() > 0.5 ? "-26px" : "70px";
  badge.style.top = "18px";

  lesson.appendChild(badge);
}
