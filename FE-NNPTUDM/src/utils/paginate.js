export const paginate = (data = [], page, limit) => {
  const total = data.length;
  const current_page = Number(page) || 1;
  const per_page = Number(limit) || 10;
  const offset = (current_page - 1) * per_page;

  const paginatedData = data.slice(offset, offset + per_page);

  const pagination = {
    current_page,
    total,
    per_page,
    total_pages: Math.ceil(total / per_page) || 1,
  };

  if (paginatedData.length > 0) {
    pagination.from = offset + 1;
    pagination.to = offset + paginatedData.length;
  } else {
    pagination.from = 0;
    pagination.to = 0;
  }

  return {
    data: paginatedData,
    pagination,
  };
};