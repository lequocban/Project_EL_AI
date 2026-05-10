import { useState, useEffect } from "react";
import { X, Clock, CheckCircle, XCircle, Eye, Loader2, ChevronLeft } from "lucide-react";

// Màu sắc cho từng loại practice
const TYPE_COLORS = {
  vocabulary: { gradient: "from-violet-500 to-indigo-500", label: "Kiểm tra từ vựng" },
  reading: { gradient: "from-orange-500 to-amber-500", label: "Luyện đọc" },
  listening: { gradient: "from-green-500 to-teal-600", label: "Luyện nghe" },
};

// Màu sắc cho loại bài từ vựng
const VOCAB_TYPE_LABELS = {
  quiz: "Translate quiz (EN→VI)",
  listening_quiz: "Listening quiz",
  translate_write: "Translate write (VI→EN)",
  listen_write: "Listen write",
};

// Map field từ response của từng loại practice
// Backend trả về:
// - Vocabulary: id, score, type, timeSpent, wrongWords, completedAt, vocabularySetTitle
// - Listening: id, score, completedAt, lessonTitle, lessonId
// - Reading: id, score, completedAt, lessonTitle, lessonId
const mapHistoryItem = (item, type) => {
  switch (type) {
    case "vocabulary":
      return {
        id: item.id,
        score: item.score ?? 0,
        type: item.type,
        timeSpent: item.timeSpent ?? item.time_spent ?? 0,
        wrongWords: item.wrongWords ?? item.wrong_words ?? [],
        completedAt: item.completedAt ?? item.complete_at ?? item.createdAt ?? item.created_at,
        title: item.vocabularySetTitle ?? item.setTitle ?? "Bài luyện tập",
        totalQuestions: null, // Vocabulary practice không trả về totalQuestions trong history
        correctAnswers: null, // Sẽ tính từ wrongWords
      };
    case "listening":
    case "reading":
      return {
        id: item.id,
        score: item.score ?? 0,
        completedAt: item.completedAt ?? item.complete_at ?? item.createdAt ?? item.created_at,
        title: item.lessonTitle ?? item.title ?? "Bài luyện tập",
        lessonId: item.lessonId ?? item.lesson_id,
        type: null,
        timeSpent: null,
        wrongWords: null,
        totalQuestions: null,
        correctAnswers: null,
      };
    default:
      return item;
  }
};

// Map chi tiết practice từ response
// Vocabulary detail: score, totalQuestions, correctCount, wrongCount, wrongWords, timeSpent, completedAt
// Listening/Reading detail: score, totalQuestions, correctCount, wrongCount, questions, lesson, completedAt
const mapPracticeDetail = (detail, type) => {
  if (!detail) return null;
  switch (type) {
    case "vocabulary":
      return {
        score: detail.score ?? 0,
        totalQuestions: detail.totalQuestions ?? detail.total_questions ?? 0,
        correctAnswers: detail.correctCount ?? detail.correct_count ?? 0,
        wrongCount: detail.wrongCount ?? detail.wrong_count ?? 0,
        timeSpent: detail.timeSpent ?? detail.time_spent ?? 0,
        wrongWords: (detail.wrongWords ?? detail.wrong_words ?? []).map((w) => ({
          ...w,
          wordId: w.word_id ?? w.wordId,
          yourAnswer: w.yourAnswer ?? w.user_answer,
          correctAnswer: w.correctAnswer ?? w.correct_answer,
        })),
        completedAt: detail.completedAt ?? detail.complete_at,
      };
    case "listening":
    case "reading":
      return {
        score: detail.score ?? 0,
        totalQuestions: detail.totalQuestions ?? detail.total_questions ?? 0,
        correctAnswers: detail.correctCount ?? detail.correct_count ?? 0,
        wrongCount: detail.wrongCount ?? detail.wrong_count ?? 0,
        completedAt: detail.completedAt ?? detail.complete_at,
        lesson: detail.lesson ?? null,
        questions: detail.questions ?? detail.details ?? [],
      };
    default:
      return detail;
  }
};

