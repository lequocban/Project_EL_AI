import { useState, useEffect } from "react";
import base44 from "@/api/base44Client";
import { BookOpen, ChevronRight, Plus, X } from "lucide-react";

const SAMPLE_LESSONS = [
  {
    id: "s1",
    title: "Thì Hiện tại đơn (Simple Present)",
    level: "beginner",
    order: 1,
    content: `**Cấu trúc:**\n- (+) S + V(s/es) + O\n- (-) S + do/does + not + V + O\n- (?) Do/Does + S + V + O?\n\n**Cách dùng:**\n1. Diễn đạt thói quen, hành động lặp lại\n2. Sự thật hiển nhiên, quy luật tự nhiên\n3. Lịch trình cố định trong tương lai`,
    examples: [
      "She drinks coffee every morning.",
      "The sun rises in the east.",
      "The train leaves at 8 AM tomorrow.",
    ],
  },
  {
    id: "s2",
    title: "Thì Hiện tại tiếp diễn (Present Continuous)",
    level: "beginner",
    order: 2,
    content: `**Cấu trúc:**\n- (+) S + am/is/are + V-ing + O\n- (-) S + am/is/are + not + V-ing + O\n- (?) Am/Is/Are + S + V-ing + O?\n\n**Cách dùng:**\n1. Hành động đang xảy ra tại thời điểm nói\n2. Kế hoạch trong tương lai gần\n3. Xu hướng, thay đổi đang diễn ra`,
    examples: [
      "I am studying English right now.",
      "She is meeting her friend tonight.",
      "The weather is getting warmer.",
    ],
  },
  {
    id: "s3",
    title: "Thì Quá khứ đơn (Simple Past)",
    level: "beginner",
    order: 3,
    content: `**Cấu trúc:**\n- (+) S + V2/V-ed + O\n- (-) S + did + not + V + O\n- (?) Did + S + V + O?\n\n**Cách dùng:**\n1. Hành động đã hoàn thành trong quá khứ\n2. Chuỗi hành động xảy ra lần lượt trong quá khứ`,
    examples: [
      "She visited Paris last year.",
      "I woke up, had breakfast, and went to work.",
      "Did you see that movie?",
    ],
  },
  {
    id: "s4",
    title: "Câu điều kiện loại 1 (First Conditional)",
    level: "intermediate",
    order: 4,
    content: `**Cấu trúc:**\nIf + S + V(hiện tại đơn), S + will + V\n\n**Cách dùng:**\nDiễn đạt điều kiện có thể xảy ra trong tương lai và kết quả của nó.`,
    examples: [
      "If it rains, I will stay home.",
      "If you study hard, you will pass the exam.",
      "She will call you if she needs help.",
    ],
  },
  {
    id: "s5",
    title: "Câu điều kiện loại 2 (Second Conditional)",
    level: "intermediate",
    order: 5,
    content: `**Cấu trúc:**\nIf + S + V(quá khứ đơn), S + would + V\n\n**Cách dùng:**\nDiễn đạt điều kiện không có thật ở hiện tại hoặc khó có thể xảy ra.`,
    examples: [
      "If I were rich, I would travel the world.",
      "If I had more time, I would learn French.",
      "Would you help me if I asked?",
    ],
  },
  {
    id: "s6",
    title: "Câu bị động (Passive Voice)",
    level: "intermediate",
    order: 6,
    content: `**Cấu trúc:**\nS + be + V3/V-ed + (by + O)\n\n**Cách dùng:**\n1. Nhấn mạnh vào hành động hoặc đối tượng chịu tác động\n2. Không biết hoặc không cần nêu chủ thể`,
    examples: [
      "The book was written by Hemingway.",
      "English is spoken all over the world.",
      "The package will be delivered tomorrow.",
    ],
  },
];

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

