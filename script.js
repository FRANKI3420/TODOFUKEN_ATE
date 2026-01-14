let cityData = [];
let cityBelong = [];
let cityFurigana = [];
let currentIndex = null;
let score = 0;
// streakを削除

// ゲーム管理用
let questionCount = 0;
const MAX_QUESTIONS = 10;
let startTime;

const atariSound = document.getElementById("atari-sound");
const hazureSound = document.getElementById("hazure-sound");
const celebrateSound = document.getElementById("celebrate-sound");
const celebrationDiv = document.getElementById("celebration");

// CSVの読み込み
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
  questionCount = 0;
  document.getElementById("score").textContent = score;
  document.getElementById("accuracy").textContent = "0";
  document.getElementById("quiz-area").style.display = "block";
  document.getElementById("startButton").style.display = "none";
  document.getElementById("ranking-container").style.display = "none";
  document.getElementById("voice-input-button").style.display = "none"; // ボタンは非表示

  startTime = Date.now();
  showNextQuestion();
  startVoiceRecognition(); // 自動的に音声認識を開始
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
  
  // 次の問題が表示されたら音声認識を再開
  if (isQuizActive && !isListening && recognition) {
    setTimeout(() => {
      try {
        recognition.start();
        isListening = true;
      } catch (e) {
        console.error("音声認識の再開に失敗しました:", e);
      }
    }, 100);
  }
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
  }, 1000);
}

// --- スコアと正答率の更新 ---
function updateScore(isCorrect) {
  if (isCorrect) {
    score++;
  }

  // 現在解いた問題数までの正答率を計算
  const currentAccuracy = Math.round((score / questionCount) * 100);

  document.getElementById("score").textContent = score;
  document.getElementById("accuracy").textContent = currentAccuracy;

  // 全問正解などの演出（任意）
  if (isCorrect && score === MAX_QUESTIONS && questionCount === MAX_QUESTIONS) {
    celebrationDiv.textContent = `🎉 全問正解！パーフェクト！ 🎉`;
    celebrationDiv.style.display = "block";
    celebrateSound.currentTime = 0;
    celebrateSound.play();
    setTimeout(() => { celebrationDiv.style.display = "none"; }, 2000);
  }
}
// --- ページの読み込み完了時にランキングを表示 ---
window.onload = function () {
  showRanking();
};

// --- ゲーム終了時の処理 ---
function finishGame() {
  const endTime = Date.now();
  const totalTime = ((endTime - startTime) / 1000).toFixed(2);
  const finalAccuracy = Math.round((score / MAX_QUESTIONS) * 100);

  document.getElementById("quiz-area").style.display = "none";
  document.getElementById("startButton").style.display = "block"; // スタートボタンを再表示
  document.getElementById("ranking-container").style.display = "block"; // ランキングを表示
  stopVoiceRecognition(); // 音声認識を停止

  alert(`終了！\n正答率: ${finalAccuracy}%\nタイム: ${totalTime}秒`);

  saveRanking(finalAccuracy, totalTime);
  // ランキング表示を更新
  showRanking();
}

// --- ランキング保存ロジック（正答率優先） ---
function saveRanking(accuracy, time) {
  let ranking = JSON.parse(localStorage.getItem("prefQuizRanking")) || [];
  const date = new Date().toLocaleDateString();

  ranking.push({ accuracy: accuracy, time: parseFloat(time), date: date });

  // ソート：正答率（降順） > タイム（昇順）
  ranking.sort((a, b) => {
    if (b.accuracy !== a.accuracy) {
      return b.accuracy - a.accuracy;
    }
    return a.time - b.time;
  });

  ranking = ranking.slice(0, 5);
  localStorage.setItem("prefQuizRanking", JSON.stringify(ranking));
}
// --- ランキング削除機能 ---
document.getElementById("resetButton").addEventListener("click", () => {
  // 確認ダイアログを表示
  const confirmDelete = confirm("これまでのランキング記録をすべて削除しますか？\nこの操作は取り消せません。");

  if (confirmDelete) {
    // LocalStorageのデータを削除
    localStorage.removeItem("prefQuizRanking");

    // 表示を更新
    showRanking();

    alert("ランキングをリセットしました。");
  }
});

