import { useState, useRef } from "react";
import { ArrowLeft, Volume2, CheckCircle, XCircle } from "lucide-react";

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function DictationGame({ words, onBack }) {
  const [questions] = useState(() => shuffle(words));
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [played, setPlayed] = useState(false);
  const synthRef = useRef(window.speechSynthesis);

  const q = questions[index];

  const speak = () => {
    const utt = new SpeechSynthesisUtterance(q.word);
    utt.lang = "en-US";
    utt.rate = 0.9;
    synthRef.current.speak(utt);
    setPlayed(true);
  };

  const check = () => {
    const correct = input.trim().toLowerCase() === q.word.toLowerCase();
    setFeedback(correct ? "correct" : "wrong");
    if (correct) setScore((s) => s + 1);
    setTimeout(() => {
      setFeedback(null);
      setInput("");
      setPlayed(false);
      if (index + 1 >= questions.length) setDone(true);
      else setIndex(index + 1);
    }, 1200);
  };

  if (done) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-xl">
          <div className="text-6xl mb-4">🎧</div>
          <h2 className="text-2xl font-black mb-2">Kết quả nghe viết</h2>
          <div className="text-5xl font-black text-primary mb-1">{pct}%</div>
          <p className="text-muted-foreground font-medium mb-6">
            {score}/{questions.length} từ đúng
          </p>
          <button
            onClick={onBack}
            className="w-full border border-border rounded-xl py-2.5 font-bold text-sm hover:bg-muted"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-semibold text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Thoát
        </button>
        <span className="text-sm font-bold text-muted-foreground">
          {index + 1}/{questions.length}
        </span>
      </div>
      <div className="w-full h-2 bg-muted rounded-full mb-8 overflow-hidden">
        <div
          className="h-full gradient-primary rounded-full transition-all"
          style={{ width: `${(index / questions.length) * 100}%` }}
        />
      </div>

      <div className="max-w-lg mx-auto text-center">
        <h2 className="text-xl font-black mb-2">🎧 Nghe và viết từ</h2>
        <p className="text-muted-foreground text-sm mb-8">
          Nhấn nút loa để nghe, sau đó gõ từ vừa nghe
        </p>

        <button
          onClick={speak}
          className={`w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl transition-all ${
            played ? "gradient-green" : "gradient-primary"
          } hover:scale-110 active:scale-95`}
        >
          <Volume2 className="w-12 h-12 text-white" />
        </button>

        {q.meaning && (
          <p className="text-muted-foreground text-sm mb-4 font-medium">
            Gợi ý nghĩa:{" "}
            <span className="text-foreground font-bold">{q.meaning}</span>
          </p>
        )}

        <div
          className={`relative rounded-2xl border-2 overflow-hidden transition-all ${
            feedback === "correct"
              ? "border-green-500"
              : feedback === "wrong"
                ? "border-red-500"
                : "border-border"
          }`}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && input.trim() && check()}
            placeholder="Gõ từ vừa nghe..."
            disabled={!!feedback}
            className="w-full px-5 py-4 text-lg font-bold focus:outline-none bg-white text-center"
          />
          {feedback && (
            <div
              className={`absolute right-4 top-1/2 -translate-y-1/2 ${feedback === "correct" ? "text-green-500" : "text-red-500"}`}
            >
              {feedback === "correct" ? (
                <CheckCircle className="w-6 h-6" />
              ) : (
                <XCircle className="w-6 h-6" />
              )}
            </div>
          )}
        </div>
        {feedback === "wrong" && (
          <p className="text-red-500 text-sm font-semibold mt-2">
            Đáp án: <span className="font-black">{q.word}</span>
          </p>
        )}
        <button
          onClick={check}
          disabled={!input.trim() || !!feedback || !played}
          className="w-full mt-4 gradient-primary text-white py-3 rounded-xl font-bold shadow-md hover:opacity-90 disabled:opacity-40 transition-all"
        >
          Kiểm tra
        </button>
        {!played && (
          <p className="text-xs text-muted-foreground mt-2">
            Hãy nghe từ trước khi kiểm tra
          </p>
        )}
      </div>
    </div>
  );
}
