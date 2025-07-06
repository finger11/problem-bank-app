document.addEventListener("DOMContentLoaded", () => {
  let questions = [];

  async function startExam() {
    document.getElementById("startBtn").style.display = "none";  // 시작 버튼 숨기기

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
        <div class="question" data-idx="${index}">
          <p>${index+1}. ${q.question_text}</p>
          <div class="choices">
            ${q.choices.map((c,i) => 
              `<button type="button" class="choice-btn" data-q="${index}" data-v="${i+1}">${c}</button>`
            ).join('')}
          </div>
        </div>
        <hr>
      `;
    });
    examDiv.innerHTML += `<button class="submit" id="submitBtn">제출</button>`;

    // 선택 버튼 이벤트
    document.querySelectorAll(".choice-btn").forEach(btn => {
      btn.addEventListener("click", e => {
        const qIndex = e.target.dataset.q;
        const val = e.target.dataset.v;
        document.querySelectorAll(`.choice-btn[data-q='${qIndex}']`).forEach(b => {
          b.classList.remove("selected");
        });
        e.target.classList.add("selected");
        // hidden input으로 값 보관
        let hidden = document.getElementById(`q${qIndex}`);
        if (!hidden) {
          hidden = document.createElement("input");
          hidden.type = "hidden";
          hidden.name = `q${qIndex}`;
          hidden.id = `q${qIndex}`;
          examDiv.appendChild(hidden);
        }
        hidden.value = val;
      });
    });

    // 제출 버튼
    document.getElementById("submitBtn").addEventListener("click", () => {
      let score = 0;
      const results = [];
      selectedQuestions.forEach((q, index) => {
        const hidden = document.getElementById(`q${index}`);
        const selected = hidden ? parseInt(hidden.value) : null;
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
