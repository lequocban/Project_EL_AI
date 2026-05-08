import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Plus,
  Trash2,
  BookOpen,
  Layers,
  ListChecks,
  Keyboard,
  Volume2,
  Languages,
  PencilLine,
  Mic,
  Headphones,
} from "lucide-react";
import FlashcardGame from "./FlashcardGame";
import MatchGame from "./MatchGame";
import MultipleChoiceGame from "./MultipleChoiceGame";
import TypingGame from "./TypingGame";
import DictationGame from "./DictationGame";
import ExamGame from "./ExamGame";
import { vocabularyApi } from "@/api/vocabularyApi";

const MODES = [
  {
    id: "flashcard",
    label: "Flashcard",
    icon: Layers,
    color: "from-violet-500 to-indigo-500",
    emoji: "🃏",
  },
  {
    id: "match",
    label: "Nối từ",
    icon: ListChecks,
    color: "from-blue-500 to-cyan-500",
    emoji: "🔗",
  },
  {
    id: "quiz",
    label: "Trắc nghiệm",
    icon: BookOpen,
    color: "from-green-500 to-teal-500",
    emoji: "📝",
  },
  {
    id: "typing",
    label: "Gõ từ",
    icon: Keyboard,
    color: "from-orange-500 to-amber-500",
    emoji: "⌨️",
  },
  {
    id: "dictation",
    label: "Nghe viết",
    icon: Headphones,
    color: "from-pink-500 to-rose-500",
    emoji: "🎧",
  },
];

