import { useState } from "react";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function MultipleChoiceGame({ words, set, onBack }) {
  const [questions] = useState(() =>
    shuffle(words).map((w) => {
      const distractors = shuffle(words.filter((x) => x.id !== w.id))
        .slice(0, 3)
        .map((x) => x.meaning);
      const choices = shuffle([w.meaning, ...distractors]);
      return { word: w.word, correct: w.meaning, choices };
    }),
  );

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const q = questions[index];

  const handleAnswer = (choice) => {
    if (selected) return;
    setSelected(choice);
    if (choice === q.correct) setScore((s) => s + 1);
    setTimeout(() => {
      if (index + 1 >= questions.length) setDone(true);
      else {
        setIndex(index + 1);
        setSelected(null);
      }
    }, 1000);
  };

  if (done) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-xl">
          <div className="text-6xl mb-4">
            {pct >= 80 ? "🏆" : pct >= 60 ? "👍" : "💪"}
          </div>
          <h2 className="text-2xl font-black mb-2">Kết quả</h2>
          <div className="text-5xl font-black text-primary mb-1">{pct}%</div>
          <p className="text-muted-foreground font-medium mb-6">
            {score}/{questions.length} câu đúng
          </p>
          <div className="flex gap-3">
            <button
              onClick={onBack}
              className="flex-1 border border-border rounded-xl py-2.5 font-bold text-sm hover:bg-muted"
            >
              Quay lại
            </button>
          </div>
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
            Nghĩa tiếng Việt của từ này là?
          </p>
          <h2 className="text-3xl font-black text-foreground">{q.word}</h2>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {q.choices.map((c, i) => {
            const isCorrect = c === q.correct;
            const isSelected = selected === c;
            return (
              <button
                key={i}
                onClick={() => handleAnswer(c)}
                className={`w-full p-4 rounded-xl border-2 font-semibold text-sm text-left flex items-center justify-between transition-all ${
                  !selected
                    ? "bg-white border-border hover:border-primary/50 hover:shadow-sm"
                    : isCorrect
                      ? "bg-green-100 border-green-500 text-green-700"
                      : isSelected
                        ? "bg-red-100 border-red-500 text-red-700"
                        : "bg-white border-border opacity-50"
                }`}
              >
                <span>{c}</span>
                {selected && isCorrect && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
                {selected && isSelected && !isCorrect && (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
