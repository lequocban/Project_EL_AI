import { useState, useRef } from "react";
import { Headphones, ArrowLeft, Play, Volume2 } from "lucide-react";

const SAMPLE_LESSONS = [
  {
    id: "l1",
    title: "At the Airport",
    level: "beginner",
    topic: "travel",
    audio_script:
      "Passenger: Excuse me, where is the check-in counter for flight VN123?\nStaff: It's at counter B, just down the hall on your left.\nPassenger: Thank you! What time does boarding start?\nStaff: Boarding begins at 2:30 PM. Please be there 15 minutes early.",
    questions: [
      { question: "Where is the check-in counter?", options: ["Counter A","Counter B","Counter C","Counter D"], correct: 1 },
      { question: "When does boarding start?",       options: ["2:00 PM","2:15 PM","2:30 PM","3:00 PM"],        correct: 2 },
    ],
  },
  {
    id: "l2",
    title: "Job Interview",
    level: "intermediate",
    topic: "business",
    audio_script:
      "Interviewer: Can you tell me about your previous experience?\nCandidate: I worked as a marketing manager for three years at TechCorp. I led a team of five people and increased sales by 30%.\nInterviewer: That's impressive. What are your strengths?\nCandidate: I'm very organized and I work well under pressure.",
    questions: [
      { question: "How long did the candidate work at TechCorp?", options: ["2 years","3 years","4 years","5 years"], correct: 1 },
      { question: "By how much did the candidate increase sales?", options: ["20%","25%","30%","35%"],               correct: 2 },
    ],
  },
];

export default function Listening() {
  const [selected, setSelected] = useState(null);

  if (selected) return <LessonPlayer lesson={selected} onBack={() => setSelected(null)} />;

  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-foreground">🎧 Luyện nghe</h1>
          <p className="text-muted-foreground text-sm mt-1">Cải thiện kỹ năng nghe tiếng Anh</p>
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
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                <Headphones className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
                  {lesson.title}
                </h3>
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

function LessonPlayer({ lesson, onBack }) {
  const [speaking, setSpeaking] = useState(false);
  const uttRef = useRef(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const questions = lesson.questions || [];

  const speak = () => {
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(lesson.audio_script);
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

  const score = submitted ? questions.filter((q, i) => answers[i] === q.correct).length : 0;

  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-semibold text-sm mb-6">
        <ArrowLeft className="w-4 h-4" /> Quay lại
      </button>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-black text-foreground mb-6">{lesson.title}</h1>

        <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl p-6 mb-6 text-white shadow-lg">
          <div className="flex items-center gap-4">
            <div className="flex gap-3">
              <button onClick={speak} disabled={speaking}
                className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all disabled:opacity-50">
                <Play className="w-7 h-7" />
              </button>
              {speaking && (
                <button onClick={stopSpeak}
                  className="w-14 h-14 bg-red-500/80 rounded-full flex items-center justify-center hover:bg-red-500 transition-all">
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="6" y="6" width="12" height="12" rx="2" />
                  </svg>
                </button>
              )}
            </div>
            <div>
              <p className="font-bold flex items-center gap-2">
                {speaking ? <><Volume2 className="w-4 h-4 animate-pulse" /> Đang phát...</> : "Nhấn ▶ để nghe bài"}
              </p>
              <p className="text-green-100 text-sm">{speaking ? "Nhấn ■ để dừng" : "Text-to-Speech"}</p>
            </div>
          </div>
        </div>

        <details className="bg-white rounded-2xl border border-border mb-6 overflow-hidden">
          <summary className="p-4 font-bold text-sm cursor-pointer hover:bg-muted">📄 Xem nội dung bài nghe</summary>
          <div className="p-4 pt-0">
            <p className="text-sm text-muted-foreground whitespace-pre-line font-medium">{lesson.audio_script}</p>
          </div>
        </details>

        {questions.length > 0 && (
          <div>
            <h2 className="font-black text-foreground mb-4">Câu hỏi</h2>
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