// --- ランキング表示ロジック（未登録時の表示を少し親切に） ---
function showRanking() {
  const ranking = JSON.parse(localStorage.getItem("prefQuizRanking")) || [];
  const tbody = document.getElementById("ranking-body");
  tbody.innerHTML = "";

  if (ranking.length === 0) {
    // 記録がない場合は空行を表示
    tbody.innerHTML = "<tr><td colspan='4' style='color: #888; padding: 10px;'>データがありません。挑戦して記録を残そう！</td></tr>";
    return;
  }

  ranking.forEach((record, index) => {
    const row = `<tr>
            <td>${index + 1}位</td>
            <td>${record.accuracy}%</td>
            <td>${record.time}秒</td>
            <td>${record.date}</td>
        </tr>`;
    tbody.innerHTML += row;
  });
}
// ※既存の startQuiz 内の以下の一行は削除するかコメントアウトしてください
// document.getElementById("ranking-container").style.display = "none";

// 地方別ボタン生成（変更なし）
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

// --- 音声入力機能 ---
const allPrefs = ["北海道", "青森", "岩手", "宮城", "秋田", "山形", "福島", "茨城", "栃木", "群馬", "埼玉", "千葉", "東京", "神奈川", "新潟", "富山", "石川", "福井", "山梨", "長野", "岐阜", "静岡", "愛知", "三重", "滋賀", "京都", "大阪", "兵庫", "奈良", "和歌山", "鳥取", "島根", "岡山", "広島", "山口", "徳島", "香川", "愛媛", "高知", "福岡", "佐賀", "長崎", "熊本", "大分", "宮崎", "鹿児島", "沖縄"];

let recognition = null;
let isListening = false;
let isQuizActive = false;

// 音声認識APIの初期化
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.lang = 'ja-JP';
  recognition.continuous = true; // 継続的に音声を認識
  recognition.interimResults = false;

  recognition.onresult = function(event) {
    if (!isQuizActive || currentIndex === null) return;

    const transcript = event.results[event.results.length - 1][0].transcript;
    const voiceStatusDiv = document.getElementById("voice-status");
    
    // 都道府県名と照合
    const matchedPref = allPrefs.find(pref => 
      transcript.includes(pref) || pref.includes(transcript.replace(/\s+/g, ''))
    );

    if (matchedPref) {
      voiceStatusDiv.textContent = `認識: ${transcript} → ${matchedPref}`;
      // 回答処理前に音声認識を一時停止（重複処理を防ぐ）
      recognition.stop();
      isListening = false;
      handleAnswer(matchedPref);
    }
  };

  recognition.onerror = function(event) {
    // no-speechエラーは無視（継続認識では頻繁に発生するため）
    if (event.error === 'no-speech') {
      return;
    }
    
    const voiceStatusDiv = document.getElementById("voice-status");
    if (event.error === 'not-allowed') {
      voiceStatusDiv.textContent = "マイクの許可が必要です";
      setTimeout(() => {
        voiceStatusDiv.textContent = "";
      }, 3000);
    } else if (event.error !== 'aborted') {
      // abortedは意図的な停止なので無視
      console.error("音声認識エラー:", event.error);
    }
  };

  recognition.onend = function() {
    isListening = false;
    // クイズ中で、currentIndexが設定されている場合のみ自動的に再開
    // （回答処理中は再開しない）
    if (isQuizActive && currentIndex !== null && recognition) {
      try {
        recognition.start();
        isListening = true;
      } catch (e) {
        console.error("音声認識の再開に失敗しました:", e);
      }
    }
  };
}

function startVoiceRecognition() {
  if (!recognition) {
    return; // ブラウザが対応していない場合は何もしない
  }

  if (isListening) {
    return;
  }

  isQuizActive = true;
  try {
    recognition.start();
    isListening = true;
    document.getElementById("voice-status").textContent = "🎤 音声入力が有効です";
  } catch (e) {
    console.error("音声認識の開始に失敗しました:", e);
  }
}

function stopVoiceRecognition() {
  isQuizActive = false;
  if (recognition && isListening) {
    try {
      recognition.stop();
    } catch (e) {
      console.error("音声認識の停止に失敗しました:", e);
    }
    isListening = false;
  }
  document.getElementById("voice-status").textContent = "";
}