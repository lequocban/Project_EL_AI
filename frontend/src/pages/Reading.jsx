import { useState } from "react";
import { FileText, ArrowLeft } from "lucide-react";

const SAMPLE_LESSONS = [
  {
    id: "r1",
    title: "The Benefits of Exercise",
    level: "beginner",
    topic: "health",
    passage: `Regular exercise is important for good health. When we exercise, our bodies become stronger and we feel better. Exercise helps our heart pump blood more efficiently and strengthens our muscles and bones.\n\nThere are many types of exercise. Walking and swimming are gentle exercises that almost everyone can do. Running and cycling are more intense and help burn calories faster. Yoga and stretching improve flexibility and reduce stress.\n\nExperts recommend at least 30 minutes of moderate exercise five days a week. Even small changes like taking the stairs instead of the elevator can make a big difference to your health.`,
    questions: [
      {
        question: "What does exercise help our heart do?",
        options: ["Pump blood more efficiently","Grow bigger","Beat slower","Work less"],
        correct: 0,
      },
      {
        question: "How much exercise do experts recommend per week?",
        options: ["15 minutes, 3 days","20 minutes, 4 days","30 minutes, 5 days","60 minutes, 2 days"],
        correct: 2,
      },
    ],
  },
  {
    id: "r2",
    title: "Social Media and Modern Life",
    level: "intermediate",
    topic: "technology",
    passage: `Social media has transformed the way we communicate, share information, and connect with others. Platforms like Facebook, Instagram, and Twitter have billions of users worldwide, making them among the most influential technologies of our time.\n\nThe benefits of social media are undeniable. It allows people to maintain relationships with friends and family across great distances, provides a platform for businesses to reach customers, and enables the rapid spread of important information during emergencies.\n\nHowever, social media also presents significant challenges. Research suggests that excessive use can lead to feelings of anxiety, depression, and loneliness. The spread of misinformation is another serious concern, as false news can circulate rapidly before it can be corrected.\n\nStriking a healthy balance is key. Experts recommend limiting screen time, being critical of information sources, and taking regular breaks from social media to maintain mental wellbeing.`,
    questions: [
      {
        question: "What is one benefit of social media mentioned in the passage?",
        options: [
          "It replaces face-to-face communication",
          "It allows people to maintain long-distance relationships",
          "It eliminates the need for traditional media",
          "It always spreads accurate information",
        ],
        correct: 1,
      },
      {
        question: "What challenge does social media present according to the text?",
        options: [
          "It is too expensive",
          "Excessive use can cause anxiety and depression",
          "It is difficult to use",
          "It has too few users",
        ],
        correct: 1,
      },
    ],
  },
];

export default function Reading() {
  const [selected, setSelected] = useState(null);

  if (selected) return <ReadingPlayer lesson={selected} onBack={() => setSelected(null)} />;

  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-foreground">📖 Luyện đọc</h1>
          <p className="text-muted-foreground text-sm mt-1">Nâng cao kỹ năng đọc hiểu tiếng Anh</p>
        </div>
      </div>

      <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-medium text-amber-700">
        Chưa có dữ liệu từ backend — hiện đang hiển thị bài mẫu.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SAMPLE_LESSONS.map((lesson) => (
          <div
            key={lesson.id}
            onClick={() => setSelected(lesson)}
            className="bg-white rounded-2xl p-5 border border-border card-hover cursor-pointer group"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">{lesson.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    lesson.level === "beginner" ? "bg-green-100 text-green-700" :
                    lesson.level === "intermediate" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                  }`}>
                    {lesson.level === "beginner" ? "Cơ bản" : lesson.level === "intermediate" ? "Trung cấp" : "Nâng cao"}
                  </span>
                  <span className="text-xs text-muted-foreground">{lesson.questions?.length || 0} câu hỏi</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReadingPlayer({ lesson, onBack }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const questions = lesson.questions || [];
  const score = submitted ? questions.filter((q, i) => answers[i] === q.correct).length : 0;

  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-semibold text-sm mb-6">
        <ArrowLeft className="w-4 h-4" /> Quay lại
      </button>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-black text-foreground mb-6">{lesson.title}</h1>
        <div className="bg-white rounded-2xl border border-border p-6 mb-6 shadow-sm">
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-line font-medium">{lesson.passage}</p>
        </div>
        {questions.length > 0 && (
          <div>
            <h2 className="font-black text-foreground mb-4">Câu hỏi đọc hiểu</h2>
            <div className="space-y-4">
              {questions.map((q, qi) => (
                <div key={qi} className="bg-white rounded-2xl border border-border p-5">
                  <p className="font-bold text-foreground mb-3">{qi + 1}. {q.question}</p>
                  <div className="space-y-2">
                    {q.options?.map((opt, oi) => {
                      const chosen = answers[qi] === oi;
                      const correct = q.correct === oi;
                      return (
                        <button key={oi}
                          onClick={() => !submitted && setAnswers({ ...answers, [qi]: oi })}
                          className={`w-full text-left px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                            submitted
                              ? correct ? "bg-green-100 border-green-500 text-green-700"
                                : chosen ? "bg-red-100 border-red-500 text-red-700"
                                : "bg-white border-border opacity-50"
                              : chosen ? "gradient-primary text-white border-transparent shadow-md"
                              : "bg-white border-border hover:border-primary/40"
                          }`}
                        >{opt}</button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            {!submitted ? (
              <button onClick={() => setSubmitted(true)}
                disabled={Object.keys(answers).length < questions.length}
                className="w-full mt-6 gradient-primary text-white py-3 rounded-xl font-bold shadow-md hover:opacity-90 disabled:opacity-40">
                Nộp bài
              </button>
            ) : (
              <div className="mt-4 bg-white rounded-2xl border border-border p-5 text-center">
                <p className="text-2xl font-black text-primary">{score}/{questions.length}</p>
                <p className="text-muted-foreground font-medium mt-1">câu trả lời đúng</p>
                <button onClick={onBack}
                  className="mt-4 px-6 py-2.5 border border-border rounded-xl font-bold text-sm hover:bg-muted">
                  Quay lại
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