export default function SetDetail({ set, onBack }) {
  const [words, setWords] = useState([]);
  const [mode, setMode] = useState(null);
  const [examType, setExamType] = useState(null);
  const [showAddWord, setShowAddWord] = useState(false);
  // Mỗi phần tử: { word, meaning, pronunciation, isLoading }
  const [pendingWords, setPendingWords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Id của từ đang được phát âm (để hiện icon loading/spinning)
  const [speakingId, setSpeakingId] = useState(null);

  useEffect(() => {
    loadWords();
  }, [set.id]);

  const loadWords = async () => {
    try {
      const detail = await vocabularyApi.getSetById(set.id);
      setWords(detail.words || []);
      setError("");
    } catch (err) {
      setWords([]);
      setError(err.message || "Không thể tải danh sách từ");
    }
  };

  // Thêm một ô nhập từ mới vào danh sách chờ
  const addWordField = () => {
    setPendingWords((current) => [
      ...current,
      { word: "", meaning: "", pronunciation: "", isLoading: false },
    ]);
  };

  // Cập nhật từ tiếng Anh trong ô chờ, tự động tra cứu nghĩa khi có từ
  const updatePendingWord = async (index, field, value) => {
    setPendingWords((current) => {
      const updated = [...current];
      updated[index] = { ...updated[index], [field]: value };

      // Khi từ tiếng Anh thay đổi và có nội dung, tự động tra cứu
      if (field === "word" && value.trim()) {
        updated[index].isLoading = true;
        updated[index].meaning = "";
        updated[index].pronunciation = "";
      } else if (field === "word" && !value.trim()) {
        // Xóa trắng từ thì reset thông tin
        updated[index].meaning = "";
        updated[index].pronunciation = "";
        updated[index].isLoading = false;
      }

      return updated;
    });

    // Gọi API tra cứu nếu từ tiếng Anh được nhập
    if (field === "word" && value.trim()) {
      try {
        const lookedUp = await vocabularyApi.lookupWord(value.trim());
        setPendingWords((current) => {
          const updated = [...current];
          if (updated[index]) {
            updated[index] = {
              ...updated[index],
              meaning: lookedUp.meaning || "",
              pronunciation: lookedUp.pronunciation || "",
              isLoading: false,
            };
          }
          return updated;
        });
      } catch {
        setPendingWords((current) => {
          const updated = [...current];
          if (updated[index]) {
            updated[index].isLoading = false;
          }
          return updated;
        });
      }
    }
  };

  // Xóa một ô nhập từ khỏi danh sách chờ
  const removePendingWord = (index) => {
    setPendingWords((current) => current.filter((_, i) => i !== index));
  };

  // Lưu tất cả từ đã tra cứu vào bộ từ vựng
  const saveAllWords = async () => {
    // Lọc ra các từ có nghĩa hợp lệ
    const validWords = pendingWords
      .filter((w) => w.word.trim() && w.meaning.trim())
      .map((w) => w.word.trim());

    if (validWords.length === 0) return;

    try {
      setLoading(true);
      // Gửi tất cả từ cùng lúc
      await vocabularyApi.addWordsToSet(set.id, validWords);
      // Tải lại danh sách từ
      const detail = await vocabularyApi.getSetById(set.id);
      setWords(detail.words || []);
      // Reset trạng thái
      setPendingWords([]);
      setShowAddWord(false);
      setError("");
    } catch (err) {
      setError(err.message || "Không thể thêm từ");
    } finally {
      setLoading(false);
    }
  };

  // Đóng phần thêm từ và xóa toàn bộ ô chờ
  const cancelAddWords = () => {
    setPendingWords([]);
    setShowAddWord(false);
  };

  const deleteWord = async (id) => {
    try {
      await vocabularyApi.deleteWordsFromSet(set.id, [id]);
      setWords((current) => current.filter((w) => w.id !== id));
      setError("");
    } catch (err) {
      setError(err.message || "Không thể xóa từ");
    }
  };

  // Phát âm từ vựng. Nếu từ chưa có audioUrl thì gọi lookup để lấy từ backend.
  const playAudio = async (word) => {
    // Nếu đang phát từ này rồi thì dừng
    if (speakingId === word.id) {
      window.speechSynthesis?.cancel();
      setSpeakingId(null);
      return;
    }
    window.speechSynthesis?.cancel();
    setSpeakingId(word.id);
    try {
      let audioUrl = word.audioUrl;
      if (!audioUrl) {
        const lookedUp = await vocabularyApi.lookupWord(word.word);
        audioUrl = lookedUp.audioUrl;
      }
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        audio.onended = () => setSpeakingId(null);
        audio.onerror = () => setSpeakingId(null);
        audio.play();
      } else {
        setSpeakingId(null);
      }
    } catch {
      setSpeakingId(null);
    }
  };

  if (mode === "flashcard") {
    return <FlashcardGame words={words} set={set} onBack={() => setMode(null)} />;
  }
  if (mode === "match") {
    return <MatchGame words={words} set={set} onBack={() => setMode(null)} />;
  }
  if (mode === "quiz") {
    return (
      <MultipleChoiceGame words={words} set={set} onBack={() => setMode(null)} />
    );
  }
  if (mode === "typing") {
    return <TypingGame words={words} set={set} onBack={() => setMode(null)} />;
  }
  if (mode === "dictation") {
    return <DictationGame words={words} set={set} onBack={() => setMode(null)} />;
  }
  if (mode === "exam") {
    return <ExamGame words={words} onBack={() => setMode(null)} examType={examType} />;
  }

  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-semibold text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Quay lại
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-black text-foreground">{set.title}</h1>
        {set.description && (
          <p className="text-muted-foreground text-sm mt-1">{set.description}</p>
        )}
        <p className="text-sm font-semibold text-primary mt-1">{words.length} từ vựng</p>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      {words.length >= 4 && (
        <div className="mb-8">
          <h2 className="text-base font-black text-foreground mb-3">Luyện tập</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`bg-gradient-to-br ${m.color} text-white rounded-2xl p-4 flex flex-col items-center gap-2 shadow-md card-hover`}
              >
                <span className="text-2xl">{m.emoji}</span>
                <span className="font-bold text-sm">{m.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      {words.length < 4 && words.length > 0 && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-700 text-sm font-medium">
          ⚠️ Cần ít nhất 4 từ để bắt đầu luyện tập. Hãy thêm thêm từ vựng!
        </div>
      )}

      {words.length >= 4 && (
        <div className="mb-8">
          <h2 className="text-base font-black text-foreground mb-3">Kiểm tra</h2>
          <p className="text-xs text-muted-foreground mb-3">
            Làm hết bài rồi bấm nộp để biết kết quả
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => { setExamType("translate_quiz"); setMode("exam"); }}
              className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-2xl p-4 flex flex-col items-center gap-2 shadow-md card-hover"
            >
              <Languages className="w-7 h-7" />
              <span className="font-bold text-sm text-center">Translate quiz</span>
              <span className="text-xs text-white/70">EN → VI</span>
            </button>
            <button
              onClick={() => { setExamType("listening_quiz"); setMode("exam"); }}
              className="bg-gradient-to-br from-violet-500 to-purple-500 text-white rounded-2xl p-4 flex flex-col items-center gap-2 shadow-md card-hover"
            >
              <Headphones className="w-7 h-7" />
              <span className="font-bold text-sm text-center">Listening quiz</span>
              <span className="text-xs text-white/70">Nghe → VI</span>
            </button>
            <button
              onClick={() => { setExamType("translate_write"); setMode("exam"); }}
              className="bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-2xl p-4 flex flex-col items-center gap-2 shadow-md card-hover"
            >
              <PencilLine className="w-7 h-7" />
              <span className="font-bold text-sm text-center">Translate write</span>
              <span className="text-xs text-white/70">VI → EN</span>
            </button>
            <button
              onClick={() => { setExamType("listening_write"); setMode("exam"); }}
              className="bg-gradient-to-br from-cyan-500 to-blue-500 text-white rounded-2xl p-4 flex flex-col items-center gap-2 shadow-md card-hover"
            >
              <Mic className="w-7 h-7" />
              <span className="font-bold text-sm text-center">Listening write</span>
              <span className="text-xs text-white/70">Nghe → EN</span>
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-black text-foreground">Danh sách từ</h2>
        <button
          onClick={() => {
            if (!showAddWord) {
              setPendingWords([{ word: "", meaning: "", pronunciation: "", example: "", part_of_speech: "", isLoading: false }]);
            }
            setShowAddWord(true);
          }}
          className="flex items-center gap-2 bg-primary text-white px-3 py-2 rounded-xl font-bold text-sm hover:opacity-90 transition-all"
        >
          <Plus className="w-4 h-4" /> Thêm từ
        </button>
      </div>

      {showAddWord && (
        <div className="bg-white border border-border rounded-2xl p-4 mb-4 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-bold text-muted-foreground">
              Nhập từ tiếng Anh — nghĩa và âm vị sẽ tự động tra cứu
            </span>
            <span className="text-xs text-muted-foreground">
              {pendingWords.filter((w) => w.word.trim() && w.meaning.trim()).length} / {pendingWords.length} từ hợp lệ
            </span>
          </div>

          {pendingWords.map((item, index) => (
            <div key={index} className="relative">
              {/* Nút xóa từng ô */}
              <button
                onClick={() => removePendingWord(index)}
                className="absolute -top-2 -right-2 w-5 h-5 bg-red-100 text-red-500 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors z-10"
                title="Xóa ô này"
              >
                <span className="text-xs font-bold">×</span>
              </button>

              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <input
                    value={item.word}
                    onChange={(e) => updatePendingWord(index, "word", e.target.value)}
                    placeholder="Từ tiếng Anh"
                    className="w-full px-3 py-2 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 pr-8"
                  />
                  {item.isLoading && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                <input
                  value={item.pronunciation}
                  onChange={(e) => updatePendingWord(index, "pronunciation", e.target.value)}
                  placeholder="/phiên âm/"
                  className="px-3 py-2 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <input
                value={item.meaning}
                onChange={(e) => updatePendingWord(index, "meaning", e.target.value)}
                placeholder="Nghĩa tiếng Việt"
                className="w-full px-3 py-2 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 mt-3"
              />
              {/* Thông tin đã tra cứu */}
              {item.word.trim() && item.meaning && (
                <div className="mt-1 text-xs text-green-600 font-medium flex items-center gap-1">
                  <span>✓</span> Đã tra cứu: <strong>{item.word}</strong> — {item.meaning}
                </div>
              )}
              {item.word.trim() && !item.meaning && !item.isLoading && (
                <div className="mt-1 text-xs text-amber-600 font-medium flex items-center gap-1">
                  <span>⚠</span> Nghĩa trống — từ này sẽ không được thêm
                </div>
              )}
            </div>
          ))}

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={addWordField}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-border font-bold text-sm hover:bg-muted transition-all"
            >
              <Plus className="w-4 h-4" /> Thêm ô nhập
            </button>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={cancelAddWords}
              className="px-4 py-2 rounded-xl border border-border font-bold text-sm hover:bg-muted"
            >
              Hủy
            </button>
            <button
              onClick={saveAllWords}
              disabled={
                loading ||
                pendingWords.filter((w) => w.word.trim() && w.meaning.trim()).length === 0
              }
              className="gradient-primary text-white px-6 py-2 rounded-xl font-bold text-sm hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Lưu tất cả ({pendingWords.filter((w) => w.word.trim() && w.meaning.trim()).length})
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {words.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-border">
          <p className="text-muted-foreground font-semibold">Chưa có dữ liệu</p>
        </div>
      ) : (
        <div className="space-y-2">
          {words.map((w) => (
            <div
              key={w.id}
              className="bg-white rounded-xl border border-border p-4 flex items-start justify-between group"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground">{w.word}</span>
                  {w.pronunciation && (
                    <span className="text-xs text-muted-foreground">/{w.pronunciation}/</span>
                  )}
                  {w.part_of_speech && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                      {w.part_of_speech}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1 font-medium">{w.meaning}</p>
                {w.example && (
                  <p className="text-xs text-muted-foreground/70 mt-1 italic">"{w.example}"</p>
                )}
              </div>
              <div className="flex items-center gap-1 ml-2">
                <button
                  onClick={() => playAudio(w)}
                  disabled={speakingId === w.id}
                  className={`p-1.5 rounded-lg transition-all ${
                    speakingId === w.id
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground/30 hover:text-primary hover:bg-primary/5 opacity-0 group-hover:opacity-100"
                  }`}
                  title="Phát âm"
                >
                  {speakingId === w.id ? (
                    <div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5" />
                  )}
                </button>
                <button
                  onClick={() => deleteWord(w.id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground/30 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
