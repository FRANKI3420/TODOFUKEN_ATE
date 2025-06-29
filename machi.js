let cityData = [];
let cityBelong = [];
let currentIndex = null;
let score = 0;
let streak = 0;


fetch("machi.csv")
  .then(response => response.text())
  .then(text => {
    const lines = text.trim().split("\n");
    lines.slice(1).forEach(line => {
      const [no, pref, city] = line.split(",");
      cityBelong.push(pref);
      cityData.push(city);
    });

    // ✅ CSV読み込みが完了してからボタンを有効にする
    document.getElementById("startButton").disabled = false;
  });


// 出題ボタン
document.getElementById("startButton").addEventListener("click", () => {
  if (cityData.length === 0) return;

  currentIndex = Math.floor(Math.random() * cityData.length);

  document.getElementById("result").textContent =
    `問題: ${cityData[currentIndex]}`;

  document.getElementById("judge").textContent = "";
});



// ✅ 地図描画とクリックによる判定
const d = new jpmap.japanMap(document.getElementById("my-map"), {
  areas: [
      {code : 1, name: "北海道", color: "#7f7eda", hoverColor: "#b3b2ee"},
      {code : 2, name: "青森", color: "#759ef4", hoverColor: "#98b9ff"},
      {code : 3, name: "岩手", color: "#759ef4", hoverColor: "#98b9ff"},
      {code : 4, name: "宮城", color: "#759ef4", hoverColor: "#98b9ff"},
      {code : 5, name: "秋田", color: "#759ef4", hoverColor: "#98b9ff"},
      {code : 6, name: "山形", color: "#759ef4", hoverColor: "#98b9ff"},
      {code : 7, name: "福島", color: "#759ef4", hoverColor: "#98b9ff"},
      {code : 8, name: "茨城", color: "#7ecfea", hoverColor: "#b7e5f4"},
      {code : 9, name: "栃木", color: "#7ecfea", hoverColor: "#b7e5f4"},
      {code : 10, name: "群馬", color: "#7ecfea", hoverColor: "#b7e5f4"},
      {code : 11, name: "埼玉", color: "#7ecfea", hoverColor: "#b7e5f4"},
      {code : 12, name: "千葉", color: "#7ecfea", hoverColor: "#b7e5f4"},
      {code : 13, name: "東京", color: "#7ecfea", hoverColor: "#b7e5f4"},
      {code : 14, name: "神奈川", color: "#7ecfea", hoverColor: "#b7e5f4"},
      {code : 15, name: "新潟", color: "#7cdc92", hoverColor: "#aceebb"},
      {code : 16, name: "富山", color: "#7cdc92", hoverColor: "#aceebb"},
      {code : 17, name: "石川", color: "#7cdc92", hoverColor: "#aceebb"},
      {code : 18, name: "福井", color: "#7cdc92", hoverColor: "#aceebb"},
      {code : 19, name: "山梨", color: "#7cdc92", hoverColor: "#aceebb"},
      {code : 20, name: "長野", color: "#7cdc92", hoverColor: "#aceebb"},
      {code : 21, name: "岐阜", color: "#7cdc92", hoverColor: "#aceebb"},
      {code : 22, name: "静岡", color: "#7cdc92", hoverColor: "#aceebb"},
      {code : 23, name: "愛知", color: "#7cdc92", hoverColor: "#aceebb"},
      {code : 24, name: "三重", color: "#ffe966", hoverColor: "#fff19c"},
      {code : 25, name: "滋賀", color: "#ffe966", hoverColor: "#fff19c"},
      {code : 26, name: "京都", color: "#ffe966", hoverColor: "#fff19c"},
      {code : 27, name: "大阪", color: "#ffe966", hoverColor: "#fff19c"},
      {code : 28, name: "兵庫", color: "#ffe966", hoverColor: "#fff19c"},
      {code : 29, name: "奈良", color: "#ffe966", hoverColor: "#fff19c"},
      {code : 30, name: "和歌山", color: "#ffe966", hoverColor: "#fff19c"},
      {code : 31, name: "鳥取", color: "#ffcc66", hoverColor: "#ffe0a3"},
      {code : 32, name: "島根", color: "#ffcc66", hoverColor: "#ffe0a3"},
      {code : 33, name: "岡山", color: "#ffcc66", hoverColor: "#ffe0a3"},
      {code : 34, name: "広島", color: "#ffcc66", hoverColor: "#ffe0a3"},
      {code : 35, name: "山口", color: "#ffcc66", hoverColor: "#ffe0a3"},
      {code : 36, name: "徳島", color: "#fb9466", hoverColor: "#ffbb9c"},
      {code : 37, name: "香川", color: "#fb9466", hoverColor: "#ffbb9c"},
      {code : 38, name: "愛媛", color: "#fb9466", hoverColor: "#ffbb9c"},
      {code : 39, name: "高知", color: "#fb9466", hoverColor: "#ffbb9c"},
      {code : 40, name: "福岡", color: "#ff9999", hoverColor: "#ffbdbd"},
      {code : 41, name: "佐賀", color: "#ff9999", hoverColor: "#ffbdbd"},
      {code : 42, name: "長崎", color: "#ff9999", hoverColor: "#ffbdbd"},
      {code : 43, name: "熊本", color: "#ff9999", hoverColor: "#ffbdbd"},
      {code : 44, name: "大分", color: "#ff9999", hoverColor: "#ffbdbd"},
      {code : 45, name: "宮崎", color: "#ff9999", hoverColor: "#ffbdbd"},
      {code : 46, name: "鹿児島", color: "#ff9999", hoverColor: "#ffbdbd"},
      {code : 47, name: "沖縄", color: "#eb98ff", hoverColor: "#f5c9ff"},
    ],
  showsPrefectureName: true,
  width: 800,
  movesIslands: true,
  borderLineColor: "#000000",
  lang: 'ja',
  onSelect: function (data) {
    if (currentIndex === null) {
      alert("先に問題を表示してください。");
      return;
    }

    const selectedPref = data.area.name; // クリックされた都道府県名（例：兵庫県）
    const correctPref = cityBelong[currentIndex];

    const judgeDiv = document.getElementById("judge");
    if (selectedPref === correctPref) {
      judgeDiv.textContent =  `◯ 正解！: ${correctPref} `;
      judgeDiv.style.color = "green";
      // score += 1;
      // streak += 1;
      atariSound.play();
      updateScore(true, correctPref);
    } else {
      judgeDiv.textContent = `× 不正解（正解: ${correctPref}）`;
      judgeDiv.style.color = "red";
      streak = 0; // ❌で連続正解リセット
      hazureSound.play();
      updateScore(false, correctPref);

    }
    // スコアを画面に反映
    document.getElementById("score").textContent = score;
    document.getElementById("streak").textContent = streak;

    // ✅ 3秒後に次の問題を自動出題
    setTimeout(showNextQuestion, 2000);
  }
});

