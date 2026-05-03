const normalizeSupabaseKey = (key) => {
  if (!key) {
    return "";
  }

  const jwtIndex = key.indexOf("eyJhbGci");
  return jwtIndex > 0 ? key.slice(jwtIndex) : key;
};

module.exports = { normalizeSupabaseKey };
