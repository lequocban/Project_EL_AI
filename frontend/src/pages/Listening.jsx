import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Search,
  Globe,
  Lock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Volume2,
  Play,
} from "lucide-react";
import { listeningApi } from "@/api/listeningApi";

const LEVEL_LABELS = {
  beginner: "Cơ bản",
  intermediate: "Trung cấp",
  advanced: "Nâng cao",
};
const LEVEL_COLORS = {
  beginner: "bg-green-100 text-green-700",
  intermediate: "bg-blue-100 text-blue-700",
  advanced: "bg-purple-100 text-purple-700",
};

export default function Listening() {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("mine");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [tab]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const data =
        tab === "mine"
          ? await listeningApi.getMyLessons({ search })
          : await listeningApi.getPublicLessons({ search });
      setLessons(data.items || []);
    } catch (err) {
      setError(err.message || "Không thể tải dữ liệu luyện nghe");
      setLessons([]);
    } finally {
      setLoading(false);
    }
  };

  if (selected) {
    return (
      <LessonPlayer
        lesson={selected}
        onBack={() => {
          setSelected(null);
          loadData();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-foreground">🎧 Luyện nghe</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Cải thiện kỹ năng nghe tiếng Anh
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {[
          ["mine", "Của tôi"],
          ["public", "Cộng đồng"],
        ].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setTab(val)}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
              tab === val
                ? "gradient-primary text-white shadow-md"
                : "bg-white border border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm kiếm bài luyện nghe..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-5 border border-border animate-pulse"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-muted rounded-xl flex-shrink-0" />
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : lessons.length === 0 ? (
        <div className="text-center py-16">
          <Globe className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground font-semibold">
            Chưa có bài luyện nghe nào
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lessons.map((lesson) => (
            <div
              key={lesson.id}
              onClick={async () => {
                setDetailLoading(true);
                try {
                  const detail = await listeningApi.getLessonById(lesson.id);
                  setSelected(detail);
                } catch (err) {
                  setError(err.message || "Không thể tải chi tiết bài luyện nghe");
                } finally {
                  setDetailLoading(false);
                }
              }}
              className="bg-white rounded-2xl p-5 border border-border card-hover cursor-pointer group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
                    {lesson.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    {lesson.level && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                          LEVEL_COLORS[lesson.level] || "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {LEVEL_LABELS[lesson.level] || lesson.level}
                      </span>
                    )}
                    {tab === "mine" ? (
                      lesson.is_public ? (
                        <Globe
                          className="w-3.5 h-3.5 text-blue-400"
                          title="Công khai"
                        />
                      ) : (
                        <Lock
                          className="w-3.5 h-3.5 text-muted-foreground/50"
                          title="Riêng tư"
                        />
                      )
                    ) : (
                      <Globe
                        className="w-3.5 h-3.5 text-blue-400"
                        title="Cộng đồng"
                      />
                    )}
                  </div>
                  {lesson.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {lesson.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LessonPlayer({ lesson, onBack }) {
  const [speaking, setSpeaking] = useState(false);
  const uttRef = useRef(null);
  const audioRef = useRef(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [submitError, setSubmitError] = useState("");
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const questions = lesson.questions || [];

  // Dừng audio khi rời khỏi component
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  const stopAudio = () => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const speak = () => {
    window.speechSynthesis.cancel();
    const text = lesson.audioUrl ? "" : lesson.transcript || lesson.audio_script || "";
    if (!text) return;
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = "en-US";
    utt.rate = 0.85;
    utt.onend = () => setSpeaking(false);
    utt.onerror = () => setSpeaking(false);
    uttRef.current = utt;
    setSpeaking(true);
    window.speechSynthesis.speak(utt);
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) return;
    stopAudio(); // Dừng audio trước khi nộp bài
    setSubmitting(true);
    setSubmitError("");
    try {
      const answerList = questions.map((q, i) => ({
        questionId: q.id,
        answer: ["A", "B", "C", "D"][answers[i]] || "",
      }));
      const data = await listeningApi.submitListeningPractice(lesson.id, answerList);
      setResult(data);
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err.message || "Không thể nộp bài");
      setSubmitting(false);
    }
  };

  const allAnswered = questions.every((_, i) => answers[i] !== undefined);
  const answeredCount = Object.keys(answers).length;
  const transcript = lesson.transcript || lesson.audio_script || "";
  const audioUrl = lesson.audioUrl || lesson.audio_url || "";

  // Xử lý hiển thị kết quả chi tiết
  const getResults = () => {
    if (submitted && result) {
      const correctCount =
        result.correctCount ??
        result.details?.filter((d) => d.isCorrect).length ??
        0;
      return questions.map((q, i) => {
        const answerData = result.details?.find((d) => d.questionId === q.id);
        const userAnswerIndex = answers[i];
        const userAnswer = ["A", "B", "C", "D"][userAnswerIndex] || "";
        const correctIndex = ["A", "B", "C", "D"].indexOf(q.correct_answer);
        const isCorrect = answerData
          ? answerData.isCorrect
          : userAnswer === q.correct_answer;
        return {
          ...q,
          isCorrect,
          userAnswer,
          userAnswerIndex,
        };
      });
    }
    return questions.map((q, i) => {
      const userAnswerIndex = answers[i];
      const userAnswer = ["A", "B", "C", "D"][userAnswerIndex] || "";
      const isCorrect = userAnswer === q.correct_answer;
      return {
        ...q,
        isCorrect,
        userAnswer,
        userAnswerIndex,
      };
    });
  };

  const results = submitted ? getResults() : [];
  const correctCount = submitted ? results.filter((r) => r.isCorrect).length : 0;
  const wrongCount = submitted ? questions.length - correctCount : 0;
  const percentage =
    questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;

  // Modal xác nhận thoát
  if (showExitConfirm) {
    return (
      <div className="min-h-screen bg-background p-6 lg:p-8 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-xl">
          <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7 text-amber-500" />
          </div>
          <h2 className="text-xl font-black text-foreground mb-2">Xác nhận thoát</h2>
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
              onClick={() => {
                stopAudio();
                onBack();
              }}
              className="flex-1 bg-red-500 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-red-600 transition-all"
            >
              Xác nhận
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Trang kết quả chi tiết
  if (submitted) {
    return (
      <div className="min-h-screen bg-background p-6 lg:p-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-semibold text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại
        </button>

        {/* Tổng kết quả */}
        <div className="bg-white rounded-2xl p-6 max-w-lg mx-auto text-center shadow-md mb-6">
          <h2 className="text-lg font-black mb-1">Kết quả bài luyện nghe</h2>
          <div className="text-5xl font-black text-primary my-3">{percentage}%</div>
          <p className="text-muted-foreground font-medium">
            {correctCount}/{questions.length} câu đúng
          </p>
          <div className="flex justify-center gap-6 mt-4">
            <div className="text-center">
              <div className="text-2xl font-black text-green-500">
                {correctCount}
              </div>
              <div className="text-xs text-muted-foreground">Đúng</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-red-500">{wrongCount}</div>
              <div className="text-xs text-muted-foreground">Sai</div>
            </div>
          </div>
        </div>

        {/* Chi tiết từng câu */}
        <div className="space-y-4 max-w-lg mx-auto">
          {results.map((q, qi) => {
            const borderColor = q.isCorrect
              ? "border-green-400 bg-green-50"
              : "border-red-400 bg-red-50";
            const iconColor = q.isCorrect ? "text-green-500" : "text-red-500";
            const Icon = q.isCorrect ? CheckCircle : XCircle;
            const correctIndex = ["A", "B", "C", "D"].indexOf(q.correct_answer);

            return (
              <div key={q.id ?? qi} className={`rounded-2xl p-4 border-2 ${borderColor}`}>
                <div className="flex items-start gap-3 mb-3">
                  <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${iconColor}`} />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-1">
                      Câu {qi + 1}
                    </p>
                    <h3 className="text-lg font-black text-foreground">
                      {q.question}
                    </h3>
                  </div>
                </div>
                <div className="space-y-2">
                  {q.options?.map((opt, oi) => {
                    const isCorrectOption = oi === correctIndex;
                    const isSelectedOption = oi === q.userAnswerIndex;
                    let style = "bg-white border-border";
                    if (isCorrectOption)
                      style =
                        "bg-green-100 border-green-500 text-green-700 font-semibold";
                    else if (isSelectedOption && !isCorrectOption)
                      style = "bg-red-100 border-red-500 text-red-700";
                    return (
                      <div
                        key={oi}
                        className={`w-full p-3 rounded-xl border-2 text-sm text-left flex items-center justify-between ${style}`}
                      >
                        <span>
                          <span className="font-bold mr-2">
                            {["A", "B", "C", "D"][oi]}:
                          </span>
                          {opt}
                        </span>
                        {isCorrectOption && (
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        )}
                        {isSelectedOption && !isCorrectOption && (
                          <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
                {!q.isCorrect && (
                  <p className="text-xs text-red-600 font-medium mt-2">
                    Đáp án đúng:{" "}
                    <span className="font-black">
                      {["A", "B", "C", "D"][correctIndex]}
                    </span>
                  </p>
                )}
                {q.explain && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-xl text-sm text-blue-700">
                    <strong>Giải thích:</strong> {q.explain}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="max-w-lg mx-auto mt-6">
          <button
            onClick={onBack}
            className="w-full gradient-primary text-white py-3 rounded-xl font-bold shadow-md hover:opacity-90 transition-all"
          >
            Quay lại danh sách bài
          </button>
        </div>
      </div>
    );
  }

  // Giao diện đang làm bài
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
          {answeredCount}/{questions.length} đã trả lời
        </span>
      </div>

      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-black text-foreground mb-6">
          {lesson.title}
        </h1>

        {/* Audio player */}
        <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl p-6 mb-6 text-white shadow-lg">
          <div className="flex items-center gap-4">
            <div className="flex gap-3">
              {audioUrl ? (
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  controls
                  className="h-14 rounded-lg"
                  onEnded={() => setSpeaking(false)}
                />
              ) : (
                <>
                  <button
                    onClick={speaking ? stopAudio : speak}
                    disabled={speaking && !audioUrl}
                    className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
                  >
                    {speaking ? (
                      <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <rect x="6" y="6" width="12" height="12" rx="2" />
                      </svg>
                    ) : (
                      <Play className="w-7 h-7" />
                    )}
                  </button>
                </>
              )}
            </div>
            <div>
              <p className="font-bold flex items-center gap-2">
                {speaking ? (
                  <><Volume2 className="w-4 h-4 animate-pulse" /> Đang phát...</>
                ) : audioUrl ? (
                  "Trình phát audio"
                ) : (
                  "Nhấn ▶ để nghe bài"
                )}
              </p>
              <p className="text-green-100 text-sm">
                {audioUrl ? "Audio từ server" : speaking ? "Nhấn ■ để dừng" : "Text-to-Speech"}
              </p>
            </div>
          </div>
        </div>

        {/* Transcript */}
        {transcript && (
          <details className="bg-white rounded-2xl border border-border mb-6 overflow-hidden">
            <summary className="p-4 font-bold text-sm cursor-pointer hover:bg-muted flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Xem nội dung bài nghe
            </summary>
            <div className="p-4 pt-0">
              <p className="text-sm text-muted-foreground whitespace-pre-line font-medium">
                {transcript}
              </p>
            </div>
          </details>
        )}

        {submitError && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600">
            {submitError}
          </div>
        )}

        {questions.length > 0 && (
          <div>
            <h2 className="font-black text-foreground mb-4">Câu hỏi</h2>

            {/* Thanh tiến trình */}
            <div className="flex items-center gap-1 mb-6 justify-center flex-wrap">
              {questions.map((q, idx) => {
                const isAnswered = answers[idx] !== undefined;
                return (
                  <button
                    key={q.id ?? idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${
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

            {/* Hiển thị câu hỏi hiện tại */}
            {questions[currentIndex] && (
              <div className="bg-white rounded-2xl border border-border p-5 mb-4">
                <p className="font-bold text-foreground mb-3">
                  Câu {currentIndex + 1}. {questions[currentIndex].question}
                </p>
                <div className="space-y-2">
                  {questions[currentIndex].options?.map((opt, oi) => {
                    const chosen = answers[currentIndex] === oi;
                    return (
                      <button
                        key={oi}
                        onClick={() =>
                          setAnswers({ ...answers, [currentIndex]: oi })
                        }
                        className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                          chosen
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border bg-white hover:border-primary/40"
                        }`}
                      >
                        <span className="font-bold mr-2">
                          {["A", "B", "C", "D"][oi]}:
                        </span>
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Nút điều hướng câu hỏi */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0}
                className="flex items-center gap-1 px-4 py-2 rounded-xl border border-border text-sm font-bold hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ArrowLeft className="w-4 h-4" /> Câu trước
              </button>
              <span className="text-sm text-muted-foreground font-medium">
                Câu {currentIndex + 1} / {questions.length}
              </span>
              <button
                onClick={() =>
                  setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))
                }
                disabled={currentIndex === questions.length - 1}
                className="flex items-center gap-1 px-4 py-2 rounded-xl border border-border text-sm font-bold hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Câu tiếp <ArrowLeft className="w-4 h-4 rotate-180" />
              </button>
            </div>

            {/* Nút nộp bài */}
            <button
              onClick={handleSubmit}
              disabled={!allAnswered || submitting}
              className="w-full gradient-primary text-white py-3 rounded-xl font-bold shadow-md hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {submitting
                ? "Đang nộp bài..."
                : allAnswered
                ? "✓ Nộp bài ngay"
                : `Nộp bài (${answeredCount}/${questions.length})`}
            </button>
            {!allAnswered && (
              <p className="text-xs text-muted-foreground text-center mt-2">
                Vui lòng trả lời tất cả câu hỏi trước khi nộp bài
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