const scoreSpan = document.getElementById("score");
const streakSpan = document.getElementById("streak");
const celebrationDiv = document.getElementById("celebration");
const celebrateSound = document.getElementById("celebrate-sound");
const atariSound = document.getElementById("atari-sound");
const hazureSound = document.getElementById("hazure-sound");

function updateScore(isCorrect, correctPref) {
  if (isCorrect) {
    score++;
    streak++;

    if (streak === 3 || streak === 5 || streak === 10) {
      // 🔊 効果音 + 🎉 表示
      celebrationDiv.textContent = `🎉 ${streak}連続正解！すごい！ 🎉`;
      celebrationDiv.style.display = "block";
      celebrateSound.currentTime = 0;
      celebrateSound.play();

      // 自動的に非表示に（2秒後）
      setTimeout(() => {
        celebrationDiv.style.display = "none";
      }, 2000);
    }

  } else {
    streak = 0;
    celebrationDiv.style.display = "none"; // 不正解で祝福消す
  }

  scoreSpan.textContent = score;
  streakSpan.textContent = streak;
}


function showNextQuestion() {
  if (cityData.length === 0) return;

  currentIndex = Math.floor(Math.random() * cityData.length);

  document.getElementById("result").textContent =
    `問題: ${cityData[currentIndex]}`;

  document.getElementById("judge").textContent = "";
  document.getElementById("judge").style.color = "";
}
document.getElementById("startButton").addEventListener("click", showNextQuestion);