export default function Grammar() {
  const [lessons, setLessons] = useState(SAMPLE_LESSONS);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    title: "",
    level: "beginner",
    content: "",
    examples: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadFromDB();
  }, []);

  const loadFromDB = async () => {
    const db = await base44.entities.GrammarLesson.list("-created_date", 50);
    if (db.length > 0) setLessons([...SAMPLE_LESSONS, ...db]);
  };

  const createLesson = async () => {
    setSaving(true);
    const examples = form.examples
      .split("\n")
      .map((e) => e.trim())
      .filter(Boolean);
    const lesson = await base44.entities.GrammarLesson.create({
      title: form.title,
      level: form.level,
      content: form.content,
      examples,
    });
    setLessons((prev) => [...prev, { ...lesson, examples }]);
    setForm({ title: "", level: "beginner", content: "", examples: "" });
    setShowCreate(false);
    setSaving(false);
  };

  const filtered = lessons.filter(
    (l) => filter === "all" || l.level === filter,
  );

  if (selected)
    return <LessonView lesson={selected} onBack={() => setSelected(null)} />;

  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-foreground">✏️ Ngữ pháp</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Học ngữ pháp tiếng Anh có hệ thống
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 gradient-primary text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-md hover:opacity-90"
        >
          <Plus className="w-4 h-4" /> Tạo bài học
        </button>
      </div>

      {showCreate && (
        <div className="bg-white rounded-2xl border border-border p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-foreground">
              📝 Tạo bài ngữ pháp mới
            </h3>
            <button
              onClick={() => setShowCreate(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Tiêu đề bài học (VD: Thì Hiện tại hoàn thành)"
                className="px-4 py-2.5 rounded-xl border border-border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <select
                value={form.level}
                onChange={(e) => setForm({ ...form, level: e.target.value })}
                className="px-4 py-2.5 rounded-xl border border-border text-sm font-medium focus:outline-none"
              >
                <option value="beginner">Cơ bản</option>
                <option value="intermediate">Trung cấp</option>
                <option value="advanced">Nâng cao</option>
              </select>
            </div>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Nội dung bài học (cấu trúc, cách dùng...)"
              rows={4}
              className="w-full px-4 py-2.5 rounded-xl border border-border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
            <textarea
              value={form.examples}
              onChange={(e) => setForm({ ...form, examples: e.target.value })}
              placeholder="Ví dụ (mỗi dòng 1 ví dụ)\nVD: She has lived here for 5 years.\nVD: Have you ever been to Paris?"
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => setShowCreate(false)}
              className="px-4 py-2.5 rounded-xl border border-border font-bold text-sm hover:bg-muted"
            >
              Hủy
            </button>
            <button
              onClick={createLesson}
              disabled={!form.title || !form.content || saving}
              className="gradient-primary text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : null}
              Lưu bài học
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-6">
        {[
          ["all", "Tất cả"],
          ["beginner", "Cơ bản"],
          ["intermediate", "Trung cấp"],
          ["advanced", "Nâng cao"],
        ].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${filter === val ? "gradient-primary text-white shadow-md" : "bg-white border border-border text-muted-foreground hover:bg-muted"}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((lesson, i) => (
          <div
            key={lesson.id}
            onClick={() => setSelected(lesson)}
            className="bg-white rounded-2xl p-5 border border-border card-hover cursor-pointer group"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-sm">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
                    {lesson.title}
                  </h3>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-semibold mt-1 inline-block ${LEVEL_COLORS[lesson.level]}`}
                  >
                    {LEVEL_LABELS[lesson.level]}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground/40 group-hover:text-primary transition-colors mt-1" />
            </div>
            <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
              {lesson.examples?.[0]}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function LessonView({ lesson, onBack }) {
  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-semibold text-sm mb-6"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Quay lại
      </button>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
          <div className="gradient-primary p-6">
            <h1 className="text-xl font-black text-white">{lesson.title}</h1>
          </div>
          <div className="p-6">
            <div className="prose prose-sm max-w-none">
              {lesson.content.split("\n").map((line, i) => (
                <p
                  key={i}
                  className={`${line.startsWith("**") ? "font-bold text-foreground" : "text-muted-foreground"} mb-1 text-sm`}
                >
                  {line.replace(/\*\*/g, "")}
                </p>
              ))}
            </div>
            {lesson.examples?.length > 0 && (
              <div className="mt-6">
                <h3 className="font-black text-foreground mb-3">Ví dụ:</h3>
                <div className="space-y-2">
                  {lesson.examples.map((ex, i) => (
                    <div
                      key={i}
                      className="bg-primary/5 border border-primary/20 rounded-xl p-3"
                    >
                      <p className="text-sm font-semibold text-foreground">
                        📌 {ex}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
