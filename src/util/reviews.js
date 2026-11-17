/**
 * Average rating from reviews a page has already loaded (item page, profile page).
 * Returns null when there are no rated reviews, so no rating is shown.
 *
 * @param {Array<Object>} reviews review entities
 * @returns {Object|null} { average: number (one decimal), count: number }
 */
export const getReviewsSummary = reviews => {
  const ratings = (reviews || [])
    .map(r => r?.attributes?.rating)
    .filter(rating => typeof rating === 'number');
  if (ratings.length === 0) {
    return null;
  }
  const sum = ratings.reduce((acc, rating) => acc + rating, 0);
  return { average: Math.round((sum / ratings.length) * 10) / 10, count: ratings.length };
};
