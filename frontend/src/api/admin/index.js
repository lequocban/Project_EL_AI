// Auth exports
export {
  ADMIN_ACCESS_TOKEN_KEY,
  ADMIN_TOKEN_EXPIRES_AT_KEY,
  fetchAdminWithAuth,
  handleResponse,
  getTokenExpiresAt,
  isTokenExpiringSoon,
  saveAdminSession,
  clearAdminSession,
  refreshAdminToken,
} from "./auth";

// Auth API
export { authApi } from "./authApi";

// Users API
export { usersApi } from "./users";

// Vocabulary API
export {
  getVocabPending,
  approveVocabSet,
  rejectVocabSet,
  getAllVocabularySets,
  getVocabSetById,
  createVocabSet,
  deleteVocabSet,
  getVocabSetWords,
} from "./vocabulary";

// Reading API
export {
  getReadingPending,
  approveReading,
  rejectReading,
  getAllReadingLessons,
  getReadingLessonById,
  createReadingLesson,
  deleteReadingLesson,
} from "./reading";

// Listening API
export {
  getListeningPending,
  approveListening,
  rejectListening,
  getAllListeningLessons,
  getListeningLessonById,
  createListeningLesson,
  deleteListeningLesson,
} from "./listening";

// Moderation API
export {
  getModerationRequest,
  reviewModerationRequest,
  updateVocabSet,
  addWordsToVocabSet,
  removeWordsFromVocabSet,
  updateReadingLesson,
  updateReadingQuestion,
  updateListeningLesson,
  updateListeningQuestion,
  getModerationVocabularySets,
  getModerationReadingLessons,
  getModerationListeningLessons,
} from "./moderation";

// Stats API
export { getStats } from "./stats";

// Barrel object cho tương thích ngược - gom tất cả methods vào một object
import { authApi } from "./authApi";
import { usersApi } from "./users";
import {
  getVocabPending,
  approveVocabSet,
  rejectVocabSet,
  getAllVocabularySets,
  getVocabSetById,
  createVocabSet,
  deleteVocabSet,
  getVocabSetWords,
} from "./vocabulary";
import {
  getReadingPending,
  approveReading,
  rejectReading,
  getAllReadingLessons,
  getReadingLessonById,
  createReadingLesson,
  deleteReadingLesson,
} from "./reading";
import {
  getListeningPending,
  approveListening,
  rejectListening,
  getAllListeningLessons,
  getListeningLessonById,
  createListeningLesson,
  deleteListeningLesson,
} from "./listening";
import {
  getModerationRequest,
  reviewModerationRequest,
  updateVocabSet as updateVocabSetMod,
  addWordsToVocabSet,
  removeWordsFromVocabSet,
  updateReadingLesson as updateReadingLessonMod,
  updateReadingQuestion,
  updateListeningLesson as updateListeningLessonMod,
  updateListeningQuestion,
  getModerationVocabularySets,
  getModerationReadingLessons,
  getModerationListeningLessons,
} from "./moderation";
import { getStats } from "./stats";

// Object adminApi giữ nguyên API surface như file gốc - tương thích ngược
export const adminApi = {
  // Auth
  login: authApi.login,
  getMe: authApi.getMe,
  logout: authApi.logout,

  // Stats
  getStats,

  // Users
  getUsers: usersApi.getUsers,
  getUserById: usersApi.getUserById,
  updateUserStatus: usersApi.updateUserStatus,
  updateUserRole: usersApi.updateUserRole,
  deleteUser: usersApi.deleteUser,

  // Vocabulary
  getVocabPending,
  approveVocabSet,
  rejectVocabSet,
  getAllVocabularySets,
  getVocabSetById,
  createVocabSet,
  deleteVocabSet,
  getVocabSetWords,

  // Reading
  getReadingPending,
  approveReading,
  rejectReading,
  getAllReadingLessons,
  getReadingLessonById,
  createReadingLesson,
  deleteReadingLesson,

  // Listening
  getListeningPending,
  approveListening,
  rejectListening,
  getAllListeningLessons,
  getListeningLessonById,
  createListeningLesson,
  deleteListeningLesson,

  // Moderation
  getModerationRequest,
  reviewModerationRequest,
  updateVocabSet: updateVocabSetMod,
  addWordsToVocabSet,
  removeWordsFromVocabSet,
  updateReadingLesson: updateReadingLessonMod,
  updateReadingQuestion,
  updateListeningLesson: updateListeningLessonMod,
  updateListeningQuestion,
  getModerationVocabularySets,
  getModerationReadingLessons,
  getModerationListeningLessons,
};

// auth utilities đã được export ở trên
