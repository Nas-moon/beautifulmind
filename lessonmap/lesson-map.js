let completedLessons = Number(localStorage.getItem("completedLessons")) || 0;

// ✅ SVG lesson nodes
const lessons = document.querySelectorAll(".lesson-node");

lessons.forEach((lesson, index) => {
  const lessonNumber = index + 1;

  // reset states
  lesson.classList.remove("locked", "completed", "current");

  // ✅ COMPLETED
  if (lessonNumber <= completedLessons) {
    lesson.classList.add("completed");
    addChampionBadge(lesson);
  }
  // ▶️ CURRENT
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

    window.location.href = `../lesson${lessonNumber}/l${lessonNumber}topic1.html`;
  });
});

/* 🏆 SVG CHAMPION BADGE */
function addChampionBadge(lesson) {
  // prevent duplicate badge
  if (lesson.querySelector(".champion")) return;

  // get circle position
  const circle = lesson.querySelector("circle");
  const cx = circle.getAttribute("cx");
  const cy = circle.getAttribute("cy");

  // create SVG text badge
  const badge = document.createElementNS("http://www.w3.org/2000/svg", "text");
  badge.classList.add("champion");
  badge.textContent = "🏆";

  badge.setAttribute("x", Number(cx) + 30);
  badge.setAttribute("y", Number(cy) - 30);
  badge.setAttribute("font-size", "18");
  badge.setAttribute("text-anchor", "middle");

  lesson.appendChild(badge);
}
