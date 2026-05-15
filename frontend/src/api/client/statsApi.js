import { fetchWithAuth } from "@/api/authApi";

const LEARNING_STATS_URL = `/api/v1/learning-stats`;

export const statsApi = {
  // Lấy thống kê học tập của user hiện tại
  // Backend trả về: { vocabulary: {ownedCount, practicedCount, practiceCount, avgScore}, reading: {...}, listening: {...} }
  getLearningStats: async () => {
    const response = await fetchWithAuth(LEARNING_STATS_URL, {
      method: "GET",
    });
    const raw = response.data || {};

    // Chuẩn hóa dữ liệu từ backend
    const vocab = raw.vocabulary || {};
    const reading = raw.reading || {};
    const listening = raw.listening || {};

    return {
      vocabulary: {
        ownedCount: vocab.ownedCount || 0,
        practicedCount: vocab.practicedCount || 0,
        practiceCount: vocab.practiceCount || 0,
        avgScore: vocab.avgScore || 0,
      },
      reading: {
        ownedCount: reading.ownedCount || 0,
        practicedCount: reading.practicedCount || 0,
        practiceCount: reading.practiceCount || 0,
        avgScore: reading.avgScore || 0,
      },
      listening: {
        ownedCount: listening.ownedCount || 0,
        practicedCount: listening.practicedCount || 0,
        practiceCount: listening.practiceCount || 0,
        avgScore: listening.avgScore || 0,
      },
      // Các trường backend chưa có, đánh dấu là null để UI hiển thị placeholder
      currentStreak: null,
      totalDaysActive: null,
    };
  },
};
