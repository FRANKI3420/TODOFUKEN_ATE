let cityData = [];
let cityBelong = [];
let cityFurigana = [];
let currentIndex = null;
let score = 0;
let streak = 0;

// 音声ファイルの取得
const atariSound = document.getElementById("atari-sound");
const hazureSound = document.getElementById("hazure-sound");
const celebrateSound = document.getElementById("celebrate-sound");
const celebrationDiv = document.getElementById("celebration");

// CSVの読み込み
fetch("machi_fixed.csv")
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

// --- 次の問題を出す関数 ---
function showNextQuestion() {
  if (cityData.length === 0) return;

  // ランダムに出題
  currentIndex = Math.floor(Math.random() * cityData.length);

  // 画面表示のリセット
  document.getElementById("result").textContent =
    `問題: ${cityData[currentIndex]}（${cityFurigana[currentIndex]}）`;

  const judgeDiv = document.getElementById("judge");
  judgeDiv.textContent = "";
  judgeDiv.className = "";
}

// --- スコア更新と演出 ---
function updateScore(isCorrect) {
  if (isCorrect) {
    score++;
    streak++;
    // 3, 5, 10連続で特別演出
    if ([3, 5, 10].includes(streak)) {
      celebrationDiv.textContent = `🎉 ${streak}連続正解！すごい！ 🎉`;
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

// --- 回答を判定する関数 ---
function handleAnswer(selectedPref) {
  if (currentIndex === null) return;

  const correctPref = cityBelong[currentIndex];
  const judgeDiv = document.getElementById("judge");

  // 判定（CSVの「県」ありなし両方に対応できるよう includes を使用）
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

  // ⭐【重要】ここで2秒後に次の問題へ
  // currentIndexをnullにすることで、連打による誤作動を防ぐ
  const tempIndex = currentIndex;
  currentIndex = null;

  setTimeout(() => {
    showNextQuestion();
  }, 2000);
}

// --- 地方別ボタンの生成 ---
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

// スタートボタンのイベント
document.getElementById("startButton").addEventListener("click", showNextQuestion);