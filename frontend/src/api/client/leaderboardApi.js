import { fetchWithAuth } from "@/api/authApi";

// Endpoint API cho bảng xếp hạng
const LEADERBOARD_URL = `/api/v1/leaderboard`;

// Chuẩn hóa dữ liệu một entry trong bảng xếp hạng
const normalizeEntry = (entry) => ({
  rank: entry.rank ?? 0,
  user_id: entry.user_id ?? "",
  user_name: entry.user_name ?? "Người dùng ẩn danh",
  practice_count: entry.practice_count ?? 0,
  avg_score: entry.avg_score ?? 0,
  score: entry.score ?? 0,
});

export const leaderboardApi = {
  // Lấy bảng xếp hạng tổng với phân trang
  getLeaderboard: async ({ page = 1, limit = 10 } = {}) => {
    // Giới hạn tối đa 50 item mỗi trang theo API contract
    const safeLimit = Math.min(Math.max(1, limit), 50);

    const params = new URLSearchParams({
      page: String(page),
      limit: String(safeLimit),
    });

    const response = await fetchWithAuth(`${LEADERBOARD_URL}?${params}`, {
      method: "GET",
    });

    const raw = response.data || {};

    return {
      leaderboard: (raw.leaderboard || []).map(normalizeEntry),
      pagination: {
        page: raw.pagination?.page ?? page,
        limit: raw.pagination?.limit ?? safeLimit,
        total: raw.pagination?.total ?? 0,
        totalPages: raw.pagination?.totalPages ?? 1,
      },
      currentUserRank: raw.current_user_rank ?? null,
      skill: null,
    };
  },

  // Lấy bảng xếp hạng theo kỹ năng với phân trang
  getLeaderboardBySkill: async ({ skill, page = 1, limit = 10 } = {}) => {
    const VALID_SKILLS = ["vocabulary", "reading", "listening"];
    if (!skill || !VALID_SKILLS.includes(skill)) {
      throw new Error("Loại kỹ năng không hợp lệ. Chọn: vocabulary, reading, hoặc listening");
    }

    const safeLimit = Math.min(Math.max(1, limit), 50);

    const params = new URLSearchParams({
      skill,
      page: String(page),
      limit: String(safeLimit),
    });

    const response = await fetchWithAuth(`${LEADERBOARD_URL}/by-skill?${params}`, {
      method: "GET",
    });

    const raw = response.data || {};

    return {
      leaderboard: (raw.leaderboard || []).map(normalizeEntry),
      pagination: {
        page: raw.pagination?.page ?? page,
        limit: raw.pagination?.limit ?? safeLimit,
        total: raw.pagination?.total ?? 0,
        totalPages: raw.pagination?.totalPages ?? 1,
      },
      currentUserRank: raw.current_user_rank ?? null,
      skill: raw.skill ?? skill,
    };
  },
};
