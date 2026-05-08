import { useState } from "react";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Volume2,
  Languages,
  Headphones,
  PencilLine,
  Mic,
  AlertTriangle,
} from "lucide-react";

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

const EXAM_TYPES = [
  {
    id: "translate_quiz",
    label: "Translate quiz",
    sub: "EN → VI",
    icon: Languages,
    color: "from-emerald-500 to-teal-500",
  },
  {
    id: "listening_quiz",
    label: "Listening quiz",
    sub: "Nghe → VI",
    icon: Headphones,
    color: "from-violet-500 to-purple-500",
  },
  {
    id: "translate_write",
    label: "Translate write",
    sub: "VI → EN",
    icon: PencilLine,
    color: "from-amber-500 to-orange-500",
  },
  {
    id: "listening_write",
    label: "Listening write",
    sub: "Nghe → EN",
    icon: Mic,
    color: "from-cyan-500 to-blue-500",
  },
];

function buildQuestions(words, type) {
  const shuffled = shuffle(words);
  if (type === "translate_quiz") {
    return shuffled.map((w) => {
      const distractors = shuffle(
        words.filter((x) => x.id !== w.id),
      )
        .slice(0, 3)
        .map((x) => x.meaning);
      return {
        word: w.word,
        correct: w.meaning,
        choices: shuffle([w.meaning, ...distractors]),
        userAnswer: null,
      };
    });
  }
  if (type === "listening_quiz") {
    return shuffled.map((w) => {
      const distractors = shuffle(
        words.filter((x) => x.id !== w.id),
      )
        .slice(0, 3)
        .map((x) => x.meaning);
      return {
        word: w.word,
        audioUrl: w.audioUrl,
        correct: w.meaning,
        choices: shuffle([w.meaning, ...distractors]),
        userAnswer: null,
      };
    });
  }
  if (type === "translate_write") {
    return shuffled.map((w) => ({
      word: w.word,
      correct: w.word,
      meaning: w.meaning,
      userAnswer: "",
    }));
  }
  if (type === "listening_write") {
    return shuffled.map((w) => ({
      word: w.word,
      audioUrl: w.audioUrl,
      correct: w.word,
      meaning: w.meaning,
      userAnswer: "",
    }));
  }
  return [];
}

function speakWord(text) {
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = "en-US";
  utt.rate = 0.85;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utt);
}

