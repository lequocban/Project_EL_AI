import { useState, useEffect, useRef } from "react";
import { Headphones, ArrowLeft, Play, Volume2, Search, Globe, Lock, BookOpen } from "lucide-react";
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
      const data = tab === "mine"
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
    return <LessonPlayer lesson={selected} onBack={() => setSelected(null)} />;
  }

  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-foreground">🎧 Luyện nghe</h1>
          <p className="text-muted-foreground text-sm mt-1">Cải thiện kỹ năng nghe tiếng Anh</p>
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
            <div key={i} className="bg-white rounded-2xl p-5 border border-border animate-pulse">
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
          <Headphones className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground font-semibold">Chưa có bài luyện nghe nào</p>
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
                  <Headphones className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
                    {lesson.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    {lesson.level && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${LEVEL_COLORS[lesson.level] || "bg-gray-100 text-gray-700"}`}>
                        {LEVEL_LABELS[lesson.level] || lesson.level}
                      </span>
                    )}
                    {tab === "mine" ? (
                      <>
                        <span className="text-xs text-muted-foreground">
                          {lesson.questionCount ?? lesson.questions?.length ?? 0} câu hỏi
                        </span>
                        {lesson.is_public ? (
                          <Globe className="w-3.5 h-3.5 text-blue-400" title="Công khai" />
                        ) : (
                          <Lock className="w-3.5 h-3.5 text-muted-foreground/50" title="Riêng tư" />
                        )}
                      </>
                    ) : (
                      <Globe className="w-3.5 h-3.5 text-blue-400" title="Cộng đồng" />
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
    // Dừng TTS
    window.speechSynthesis.cancel();
    setSpeaking(false);
    // Dừng audio HTML5
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const speak = () => {
    window.speechSynthesis.cancel();
    const text = lesson.audioUrl ? "" : (lesson.transcript || lesson.audio_script || "");
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

  const stopSpeak = () => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
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
    } finally {
      setSubmitting(false);
    }
  };

  // Tính kết quả
  const correctCount = submitted && result
    ? (result.correctCount ?? result.details?.filter(d => d.isCorrect).length ?? 0)
    : 0;
  const wrongCount = questions.length - correctCount;
  const percentage = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;

  const transcript = lesson.transcript || lesson.audio_script || "";
  const audioUrl = lesson.audioUrl || lesson.audio_url || "";

  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-semibold text-sm mb-6">
        <ArrowLeft className="w-4 h-4" /> Quay lại
      </button>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-black text-foreground mb-6">{lesson.title}</h1>

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
                    onClick={speak}
                    disabled={speaking}
                    className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all disabled:opacity-50"
                  >
                    <Play className="w-7 h-7" />
                  </button>
                  {speaking && (
                    <button
                      onClick={stopSpeak}
                      className="w-14 h-14 bg-red-500/80 rounded-full flex items-center justify-center hover:bg-red-500 transition-all"
                    >
                      <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <rect x="6" y="6" width="12" height="12" rx="2" />
                      </svg>
                    </button>
                  )}
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
              <BookOpen className="w-4 h-4" /> Xem nội dung bài nghe
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
            <div className="space-y-4">
              {questions.map((q, qi) => (
                <div key={q.id ?? qi} className="bg-white rounded-2xl border border-border p-5">
                  <p className="font-bold text-foreground mb-3">{qi + 1}. {q.question}</p>
                  <div className="space-y-2">
                    {q.options?.map((opt, oi) => {
                      const chosen = answers[qi] === oi;
                      const correctIndex = ["A", "B", "C", "D"].indexOf(q.correct_answer);
                      const isCorrect = submitted && oi === correctIndex;
                      const isWrongChosen = submitted && chosen && oi !== correctIndex;
                      return (
                        <button key={oi}
                          onClick={() => !submitted && setAnswers({ ...answers, [qi]: oi })}
                          disabled={submitted}
                          className={`w-full text-left px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                            submitted
                              ? isCorrect
                                ? "bg-green-100 border-green-500 text-green-700"
                                : isWrongChosen
                                ? "bg-red-100 border-red-500 text-red-700"
                                : "bg-white border-border opacity-50"
                              : chosen
                              ? "gradient-primary text-white border-transparent shadow-md"
                              : "bg-white border-border hover:border-primary/40"
                          }`}
                        >{opt}</button>
                      );
                    })}
                  </div>
                  {submitted && q.explain && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-xl text-sm text-blue-700">
                      <strong>Giải thích:</strong> {q.explain}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {!submitted ? (
              <button
                onClick={handleSubmit}
                disabled={Object.keys(answers).length < questions.length || submitting}
                className="w-full mt-6 gradient-primary text-white py-3 rounded-xl font-bold shadow-md hover:opacity-90 disabled:opacity-40"
              >
                {submitting ? "Đang nộp bài..." : "Nộp bài"}
              </button>
            ) : (
              <div className="space-y-4">
                {/* Kết quả chi tiết */}
                <div className="bg-white rounded-2xl border border-border p-6">
                  <h3 className="font-black text-foreground mb-4 text-center text-lg">Kết quả bài luyện nghe</h3>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 bg-green-50 rounded-xl">
                      <p className="text-2xl font-black text-green-600">{correctCount}</p>
                      <p className="text-xs text-green-600 font-medium">Câu đúng</p>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-xl">
                      <p className="text-2xl font-black text-red-600">{wrongCount}</p>
                      <p className="text-xs text-red-600 font-medium">Câu sai</p>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-xl">
                      <p className="text-2xl font-black text-blue-600">{percentage}%</p>
                      <p className="text-xs text-blue-600 font-medium">Tỷ lệ đúng</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-black text-primary">{correctCount}/{questions.length}</p>
                    <p className="text-sm text-muted-foreground font-medium mt-1">Điểm số</p>
                  </div>
                </div>
                <button
                  onClick={onBack}
                  className="w-full mt-4 px-6 py-3 border border-border rounded-xl font-bold text-sm hover:bg-muted bg-white">
                  Quay lại danh sách bài
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
