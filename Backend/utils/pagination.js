// Admin lists return plain arrays (the dashboard filters client-side) but are capped;
// pass ?page=&limit= to page through larger data sets. Totals go in X-Total-Count.
const ADMIN_MAX_PAGE = 500;

const adminPage = (query) => {
    const limit = Math.min(Math.max(parseInt(query.limit, 10) || ADMIN_MAX_PAGE, 1), ADMIN_MAX_PAGE);
    const page = Math.max(parseInt(query.page, 10) || 1, 1);
    return { limit, skip: (page - 1) * limit };
};

module.exports = { adminPage, ADMIN_MAX_PAGE };
