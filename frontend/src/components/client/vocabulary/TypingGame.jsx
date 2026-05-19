import { useState, useRef } from "react";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";

// Xáo trộn mảng ngẫu nhiên
function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

// Component trò chơi gõ từ tiếng Anh dựa trên nghĩa cho sẵn
export default function TypingGame({ words, onBack }) {
  const [questions] = useState(() => shuffle(words));
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong'
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const inputRef = useRef();

  const q = questions[index];

  // Kiểm tra đáp án người dùng gõ và tính điểm
  const check = () => {
    const correct = input.trim().toLowerCase() === q.word.toLowerCase();
    setFeedback(correct ? "correct" : "wrong");
    if (correct) setScore((s) => s + 1);
    setTimeout(() => {
      setFeedback(null);
      setInput("");
      if (index + 1 >= questions.length) setDone(true);
      else setIndex(index + 1);
      setTimeout(() => inputRef.current?.focus(), 100);
    }, 1000);
  };

  if (done) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-xl">
          <div className="text-6xl mb-4">{pct >= 80 ? "⌨️✨" : "💪"}</div>
          <h2 className="text-2xl font-black mb-2">Kết quả</h2>
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

      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-2xl p-8 border border-border shadow-sm mb-6 text-center">
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-3">
            Gõ từ tiếng Anh của
          </p>
          <h2 className="text-2xl font-black text-foreground">{q.meaning}</h2>
          {q.pronunciation && (
            <p className="text-muted-foreground mt-2 text-sm">
              /{q.pronunciation}/
            </p>
          )}
          {q.example && (
            <p className="text-xs text-muted-foreground/60 mt-2 italic">
              "{q.example}"
            </p>
          )}
        </div>

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
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && input.trim() && check()}
            placeholder="Gõ từ tiếng Anh tại đây..."
            disabled={!!feedback}
            autoFocus
            className="w-full px-5 py-4 text-lg font-bold focus:outline-none bg-white"
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
          <p className="text-red-500 text-sm font-semibold mt-2 text-center">
            Đáp án đúng: <span className="font-black">{q.word}</span>
          </p>
        )}
        <button
          onClick={check}
          disabled={!input.trim() || !!feedback}
          className="w-full mt-4 gradient-primary text-white py-3 rounded-xl font-bold shadow-md hover:opacity-90 disabled:opacity-40 transition-all"
        >
          Kiểm tra (Enter)
        </button>
      </div>
    </div>
  );
}
