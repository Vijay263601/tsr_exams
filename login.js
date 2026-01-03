function startExam() {
  const name = document.getElementById("name").value.trim();
  const roll = document.getElementById("roll").value.trim();
  const email = document.getElementById("email").value.trim();
  const examId = document.getElementById("examId").value.trim();

  if (!name || !roll || !email || !examId) {
    alert("Please fill all fields");
    return;
  }

  sessionStorage.setItem(
    "student",
    JSON.stringify({
      name: name,
      roll: roll,
      email: email
    })
  );

  window.location.href =
    BASE_PATH + "/exam/exam.html?examId=" +
    encodeURIComponent(examId);
}
