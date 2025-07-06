document.addEventListener("DOMContentLoaded", () => {
  async function startExam() {
    document.getElementById("startBtn").style.display = "none";

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
          <p>${index+1}. ${q.question_text.replace(/\n/g, "<br>")}</p>
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
    window.scrollTo(0, 0);
    const examDiv = document.getElementById("exam");
    examDiv.style.display = "none";
    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = "";

    const totalScore = Math.round(score);
    const isPass = totalScore >= 60;
    const passFail = isPass ? "합격" : "불합격";
    const passFailColor = isPass ? "blue" : "red";

    const totalQuestions = results.length;
    const correctCount = results.filter(r => r.isCorrect).length;

    resultDiv.innerHTML += `<h1 style="color:${passFailColor}">${correctCount}/${totalQuestions} (${passFail})</h1>`;

    results.forEach((item, idx) => {
      let noAnswerMark = "";
      if (item.selected === null) {
        noAnswerMark = `<p style="color:red">[무응답]</p>`;
      }

      let choicesHtml = item.q.choices.map((choice, i) => {
        let mark = "";
        let markColor = "";

        if (item.q.answer === i + 1) {
          // 정답에는 항상 [O]
          mark = "[O]";
          markColor = "blue";
        }

        if (item.selected !== null && item.selected === i + 1 && item.selected !== item.q.answer) {
          // 사용자가 선택한 오답
          mark = "[X]";
          markColor = "red";
        }

        return `<div>${choice} ${mark ? `<span style="color:${markColor}">${mark}</span>` : ""}</div>`;
      }).join('');

      resultDiv.innerHTML += `
        <div>
          <p>${idx+1}. ${item.q.question_text.replace(/\n/g, "<br>")}</p>
          ${noAnswerMark}
          ${choicesHtml}
          ${item.q.explanation ? `<p><em>해설: ${item.q.explanation.replace(/\n/g,"<br>")}</em></p>` : ""}
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
