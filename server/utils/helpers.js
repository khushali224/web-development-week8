function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function parsePagination(query) {
  const pageValue = query.page === undefined ? '1' : query.page;
  const limitValue = query.limit === undefined ? '10' : query.limit;
  if (typeof pageValue !== 'string' || !/^\d+$/.test(pageValue)) {
    throw new Error('Page must be a positive integer');
  }
  if (typeof limitValue !== 'string' || !/^\d+$/.test(limitValue)) {
    throw new Error('Limit must be an integer between 1 and 100');
  }
  const page = Number(pageValue);
  const limit = Number(limitValue);
  if (!Number.isSafeInteger(page) || page < 1) {
    throw new Error('Page must be a positive integer');
  }
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100) {
    throw new Error('Limit must be an integer between 1 and 100');
  }
  const skip = (page - 1) * limit;
  if (!Number.isSafeInteger(skip)) throw new Error('Page is too large');
  return { page, limit, skip };
}

module.exports = { escapeRegex, parsePagination };
