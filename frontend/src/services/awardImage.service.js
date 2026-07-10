import api from './api';

export const awardImageService = {
  // Get all images
  getAllImages: (params = {}) => api.get('/award-images', { params }),
  
  // Get homepage featured images
  getHomepageImages: (limit = 12) => api.get('/award-images/homepage', { params: { limit } }),
  
  // Get single image
  getImageById: (id) => api.get(`/award-images/${id}`),
  
  // Upload single image
  uploadImage: (formData) => {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
    return api.post('/award-images', formData, config);
  },
  
  // Upload multiple images
  uploadMultipleImages: (formData) => {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
    return api.post('/award-images/upload-multiple', formData, config);
  },
  
  // Update image
  updateImage: (id, formData) => {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
    return api.put(`/award-images/${id}`, formData, config);
  },
  
  // Delete image
  deleteImage: (id) => api.delete(`/award-images/${id}`),
  
  // Reorder images
  reorderImages: (images) => api.put('/award-images/reorder', { images }),
};

export const awardImageCategoryService = {
  // Get all categories
  getAllCategories: (params = {}) => api.get('/award-image-categories', { params }),
  
  // Get single category
  getCategoryById: (id) => api.get(`/award-image-categories/${id}`),
  
  // Create category
  createCategory: (data) => api.post('/award-image-categories', data),
  
  // Update category
  updateCategory: (id, data) => api.put(`/award-image-categories/${id}`, data),
  
  // Delete category
  deleteCategory: (id, moveToCategoryId) => api.delete(`/award-image-categories/${id}`, { data: { moveToCategoryId } }),
  
  // Reorder categories
  reorderCategories: (categories) => api.put('/award-image-categories/reorder', { categories }),
};
