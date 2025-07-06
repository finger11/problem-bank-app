document.addEventListener("DOMContentLoaded", () => {
  async function startExam() {
    document.getElementById("startBtn").style.display = "none";  // 시작 버튼 숨김

    const res = await fetch("questions.json");
    const data = await res.json();

    const rules = { 1:5, 2:10, 3:5, 4:15, 5:10 };
    let selectedQuestions = [];

    for (const [subject_id, count] of Object.entries(rules)) {
      const pool = data.filter(q => Number(q.subject_id) === Number(subject_id));
      console.log(`과목 ${subject_id} 문제은행 총 ${pool.length}개, 필요한 ${count}개`);
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
    window.scrollTo(0, 0);  // 맨 위로 이동
    const examDiv = document.getElementById("exam");
    examDiv.style.display = "none";
    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = "";

    const totalScore = Math.round(score);
    const passFail = totalScore >= 60 ? "합격" : "불합격";

    const totalQuestions = results.length;
    const correctCount = results.filter(r => r.isCorrect).length;

    resultDiv.innerHTML += `<h1>${correctCount}/${totalQuestions} (${passFail})</h1>`;

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

    resultDiv.innerHTML += `
      <button class="submit" onclick="window.location.reload()">모의고사 다시풀기</button>
    `;
  }

  window.startExam = startExam;
});
