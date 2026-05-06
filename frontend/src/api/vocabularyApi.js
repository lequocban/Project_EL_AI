import { API_BASE_URL, fetchWithAuth } from "@/api/authApi";

const VOCABULARY_SET_URL = `${API_BASE_URL}/api/v1/vocabulary-sets`;
const VOCABULARY_URL = `${API_BASE_URL}/api/v1/vocabulary`;

const normalizeSet = (set) => ({
  ...set,
  word_count: set.wordCount ?? set.word_count ?? set.words?.length ?? 0,
  is_public: set.status === "PUBLIC" || set.is_public || false,
});

const normalizeWord = (word) => ({
  ...word,
  pronunciation: word.pronunciation || word.phonetic || "",
  part_of_speech: word.part_of_speech || word.partOfSpeech || "",
});

export const vocabularyApi = {
  getMySets: async () => {
    const response = await fetchWithAuth(`${VOCABULARY_SET_URL}/my?limit=15`, {
      method: "GET",
    });
    return (response.data?.items || []).map(normalizeSet);
  },

  getPublicSets: async () => {
    const response = await fetchWithAuth(`${VOCABULARY_SET_URL}/public?limit=15`, {
      method: "GET",
    });
    return (response.data?.items || []).map(normalizeSet);
  },

  getSetById: async (id) => {
    const response = await fetchWithAuth(`${VOCABULARY_SET_URL}/${id}`, {
      method: "GET",
    });
    return normalizeSet({
      ...response.data,
      words: (response.data?.words || []).map(normalizeWord),
    });
  },

  createSet: async ({ title, description }) => {
    const response = await fetchWithAuth(VOCABULARY_SET_URL, {
      method: "POST",
      body: JSON.stringify({ title, description }),
    });
    return normalizeSet(response.data);
  },

  deleteSet: async (id) => {
    return fetchWithAuth(`${VOCABULARY_SET_URL}/${id}`, {
      method: "DELETE",
    });
  },

  addWordsToSet: async (id, words) => {
    return fetchWithAuth(`${VOCABULARY_SET_URL}/${id}/words`, {
      method: "POST",
      body: JSON.stringify({ words }),
    });
  },

  deleteWordsFromSet: async (id, wordIds) => {
    return fetchWithAuth(`${VOCABULARY_SET_URL}/${id}/words/remove`, {
      method: "DELETE",
      body: JSON.stringify({ wordIds }),
    });
  },

  lookupWord: async (word) => {
    const response = await fetchWithAuth(`${VOCABULARY_URL}/lookup`, {
      method: "POST",
      body: JSON.stringify({ word }),
    });
    return normalizeWord(response.data);
  },
};
