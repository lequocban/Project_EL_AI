import { fetchWithAuth } from "@/api/authApi";

const MODERATION_URL = "/api/v1/moderation-requests";

export const moderationApi = {
  getMyRequests: async ({
    page = 1,
    limit = 15,
    keyword = "",
    sortField = "created_at",
    sortOrder = "desc",
    status = "",
  } = {}) => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      sortField,
      sortOrder,
    });
    if (keyword) params.append("keyword", keyword);
    if (status) params.append("status", status);

    const response = await fetchWithAuth(`${MODERATION_URL}/my?${params}`, {
      method: "GET",
    });

    const resData = response.data || {};
    let items = [];
    let total = 0;
    let totalPages = 1;
    let pageNum = page;

    if (Array.isArray(resData.data)) {
      items = resData.data;
      total = resData.total ?? items.length;
      pageNum = resData.page ?? page;
      totalPages = resData.totalPages ?? (Math.ceil(total / limit) || 1);
    } else if (resData.data && Array.isArray(resData.data.items)) {
      items = resData.data.items;
      total = resData.data.total ?? items.length;
      pageNum = resData.data.page ?? page;
      totalPages = resData.data.totalPages ?? 1;
    } else if (Array.isArray(resData.items)) {
      items = resData.items;
      total = resData.total ?? items.length;
      pageNum = resData.page ?? page;
      totalPages = resData.totalPages ?? 1;
    }

    return {
      items,
      total,
      page: pageNum,
      limit,
      totalPages,
    };
  },

  requestModeration: async (contentType, contentId) => {
    return fetchWithAuth(MODERATION_URL, {
      method: "POST",
      body: JSON.stringify({ contentType, contentId }),
    });
  },
};