export default function ExamGame({ words, onBack, examType: initialExamType = null }) {
  const [phase, setPhase] = useState(
    initialExamType ? "doing" : "select",
  );
  const [examType, setExamType] = useState(initialExamType);
  const [questions, setQuestions] = useState(
    initialExamType ? buildQuestions(words, initialExamType) : [],
  );
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  // Chỉ hiển thị 1 câu tại một thời điểm
  const [currentIndex, setCurrentIndex] = useState(0);

  const startExam = (type) => {
    setExamType(type);
    setQuestions(buildQuestions(words, type));
    setSubmitted(false);
    setScore(0);
    setPhase("doing");
    setCurrentIndex(0);
  };

  const submitExam = () => {
    let correctCount = 0;
    const updated = questions.map((q) => {
      let isCorrect = false;
      if (
        examType === "translate_quiz" ||
        examType === "listening_quiz"
      ) {
        isCorrect = q.userAnswer === q.correct;
      } else {
        isCorrect =
          q.userAnswer.trim().toLowerCase() === q.correct.toLowerCase();
      }
      if (isCorrect) correctCount++;
      return { ...q, isCorrect };
    });
    setQuestions(updated);
    setScore(correctCount);
    setSubmitted(true);
    setPhase("results");
  };

  const allAnswered = questions.every((q) => {
    if (q.userAnswer === null || q.userAnswer === "") return false;
    if (typeof q.userAnswer === "string" && !q.userAnswer.trim()) return false;
    return true;
  });

  // Modal xác nhận thoát — ưu tiên hiển thị trước mọi phase
  if (showExitConfirm) {
    return (
      <div className="min-h-screen bg-background p-6 lg:p-8 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-xl">
          <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7 text-amber-500" />
          </div>
          <h2 className="text-xl font-black text-foreground mb-2">
            Xác nhận thoát
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Bạn có chắc muốn thoát? Tiến trình hiện tại sẽ không được lưu.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowExitConfirm(false)}
              className="flex-1 border border-border py-2.5 rounded-xl font-bold text-sm hover:bg-muted transition-all"
            >
              Hủy
            </button>
            <button
              onClick={onBack}
              className="flex-1 bg-red-500 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-red-600 transition-all"
            >
              Xác nhận
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =============================================
  // Giao diện chọn loại kiểm tra
  // =============================================
  if (phase === "select") {
    return (
      <div className="min-h-screen bg-background p-6 lg:p-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-semibold text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại
        </button>
        <h1 className="text-xl font-black mb-1">Kiểm tra</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Làm hết bài rồi bấm nộp để biết kết quả
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {EXAM_TYPES.map((t) => (
            <button
              key={t.id}
              onClick={() => startExam(t.id)}
              className={`bg-gradient-to-br ${t.color} text-white rounded-2xl p-4 flex flex-col items-center gap-2 shadow-md card-hover`}
            >
              <t.icon className="w-7 h-7" />
              <span className="font-bold text-sm text-center">{t.label}</span>
              <span className="text-xs text-white/70">{t.sub}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // =============================================
  // Giao diện làm bài — hiển thị 1 câu hỏi tại một thời điểm
  // =============================================
  if (phase === "doing") {
    const currentQ = questions[currentIndex];

    const handlePrev = () => {
      if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
    };

    const handleNext = () => {
      if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 1);
    };

    return (
      <div className="min-h-screen bg-background p-6 lg:p-8">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setShowExitConfirm(true)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-semibold text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Thoát
          </button>
          <span className="text-sm font-bold text-muted-foreground">
            {questions.filter((q) => {
              if (q.userAnswer === null || q.userAnswer === "") return false;
              if (typeof q.userAnswer === "string" && !q.userAnswer.trim())
                return false;
              return true;
            }).length}{" "}
            / {questions.length} đã trả lời
          </span>
        </div>

        <h2 className="text-lg font-black mb-2 text-center">
          {EXAM_TYPES.find((t) => t.id === examType)?.label}
        </h2>

        {/* Thanh tiến trình */}
        <div className="flex items-center gap-1 mb-6 justify-center flex-wrap">
          {questions.map((q, idx) => {
            const isAnswered =
              q.userAnswer !== null &&
              q.userAnswer !== "" &&
              (typeof q.userAnswer !== "string" || q.userAnswer.trim());
            return (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-6 h-6 rounded-full text-xs font-bold transition-all ${
                  idx === currentIndex
                    ? "bg-primary text-white scale-110"
                    : isAnswered
                    ? "bg-primary/30 text-primary"
                    : "bg-border text-muted-foreground"
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        <div className="max-w-lg mx-auto">
          <QuestionCard
            q={currentQ}
            index={currentIndex}
            examType={examType}
            onAnswer={(ans) => {
              const updated = [...questions];
              updated[currentIndex] = { ...updated[currentIndex], userAnswer: ans };
              setQuestions(updated);
            }}
          />
        </div>

        {/* Nút điều hướng câu hỏi */}
        <div className="flex items-center justify-between max-w-lg mx-auto mt-4">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="flex items-center gap-1 px-4 py-2 rounded-xl border border-border text-sm font-bold hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Câu trước
          </button>
          <span className="text-sm text-muted-foreground font-medium">
            Câu {currentIndex + 1} / {questions.length}
          </span>
          <button
            onClick={handleNext}
            disabled={currentIndex === questions.length - 1}
            className="flex items-center gap-1 px-4 py-2 rounded-xl border border-border text-sm font-bold hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            Câu tiếp theo <ArrowLeft className="w-4 h-4 rotate-180" />
          </button>
        </div>

        {/* Nút nộp bài — chỉ bật khi tất cả đã trả lời */}
        <div className="max-w-lg mx-auto mt-6">
          <button
            onClick={submitExam}
            disabled={!allAnswered}
            className="w-full gradient-primary text-white py-3 rounded-xl font-bold shadow-md hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {allAnswered ? "✓ Nộp bài ngay" : `Nộp bài (${questions.filter((q) => {
              if (q.userAnswer === null || q.userAnswer === "") return false;
              if (typeof q.userAnswer === "string" && !q.userAnswer.trim()) return false;
              return true;
            }).length}/${questions.length})`}
          </button>
          {!allAnswered && (
            <p className="text-xs text-muted-foreground text-center mt-2">
              Vui lòng trả lời tất cả câu hỏi trước khi nộp bài
            </p>
          )}
        </div>
      </div>
    );
  }

  // =============================================
  // Giao diện kết quả
  // =============================================
  if (phase === "results") {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="min-h-screen bg-background p-6 lg:p-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-semibold text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại
        </button>

        <div className="bg-white rounded-2xl p-6 max-w-lg mx-auto text-center shadow-md mb-6">
          <h2 className="text-lg font-black mb-1">Kết quả kiểm tra</h2>
          <div className="text-5xl font-black text-primary my-3">{pct}%</div>
          <p className="text-muted-foreground font-medium">
            {score}/{questions.length} câu đúng
          </p>
          <div className="flex justify-center gap-6 mt-4">
            <div className="text-center">
              <div className="text-2xl font-black text-green-500">
                {
                  questions.filter((q) => q.isCorrect).length
                }
              </div>
              <div className="text-xs text-muted-foreground">Đúng</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-red-500">
                {
                  questions.filter((q) => !q.isCorrect).length
                }
              </div>
              <div className="text-xs text-muted-foreground">Sai</div>
            </div>
          </div>
        </div>

        <div className="space-y-4 max-w-lg mx-auto">
          {questions.map((q, qi) => (
            <ResultCard key={qi} q={q} index={qi} examType={examType} />
          ))}
        </div>
      </div>
    );
  }
}

// =============================================
// Card câu hỏi khi đang làm bài
// =============================================
function QuestionCard({ q, index, examType, onAnswer }) {
  const [played, setPlayed] = useState(false);

  const handlePlay = () => {
    if (q.audioUrl) {
      const audio = new Audio(q.audioUrl);
      audio.onended = () => setPlayed(false);
      audio.onerror = () => {
        setPlayed(false);
        speakWord(q.word);
      };
      setPlayed(true);
      audio.play();
    } else {
      speakWord(q.word);
      setPlayed(true);
      setTimeout(() => setPlayed(false), 2000);
    }
  };

  if (examType === "translate_quiz") {
    return (
      <div className="bg-white rounded-2xl p-4 border border-border shadow-sm">
        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-2">
          Câu {index + 1}
        </p>
        <h3 className="text-xl font-black text-foreground mb-3">{q.word}</h3>
        <div className="grid grid-cols-1 gap-2">
          {q.choices.map((c, ci) => (
            <button
              key={ci}
              onClick={() => onAnswer(c)}
              className={`w-full p-3 rounded-xl border-2 text-sm font-medium text-left transition-all ${
                q.userAnswer === c
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border bg-white hover:border-primary/40"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (examType === "listening_quiz") {
    return (
      <div className="bg-white rounded-2xl p-4 border border-border shadow-sm">
        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-2">
          Câu {index + 1}
        </p>
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={handlePlay}
            className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-all ${
              played
                ? "bg-violet-500 text-white"
                : "bg-primary text-white hover:scale-110 active:scale-95"
            }`}
          >
            {played ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </button>
          <span className="text-xs text-muted-foreground">Nhấn để nghe</span>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {q.choices.map((c, ci) => (
            <button
              key={ci}
              onClick={() => onAnswer(c)}
              className={`w-full p-3 rounded-xl border-2 text-sm font-medium text-left transition-all ${
                q.userAnswer === c
                  ? "border-violet-500 bg-violet-50 text-violet-700"
                  : "border-border bg-white hover:border-violet-300"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (examType === "translate_write") {
    return (
      <div className="bg-white rounded-2xl p-4 border border-border shadow-sm">
        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-2">
          Câu {index + 1}
        </p>
        <h3 className="text-lg font-black text-foreground mb-3">{q.meaning}</h3>
        <input
          type="text"
          value={q.userAnswer}
          onChange={(e) => onAnswer(e.target.value)}
          placeholder="Nhập từ tiếng Anh..."
          className="w-full px-4 py-2.5 rounded-xl border-2 border-border text-sm font-medium focus:outline-none focus:border-amber-400 transition-all"
        />
      </div>
    );
  }

  if (examType === "listening_write") {
    return (
      <div className="bg-white rounded-2xl p-4 border border-border shadow-sm">
        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-2">
          Câu {index + 1}
        </p>
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={handlePlay}
            className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-all ${
              played
                ? "bg-cyan-500 text-white"
                : "bg-blue-500 text-white hover:scale-110 active:scale-95"
            }`}
          >
            {played ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </button>
          <span className="text-xs text-muted-foreground">
            Nhấn để nghe từ
          </span>
        </div>
        {q.meaning && (
          <p className="text-xs text-muted-foreground mb-2">
            Gợi ý: <span className="font-medium">{q.meaning}</span>
          </p>
        )}
        <input
          type="text"
          value={q.userAnswer}
          onChange={(e) => onAnswer(e.target.value)}
          placeholder="Nhập từ tiếng Anh..."
          className="w-full px-4 py-2.5 rounded-xl border-2 border-border text-sm font-medium focus:outline-none focus:border-cyan-400 transition-all"
        />
      </div>
    );
  }

  return null;
}

// =============================================
// Card kết quả sau khi nộp bài
// =============================================
function ResultCard({ q, index, examType }) {
  const [played, setPlayed] = useState(false);

  const handlePlay = () => {
    if (q.audioUrl) {
      const audio = new Audio(q.audioUrl);
      audio.onended = () => setPlayed(false);
      audio.onerror = () => {
        setPlayed(false);
        speakWord(q.correct);
      };
      setPlayed(true);
      audio.play();
    } else {
      speakWord(q.correct);
      setPlayed(true);
      setTimeout(() => setPlayed(false), 2000);
    }
  };

  const borderColor = q.isCorrect
    ? "border-green-400 bg-green-50"
    : "border-red-400 bg-red-50";
  const iconColor = q.isCorrect ? "text-green-500" : "text-red-500";
  const Icon = q.isCorrect ? CheckCircle : XCircle;

  if (
    examType === "translate_quiz" ||
    examType === "listening_quiz"
  ) {
    return (
      <div className={`rounded-2xl p-4 border-2 ${borderColor}`}>
        <div className="flex items-start gap-3 mb-3">
          <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${iconColor}`} />
          <div>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-1">
              Câu {index + 1}
            </p>
            <h3 className="text-xl font-black text-foreground">{q.word}</h3>
          </div>
        </div>
        <div className="space-y-2">
          {q.choices.map((c, ci) => {
            const isCorrect = c === q.correct;
            const isSelected = c === q.userAnswer;
            let style = "bg-white border-border";
            if (isCorrect) style = "bg-green-100 border-green-500 text-green-700 font-semibold";
            else if (isSelected && !isCorrect)
              style = "bg-red-100 border-red-500 text-red-700";
            return (
              <div
                key={ci}
                className={`w-full p-3 rounded-xl border-2 text-sm text-left flex items-center justify-between ${style}`}
              >
                <span>{c}</span>
                {isCorrect && <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />}
                {isSelected && !isCorrect && (
                  <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>
        {!q.isCorrect && (
          <p className="text-xs text-red-600 font-medium mt-2">
            Đáp án đúng: <span className="font-black">{q.correct}</span>
          </p>
        )}
      </div>
    );
  }

  // translate_write / listening_write
  return (
    <div className={`rounded-2xl p-4 border-2 ${borderColor}`}>
      <div className="flex items-start gap-3 mb-3">
        <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${iconColor}`} />
        <div>
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-1">
            Câu {index + 1}
          </p>
          {examType === "listening_write" && (
            <div className="flex items-center gap-2 mb-1">
              <button
                onClick={handlePlay}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  played ? "bg-cyan-500 text-white" : "bg-blue-500 text-white"
                }`}
              >
                {played ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
            </div>
          )}
          {q.meaning && (
            <p className="text-sm text-muted-foreground mb-1">
              Nghĩa: <span className="font-medium text-foreground">{q.meaning}</span>
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Bạn nhập:{" "}
            <span
              className={`font-bold ${
                q.isCorrect ? "text-green-700" : "text-red-700"
              }`}
            >
              {q.userAnswer || "(trống)"}
            </span>
          </p>
        </div>
      </div>
      {!q.isCorrect && (
        <p className="text-xs text-green-700 font-medium">
          Đáp án đúng: <span className="font-black">{q.correct}</span>
        </p>
      )}
    </div>
  );
}
