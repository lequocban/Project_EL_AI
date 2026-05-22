import { useState, useEffect, useRef } from "react";
import { useNavigationGuard } from "@/lib/navigationGuard";
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

// Xáo trộn mảng ngẫu nhiên
function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

const EXAM_TYPES = [
  {
    id: "quiz",
    label: "Quiz",
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

// Xây dựng danh sách câu hỏi theo loại kiểm tra
function buildQuestions(words, type) {
  const shuffled = shuffle(words);
  if (type === "quiz") {
    return shuffled.map((w) => {
      const distractors = shuffle(
        words.filter((x) => x.id !== w.id),
      )
        .slice(0, 3)
        .map((x) => x.meaning);
      return {
        wordId: w.id,
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
        wordId: w.id,
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
      wordId: w.id,
      word: w.word,
      correct: w.word,
      meaning: w.meaning,
      userAnswer: "",
    }));
  }
  if (type === "listening_write") {
    return shuffled.map((w) => ({
      wordId: w.id,
      word: w.word,
      audioUrl: w.audioUrl,
      correct: w.word,
      meaning: w.meaning,
      userAnswer: "",
    }));
  }
  return [];
}

// Phát âm từ bằng SpeechSynthesis
function speakWord(text) {
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = "en-US";
  utt.rate = 0.85;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utt);
}

// Component kiểm tra từ vựng với nhiều dạng bài (quiz, nghe, viết)
export default function ExamGame({ words, onBack, examType: initialExamType = null, setId = null, onSubmit = null }) {
  const [phase, setPhase] = useState(
    initialExamType ? "doing" : "select",
  );
  const [examType, setExamType] = useState(initialExamType);
  const [questions, setQuestions] = useState(
    initialExamType ? buildQuestions(words, initialExamType) : [],
  );
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [apiResult, setApiResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  // Chỉ hiển thị 1 câu tại một thời điểm
  const [currentIndex, setCurrentIndex] = useState(0);
  // Đếm thời gian làm bài (giây)
  const startTimeRef = useRef(null);
  const [elapsed, setElapsed] = useState(0);
  // Đếm ngược thời gian làm bài (10 phút)
  const TIME_LIMIT = 600;
  const [timeRemaining, setTimeRemaining] = useState(TIME_LIMIT);

  // Kích hoạt navigation guard khi đang làm bài
  useNavigationGuard(
    phase === "doing" && !submitted,
    () => onBack()
  );

  // Chặn đóng tab/reload trang khi đang làm bài
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (phase === "doing" && !submitted) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [phase, submitted]);

  // Timer đếm thời gian khi đang làm bài
  useEffect(() => {
    if (phase === "doing" && !submitted) {
      startTimeRef.current = Date.now();
      const interval = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [phase, submitted]);

  // Đếm ngược thời gian làm bài (10 phút)
  useEffect(() => {
    if (phase === "doing" && !submitted && timeRemaining > 0) {
      const interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setShowExitConfirm(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [phase, submitted, timeRemaining]);

  // Bắt đầu bài kiểm tra với loại đã chọn
  const startExam = (type) => {
    setExamType(type);
    setQuestions(buildQuestions(words, type));
    setSubmitted(false);
    setScore(0);
    setPhase("doing");
    setCurrentIndex(0);
    setTimeRemaining(TIME_LIMIT);
  };

  // Nộp bài kiểm tra và lưu kết quả lên backend
  const submitExam = async () => {
    if (!setId || !onSubmit) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Gọi API submit trước, chờ kết quả từ backend
      const result = await onSubmit({
        setId,
        type: examType,
        answers: questions.map((q) => ({
          wordId: q.wordId,
          answer: q.userAnswer ?? "",
        })),
        timeSpent: elapsed,
      });

      // Lưu kết quả từ API để hiển thị
      setApiResult(result);

      // Hỗ trợ cả camelCase và snake_case từ backend
      const wrongWordsList = result.wrongWords ?? result.wrong_words ?? [];
      const totalFromApi = result.totalQuestions ?? result.total_questions ?? questions.length;
      const correctFromApi = result.correctAnswers ?? result.correct_answers ?? result.score ?? 0;

      // Tạo map từ wrongWords để tra nhanh
      const wrongWordMap = {};
      if (Array.isArray(wrongWordsList)) {
        wrongWordsList.forEach((w) => {
          wrongWordMap[w.word ?? w.word_text ?? ""] = w;
        });
      }

      // Map kết quả API vào questions để hiển thị đúng/sai
      // Các từ nằm trong wrongWords là các từ bị sai
      const updated = questions.map((q) => {
        const wrongInfo = wrongWordMap[q.word];
        return {
          ...q,
          wrongInfo: wrongInfo || null,
          isCorrect: !wrongInfo,
        };
      });

      setQuestions(updated);
      setScore(correctFromApi);
      setSubmitted(true);
      setPhase("results");

      // Lưu kết quả chi tiết vào localStorage để PracticeHistoryModal hiển thị
      try {
        const questionsForStorage = updated.map((q) => {
          const correctAnswer = !q.isCorrect && q.wrongInfo
            ? q.wrongInfo.correct_answer
            : q.correct;
          return {
            wordId: q.wordId,
            word: q.word,
            isCorrect: q.isCorrect,
            userAnswer: q.userAnswer,
            correctAnswer,
            meaning: q.meaning,
          };
        });
        const detailsKey = "vocab_practice_details";
        const existing = JSON.parse(localStorage.getItem(detailsKey) || "{}");
        existing[result.id ?? result.practiceId] = {
          score: result.score ?? 0,
          totalQuestions: totalFromApi,
          correctAnswers:
            result.correctCount ??
            result.correct_count ??
            result.correctAnswers ??
            result.correct_answers ??
            updated.filter((q) => q.isCorrect).length,
          wrongWords: wrongWordsList,
          timeSpent: elapsed,
          completedAt: new Date().toISOString(),
          questions: questionsForStorage,
        };
        localStorage.setItem(detailsKey, JSON.stringify(existing));
      } catch (e) {
        /* localStorage không khả dụng */
      }
    } catch (err) {
      setSubmitError("Không thể nộp bài. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const allAnswered = questions.every((q) => {
    if (q.userAnswer === null || q.userAnswer === "") return false;
    if (typeof q.userAnswer === "string" && !q.userAnswer.trim()) return false;
    return true;
  });

  // Format thời gian đếm ngược thành mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

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

    // Chuyển về câu hỏi trước
    const handlePrev = () => {
      if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
    };

    // Chuyển đến câu hỏi tiếp theo
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
          <span className={`text-sm font-bold ${timeRemaining <= 60 ? "text-red-500 animate-pulse" : "text-muted-foreground"}`}>
            {formatTime(timeRemaining)}
          </span>
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

        {/* Thanh tiến trình thời gian */}
        <div className="w-full bg-border rounded-full h-2 mb-6 overflow-hidden">
          <div
            className={`h-2 rounded-full transition-all duration-1000 ease-linear ${
              timeRemaining <= 60 ? "bg-red-500" : "bg-primary"
            }`}
            style={{ width: `${(timeRemaining / TIME_LIMIT) * 100}%` }}
          />
        </div>

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
            disabled={!allAnswered || isSubmitting}
            className="w-full gradient-primary text-white py-3 rounded-xl font-bold shadow-md hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Đang nộp bài...
              </>
            ) : allAnswered ? (
              "✓ Nộp bài ngay"
            ) : (
              `Nộp bài (${questions.filter((q) => {
                if (q.userAnswer === null || q.userAnswer === "") return false;
                if (typeof q.userAnswer === "string" && !q.userAnswer.trim()) return false;
                return true;
              }).length}/${questions.length})`
            )}
          </button>
          {!allAnswered && !isSubmitting && (
            <p className="text-xs text-muted-foreground text-center mt-2">
              Vui lòng trả lời tất cả câu hỏi trước khi nộp bài
            </p>
          )}
          {submitError && (
            <p className="text-xs text-red-500 text-center mt-2 font-medium">
              {submitError}
            </p>
          )}
        </div>

        {/* Modal xác nhận thoát - Overlay */}
        {showExitConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
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
        )}
      </div>
    );
  }

  // =============================================
  // Giao diện kết quả
  // =============================================
  if (phase === "results") {
    // Hỗ trợ cả camelCase và snake_case từ backend
    const totalFromApi = apiResult?.totalQuestions ?? apiResult?.total_questions ?? questions.length;
    const correctFromApi = apiResult?.correctAnswers ?? apiResult?.correct_answers ?? questions.filter((q) => q.isCorrect).length;
    const wrongFromApi = apiResult?.wrongAnswers ?? apiResult?.wrong_answers ?? questions.filter((q) => !q.isCorrect).length;
    const pct = totalFromApi > 0 ? Math.round((correctFromApi / totalFromApi) * 100) : 0;
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
            {correctFromApi}/{totalFromApi} câu đúng
          </p>

          <div className="flex justify-center gap-6 mt-4">
            <div className="text-center">
              <div className="text-2xl font-black text-green-500">
                {correctFromApi}
              </div>
              <div className="text-xs text-muted-foreground">Đúng</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-red-500">
                {wrongFromApi}
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
// Component hiển thị câu hỏi và nhận đáp án từ người dùng
function QuestionCard({ q, index, examType, onAnswer }) {
  const [played, setPlayed] = useState(false);

  // Phát âm từ cho câu hỏi nghe
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

  if (examType === "quiz") {
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
// Component hiển thị kết quả từng câu sau khi nộp bài
function ResultCard({ q, index, examType }) {
  const [played, setPlayed] = useState(false);

  // Phát âm đáp án đúng cho câu hỏi nghe
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
    examType === "quiz" ||
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
          {q.wrongInfo ? (
            <>
              <p className="text-xs text-muted-foreground">
                Bạn nhập:{" "}
                <span className="font-bold text-red-700">
                  {q.wrongInfo.yourAnswer ?? q.wrongInfo.user_answer ?? q.wrongInfo.userAnswer ?? "(trống)"}
                </span>
              </p>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">
              Bạn nhập:{" "}
              <span className="font-bold text-green-700">
                {q.userAnswer || "(trống)"}
              </span>
            </p>
          )}
        </div>
      </div>
      {!q.isCorrect && (
        <p className="text-xs text-green-700 font-medium">
          Đáp án đúng: <span className="font-black">{q.wrongInfo?.correctAnswer ?? q.correct}</span>
        </p>
      )}
    </div>
  );
}
