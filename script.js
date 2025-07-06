document.addEventListener("DOMContentLoaded", () => {
  async function startExam() {
    document.getElementById("startBtn").style.display = "none";  // 시작 버튼만 확실히 숨기기

    const res = await fetch("questions.json");
    const data = await res.json();

    const rules = { 1:5, 2:10, 3:3, 4:15, 5:10 };
    let selectedQuestions = [];

    for (const [subject_id, count] of Object.entries(rules)) {
      const pool = data.filter(q => q.subject_id == subject_id);
      selectedQuestions = selectedQuestions.concat(
        pool.sort(() => 0.5 - Math.random()).slice(0, count)
      );
    }

    const examDiv = document.getElementById("exam");
    examDiv.innerHTML = "";

    let currentSubject = null;
    selectedQuestions.forEach((q, index) => {
      if (currentSubject !== q.subject_name) {
        examDiv.innerHTML += `<h2>${q.subject_name}</h2>`;
        currentSubject = q.subject_name;
      }
      examDiv.innerHTML += `
        <div class="question">
          <p>${index+1}. ${q.question_text}</p>
          ${q.choices.map((c,i) => 
            `<label><input type="radio" name="q${index}" value="${i+1}"> ${c}</label>`
          ).join('')}
        </div>
        <hr>
      `;
    });
    examDiv.innerHTML += `<button class="submit" id="submitBtn">제출</button>`;

    document.getElementById("submitBtn").addEventListener("click", () => {
      let score = 0;
      const results = [];
      selectedQuestions.forEach((q, index) => {
        const sel = document.querySelector(`input[name='q${index}']:checked`);
        const selected = sel ? parseInt(sel.value) : null;
        const correct = q.answer;
        const isCorrect = selected === correct;
        if(isCorrect) score += 2.22;
        results.push({q, selected, isCorrect});
      });
      showResult(score, results);
    });
  }

  function showResult(score, results) {
    const examDiv = document.getElementById("exam");
    examDiv.style.display = "none";
    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = "";

    const totalScore = Math.round(score);
    const passFail = totalScore >= 60 ? "합격" : "불합격";
    resultDiv.innerHTML += `<h1>${passFail} (${totalScore}점)</h1>`;

    results.forEach((item, idx) => {
      resultDiv.innerHTML += `
        <div>
          <p>${idx+1}. ${item.q.question_text}</p>
          <p>정답: ${item.q.choices[item.q.answer -1]}</p>
          <p>당신의 답: ${item.selected ? item.q.choices[item.selected -1] : "무응답"}</p>
          ${item.isCorrect ? "<span style='color:green'>⭕ 정답</span>" : "<span style='color:red'>❌ 오답</span>"}
          ${item.q.explanation ? `<p><em>해설: ${item.q.explanation}</em></p>` : ""}
        </div>
        <hr>
      `;
    });
  }

  window.startExam = startExam;
});
