import api from './api';

// Normalize backend book object shapes (PascalCase or camelCase) to a stable camelCase shape
function normalizeBook(raw) {
  if (!raw || typeof raw !== 'object') return raw;

  // Helper to pick either camelCase or PascalCase key
  const pick = (obj, camel, pascal) => (obj[camel] !== undefined ? obj[camel] : obj[pascal]);

  const categoryRaw = pick(raw, 'category', 'Category');
  const category = categoryRaw
    ? {
        id: pick(categoryRaw, 'id', 'Id'),
        name: pick(categoryRaw, 'name', 'Name'),
      }
    : undefined;

  const publishedRaw = pick(raw, 'publishedDate', 'PublishedDate') || pick(raw, 'publishedOn', 'PublishedOn');
  let publishedDate = undefined;
  if (publishedRaw) {
    // If backend sent DateOnly or Date string, try to convert to ISO string
    try {
      const d = new Date(publishedRaw);
      if (!Number.isNaN(d.getTime())) publishedDate = d.toISOString();
      else publishedDate = publishedRaw;
    } catch (e) {
      publishedDate = publishedRaw;
    }
  }

  const obj = {
    id: pick(raw, 'id', 'Id'),
    title: pick(raw, 'title', 'Title'),
    author: pick(raw, 'author', 'Author'),
    isbn: pick(raw, 'isbn', 'Isbn') || pick(raw, 'ISBN', 'ISBN'),
    publisher: pick(raw, 'publisher', 'Publisher'),
    publishedDate,
    description: pick(raw, 'description', 'Description'),
    totalCopies: Number(pick(raw, 'totalCopies', 'TotalCopies') ?? pick(raw, 'total', 'Total') ?? 0),
    availableCopies: Number(pick(raw, 'availableCopies', 'AvailableCopies') ?? pick(raw, 'available', 'Available') ?? 0),
    imageUrl: pick(raw, 'imageUrl', 'ImageUrl'),
    categoryId: Number(pick(raw, 'categoryId', 'CategoryId') ?? (category && category.id) ?? 0),
    category,
  };

  return obj;
}

function normalizeListResponse(response) {
  const d = response.data;
  let items = [];
  if (Array.isArray(d)) items = d;
  else if (d && typeof d === 'object') {
    if (Array.isArray(d.data)) items = d.data;
    else if (Array.isArray(d.items)) items = d.items;
    else if (Array.isArray(d.books)) items = d.books;
    else if (Array.isArray(d.records)) items = d.records;
    else items = [];
  }

  // normalize each book
  const normalizedItems = items.map(normalizeBook);

  const total = d?.total || d?.totalBooks || d?.totalUsers || d?.totalCount || d?.totalItems || d?.totalRecords || parseInt(response.headers['x-total-count']) || normalizedItems.length;
  const pageNumber = d?.pageNumber || d?.page || d?.pageIndex || 1;
  const pageSizeResp = d?.pageSize || d?.page_size || d?.pageSize || normalizedItems.length;
  const totalPages = d?.totalPages || Math.ceil(total / (pageSizeResp || 1));

  return { items: normalizedItems, total, pageNumber, pageSize: pageSizeResp, totalPages };
}

export const bookService = {
  getBooks: async ({ page = 1, pageSize = 10 } = {}) => {
    const params = { pageNumber: page, pageSize };
    const response = await api.get('/Book', { params });
    return normalizeListResponse(response);
  },

  getBook: async (id) => {
    const response = await api.get(`/Book/${id}`);
    return normalizeBook(response.data);
  },

  searchBooks: async ({ query = '', page = 1, pageSize = 10 } = {}) => {
    const response = await api.get('/Book/search', { params: { query, pageNumber: page, pageSize } });
    return normalizeListResponse(response);
  },

  getBooksByCategory: async (categoryId) => {
    const response = await api.get(`/Book/category/${categoryId}`);
    // backend might return array or wrapped object
    const d = response.data;
    const arr = Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : [];
    return arr.map(normalizeBook);
  },
  createBook: async (bookData) => {
    try {
      // Debug: log payload
      // eslint-disable-next-line no-console
      console.log('bookService.createBook payload:', bookData);
      const response = await api.post('/Book', bookData);
      // eslint-disable-next-line no-console
      console.log('bookService.createBook response:', response);
      return response.data;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('bookService.createBook error:', err?.response || err);
      throw err;
    }
  },
  updateBook: async (id, bookData) => {
    try {
      // eslint-disable-next-line no-console
      console.log(`bookService.updateBook id=${id} payload:`, bookData);
      // ensure id is present in body to match backend Book entity expectation
      const payload = { id, ...bookData };
      const response = await api.put(`/Book/${id}`, payload);
      // eslint-disable-next-line no-console
      console.log('bookService.updateBook response:', response);
      return response.data;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('bookService.updateBook error:', err?.response || err);
      throw err;
    }
  },
  deleteBook: async (id) => {
    try {
      // eslint-disable-next-line no-console
      console.log('bookService.deleteBook id=', id);
      const response = await api.delete(`/Book/${id}`);
      // eslint-disable-next-line no-console
      console.log('bookService.deleteBook response:', response);
      return response.data;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('bookService.deleteBook error:', err?.response || err);
      throw err;
    }
  },

  // PATCH /api/Book/{id}/quantity - Cập nhật số lượng sách (Staff only)
  updateBookQuantity: async (id, { totalCopies, availableCopies }) => {
    try {
      // eslint-disable-next-line no-console
      console.log(`bookService.updateBookQuantity id=${id} payload:`, { totalCopies, availableCopies });
      const response = await api.patch(`/Book/${id}/quantity`, {
        totalCopies,
        availableCopies
      });
      // eslint-disable-next-line no-console
      console.log('bookService.updateBookQuantity response:', response);
      return response.data;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('bookService.updateBookQuantity error:', err?.response || err);
      throw err;
    }
  },

  // GET /api/Book/{id}/borrows - Xem các phiếu mượn của sách
  getBookBorrows: async (id, { status = '', pageNumber = 1, pageSize = 10 } = {}) => {
    try {
      const params = { pageNumber, pageSize };
      if (status) params.status = status;
      
      const response = await api.get(`/Book/${id}/borrows`, { params });
      return response.data;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('bookService.getBookBorrows error:', err?.response || err);
      throw err;
    }
  }
};