export default function PracticeHistoryModal({ type, onClose, getHistory, getDetail, title }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState(null);

  const typeConfig = TYPE_COLORS[type] || TYPE_COLORS.vocabulary;

  useEffect(() => {
    loadHistory(1);
  }, []);

  const loadHistory = async (pageNum) => {
    setLoading(true);
    setError("");
    try {
      const data = await getHistory({ page: pageNum, limit: 10 });
      // Map dữ liệu từ response về đúng format
      const mappedItems = (data.items || []).map((item) => mapHistoryItem(item, type));
      setHistory(mappedItems);
      setTotalPages(data.totalPages || 1);
      setPage(pageNum);
    } catch (err) {
      setError(err.message || "Không thể tải lịch sử luyện tập");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (item) => {
    setSelectedItem(item);
    // Vocabulary practice: backend không có endpoint chi tiết riêng,
    // dữ liệu wrongWords đã có sẵn trong history item.
    if (type === "vocabulary") {
      const mapped = mapPracticeDetail({ ...item }, type);
      setDetail(mapped);
      return;
    }
    // Listening/Reading: gọi API lấy chi tiết
    setDetailLoading(true);
    setDetail(null);
    try {
      const data = await getDetail(item.id);
      const mappedDetail = mapPracticeDetail(data, type);
      setDetail(mappedDetail);
    } catch (err) {
      setError(err.message || "Không thể tải chi tiết bài làm");
    } finally {
      setDetailLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 50) return "text-amber-600";
    return "text-red-500";
  };

  const getScoreBg = (score) => {
    if (score >= 80) return "bg-green-50 border-green-200";
    if (score >= 50) return "bg-amber-50 border-amber-200";
    return "bg-red-50 border-red-200";
  };

  // Trang kết quả chi tiết
  if (selectedItem) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => { setSelectedItem(null); setDetail(null); }}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-semibold text-sm transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Quay lại danh sách
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-muted rounded-lg transition-all"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          <h2 className="text-lg font-black text-foreground mb-4">Kết quả chi tiết</h2>

          {/* Tổng kết */}
          {detail && (
            <div className={`rounded-2xl p-4 border mb-4 ${getScoreBg(detail.score || selectedItem.score)}`}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">
                    {selectedItem.title}
                  </p>
                  {selectedItem.type && VOCAB_TYPE_LABELS[selectedItem.type] && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {VOCAB_TYPE_LABELS[selectedItem.type]}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Ngày làm: {formatDate(selectedItem.completedAt)}
                  </p>
                </div>
                <div className="text-right">
                  <div className={`text-4xl font-black ${getScoreColor(detail.score || selectedItem.score)}`}>
                    {detail.score ?? selectedItem.score}%
                  </div>
                  {detail.totalQuestions != null ? (
                    <p className="text-xs text-muted-foreground">
                      {detail.correctAnswers ?? 0}/{detail.totalQuestions} đúng
                    </p>
                  ) : detail.wrongWords != null ? (
                    <p className="text-xs text-muted-foreground">
                      {(detail.totalQuestions ?? detail.wrongWords?.length ?? 0) - (detail.wrongWords?.length ?? 0)}/
                      {detail.totalQuestions ?? detail.wrongWords?.length ?? 0} đúng
                    </p>
                  ) : null}
                </div>
              </div>
              {detail.timeSpent != null && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Thời gian: {Math.floor((detail.timeSpent || 0) / 60)}p {(detail.timeSpent || 0) % 60}gi
                </p>
              )}
            </div>
          )}

          {/* Chi tiết câu hỏi (cho reading/listening) */}
          {detailLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {detail && !detailLoading && detail.questions && detail.questions.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-black text-sm text-foreground">Chi tiết từng câu</h3>
              {detail.questions.map((q, idx) => {
                const isCorrect = q.isCorrect ?? q.is_correct ?? false;
                return (
                  <div
                    key={q.questionId || q.question_id || idx}
                    className={`rounded-xl p-3 border ${
                      isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {isCorrect ? (
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {q.question || q.question_text || `Câu ${idx + 1}`}
                        </p>
                        {q.userAnswer && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Đáp án của bạn: <span className="font-semibold">{q.userAnswer}</span>
                          </p>
                        )}
                        {!isCorrect && q.correctAnswer && (
                          <p className="text-xs text-green-600 mt-0.5">
                            Đáp án đúng: <span className="font-semibold">{q.correctAnswer}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Chi tiết từ sai (cho vocabulary) */}
          {detail && !detailLoading && detail.wrongWords && detail.wrongWords.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-black text-sm text-foreground">Từ sai</h3>
              {detail.wrongWords.map((w, idx) => (
                <div
                  key={w.word_id || w.wordId || idx}
                  className="rounded-xl p-3 bg-red-50 border border-red-200"
                >
                  <div className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-foreground">
                        {w.word || w.word_text || `Từ ${idx + 1}`}
                      </p>
                      {w.correctAnswer && (
                        <p className="text-xs text-green-600 mt-1">
                          Đáp án đúng: <span className="font-semibold">{w.correctAnswer}</span>
                        </p>
                      )}
                      {w.yourAnswer !== undefined && (
                        <p className="text-xs text-red-500 mt-0.5">
                          Bạn đã trả lời: <span className="font-semibold">{w.yourAnswer}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {detail && !detailLoading && !detail.questions?.length && !detail.wrongWords?.length && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Không có chi tiết câu hỏi
            </div>
          )}
        </div>
      </div>
    );
  }

  // Trang danh sách lịch sử
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-black text-foreground flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full bg-gradient-to-br ${typeConfig.gradient}`} />
              Lịch sử làm bài
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">{typeConfig.label}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-muted rounded-lg transition-all"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground font-semibold text-sm">Chưa có lịch sử làm bài</p>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-4">
              {history.map((item) => {
                const score = item.score ?? 0;
                return (
                  <div
                    key={item.id}
                    className={`rounded-xl p-3 border ${getScoreBg(score)} hover:shadow-sm transition-all`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground truncate">
                          {item.title}
                        </p>
                        {item.type && VOCAB_TYPE_LABELS[item.type] && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {VOCAB_TYPE_LABELS[item.type]}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(item.completedAt)}
                        </p>
                        {item.totalQuestions != null && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {item.correctAnswers ?? 0}/{item.totalQuestions} đúng
                            {item.timeSpent != null && (
                              <span className="ml-2">
                                • {Math.floor((item.timeSpent || 0) / 60)}p {(item.timeSpent || 0) % 60}gi
                              </span>
                            )}
                          </p>
                        )}
                        {item.timeSpent != null && item.totalQuestions == null && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {Math.floor((item.timeSpent || 0) / 60)}p {(item.timeSpent || 0) % 60}gi
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 ml-3">
                        <div className={`text-2xl font-black ${getScoreColor(score)}`}>
                          {score}%
                        </div>
                        <button
                          onClick={() => handleViewDetail(item)}
                          className={`p-2 rounded-xl bg-white border border-border hover:bg-primary/5 text-primary transition-all shadow-sm`}
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Phân trang */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => loadHistory(page - 1)}
                  disabled={page <= 1}
                  className="px-3 py-1.5 rounded-lg border border-border text-sm font-medium hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  ←
                </button>
                <span className="text-sm text-muted-foreground font-medium px-2">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => loadHistory(page + 1)}
                  disabled={page >= totalPages}
                  className="px-3 py-1.5 rounded-lg border border-border text-sm font-medium hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
