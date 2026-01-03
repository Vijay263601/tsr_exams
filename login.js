function startExam() {
  const name = document.getElementById("name").value.trim();
  const roll = document.getElementById("roll").value.trim();
  const email = document.getElementById("email").value.trim();
  const examId = document.getElementById("examId").value.trim();

  if (!name || !roll || !email || !examId) {
    alert("Please fill all fields");
    return;
  }

<<<<<<< HEAD
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
=======
  // Save student info for exam page
  sessionStorage.setItem(
    "student",
    JSON.stringify({ name, roll, email })
  );

  // Redirect to exam
     window.location.href =
    "../tsr_exams/exam/exam.html?examId=" + encodeURIComponent(examId);
>>>>>>> aa019b855f74ef2086072f05521e22541c972f51
}
