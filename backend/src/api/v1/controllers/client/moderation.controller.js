const moderationService = require("../../services/moderation.service");
const { success } = require("../../../../utils/responseHandler");

/**
 * POST /api/v1/moderation-requests
 * Tạo yêu cầu kiểm duyệt nội dung.
 * Body: { contentType: string, contentId: string }
 */
const createModerationRequest = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const accessToken = req.accessToken;
    const { contentType, contentId } = req.body;

    const result = await moderationService.createModerationRequest(accessToken, userId, {
      contentType,
      contentId,
    });

    return success(res, result, "Yêu cầu kiểm duyệt đã được gửi thành công");
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/v1/moderation-requests/my
 * Lấy danh sách yêu cầu kiểm duyệt của user đang đăng nhập.
 * Query: keyword, status, page, limit
 */
const getMyModerationRequests = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const accessToken = req.accessToken;
    const { keyword, status, page, limit } = req.query;

    const result = await moderationService.getMyRequests(accessToken, userId, {
      keyword,
      status,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 15,
    });

    return success(res, result, "Lấy danh sách yêu cầu kiểm duyệt thành công");
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createModerationRequest,
  getMyModerationRequests,
};
