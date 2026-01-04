let cityData = [];
let cityBelong = [];
let cityFurigana = [];
let currentIndex = null;
let score = 0;
let streak = 0;

// 追加分：ゲーム管理用変数
let questionCount = 0;
const MAX_QUESTIONS = 10;
let startTime;
let timerInterval;

const atariSound = document.getElementById("atari-sound");
const hazureSound = document.getElementById("hazure-sound");
const celebrateSound = document.getElementById("celebrate-sound");
const celebrationDiv = document.getElementById("celebration");

// CSVの読み込み（変更なし）
fetch("shi.csv")
  .then(response => response.text())
  .then(text => {
    const lines = text.trim().split("\n");
    lines.slice(1).forEach(line => {
      const [no, pref, city, furigana] = line.split(",");
      cityBelong.push(pref);
      cityData.push(city);
      cityFurigana.push(furigana);
    });
  });

// --- ゲーム開始 ---
function startQuiz() {
  score = 0;
  streak = 0;
  questionCount = 0;
  document.getElementById("score").textContent = score;
  document.getElementById("streak").textContent = streak;
  document.getElementById("quiz-area").style.display = "block";
  document.getElementById("startButton").style.display = "none";
  document.getElementById("ranking-container").style.display = "none";

  startTime = Date.now(); // タイマースタート
  showNextQuestion();
}

function showNextQuestion() {
  if (questionCount >= MAX_QUESTIONS) {
    finishGame();
    return;
  }

  questionCount++;
  currentIndex = Math.floor(Math.random() * cityData.length);

  document.getElementById("result").textContent =
    `第 ${questionCount} 問: ${cityData[currentIndex]}（${cityFurigana[currentIndex]}）`;

  const judgeDiv = document.getElementById("judge");
  judgeDiv.textContent = "";
  judgeDiv.className = "";
}

function handleAnswer(selectedPref) {
  if (currentIndex === null) return;

  const correctPref = cityBelong[currentIndex];
  const judgeDiv = document.getElementById("judge");

  if (correctPref.includes(selectedPref) || selectedPref.includes(correctPref)) {
    judgeDiv.textContent = `◯ 正解！: ${correctPref}`;
    judgeDiv.className = "correct";
    atariSound.currentTime = 0;
    atariSound.play();
    updateScore(true);
  } else {
    judgeDiv.textContent = `× 不正解（正解: ${correctPref}）`;
    judgeDiv.className = "incorrect";
    hazureSound.currentTime = 0;
    hazureSound.play();
    updateScore(false);
  }

  currentIndex = null;
  setTimeout(() => {
    showNextQuestion();
  }, 1000); // 次の問題への間隔を少し短くしました
}

function updateScore(isCorrect) {
  if (isCorrect) {
    score++;
    streak++;
    if ([3, 5, 10].includes(streak)) {
      celebrationDiv.textContent = `🎉 ${streak}連続正解！ 🎉`;
      celebrationDiv.style.display = "block";
      celebrateSound.currentTime = 0;
      celebrateSound.play();
      setTimeout(() => { celebrationDiv.style.display = "none"; }, 2000);
    }
  } else {
    streak = 0;
  }
  document.getElementById("score").textContent = score;
  document.getElementById("streak").textContent = streak;
}

// --- ゲーム終了とランキング処理 ---
function finishGame() {
  const endTime = Date.now();
  const totalTime = ((endTime - startTime) / 1000).toFixed(2); // 秒単位

  document.getElementById("quiz-area").style.display = "none";
  document.getElementById("result").textContent = `終了！ 10問中 ${score}問正解！ タイム: ${totalTime}秒`;

  saveRanking(score, totalTime);
  showRanking();
}

function saveRanking(newScore, newTime) {
  let ranking = JSON.parse(localStorage.getItem("prefQuizRanking")) || [];
  const date = new Date().toLocaleDateString();

  ranking.push({ score: newScore, time: parseFloat(newTime), date: date });

  // スコア順（高い順）、同じスコアならタイム順（速い順）でソート
  ranking.sort((a, b) => b.score - a.score || a.time - b.time);

  // 上位5位までを保存
  ranking = ranking.slice(0, 5);
  localStorage.setItem("prefQuizRanking", JSON.stringify(ranking));
}

function showRanking() {
  const ranking = JSON.parse(localStorage.getItem("prefQuizRanking")) || [];
  const tbody = document.getElementById("ranking-body");
  tbody.innerHTML = "";

  ranking.forEach((record, index) => {
    const row = `<tr>
            <td>${index + 1}位</td>
            <td>${record.score}問</td>
            <td>${record.time}秒</td>
            <td>${record.date}</td>
        </tr>`;
    tbody.innerHTML += row;
  });

  document.getElementById("ranking-container").style.display = "block";
}

// ボタン生成ロジック（そのまま）
const regions = [
  { name: "北海道・東北", prefs: ["北海道", "青森", "岩手", "宮城", "秋田", "山形", "福島"] },
  { name: "関東", prefs: ["茨城", "栃木", "群馬", "埼玉", "千葉", "東京", "神奈川"] },
  { name: "中部", prefs: ["新潟", "富山", "石川", "福井", "山梨", "長野", "岐阜", "静岡", "愛知"] },
  { name: "近畿", prefs: ["三重", "滋賀", "京都", "大阪", "兵庫", "奈良", "和歌山"] },
  { name: "中国", prefs: ["鳥取", "島根", "岡山", "広島", "山口"] },
  { name: "四国", prefs: ["徳島", "香川", "愛媛", "高知"] },
  { name: "九州・沖縄", prefs: ["福岡", "佐賀", "長崎", "熊本", "大分", "宮崎", "鹿児島", "沖縄"] }
];

const container = document.getElementById("region-container");
regions.forEach(region => {
  const section = document.createElement("div");
  section.className = "region-section";
  const title = document.createElement("div");
  title.className = "region-title";
  title.textContent = region.name;
  section.appendChild(title);
  const grid = document.createElement("div");
  grid.className = "pref-grid";
  region.prefs.forEach(pref => {
    const btn = document.createElement("button");
    btn.className = "pref-btn";
    btn.textContent = pref;
    btn.addEventListener("click", () => handleAnswer(pref));
    grid.appendChild(btn);
  });
  section.appendChild(grid);
  container.appendChild(section);
});

document.getElementById("startButton").addEventListener("click", startQuiz);