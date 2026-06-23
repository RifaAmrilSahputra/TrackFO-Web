/**
 * Error Handler untuk mengelola error dari API
 */

export const getErrorMessage = (error) => {
  // Error dari API dengan response
  if (error.response) {
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return data?.message || 'Request tidak valid';
      case 401:
        return 'Anda tidak terautentikasi. Silakan login kembali.';
      case 403:
        return 'Anda tidak memiliki akses ke resource ini.';
      case 404:
        return 'Resource tidak ditemukan.';
      case 409:
        return data?.message || 'Konflik data. Silakan coba lagi.';
      case 422:
        return data?.message || 'Data validation error.';
      case 500:
        return 'Terjadi kesalahan pada server. Silakan coba lagi nanti.';
      case 502:
      case 503:
      case 504:
        return 'Server sedang tidak tersedia. Silakan coba lagi nanti.';
      default:
        return data?.message || 'Terjadi kesalahan. Silakan coba lagi.';
    }
  }
  
  // Error saat request (network error)
  if (error.request && !error.response) {
    return 'Gagal terhubung ke server. Periksa koneksi internet Anda.';
  }
  
  // Error lainnya
  return error.message || 'Terjadi kesalahan yang tidak diketahui.';
};

export const getValidationErrors = (error) => {
  if (error.response?.status === 422 && error.response?.data?.errors) {
    return error.response.data.errors;
  }
  return null;
};

export const handleAPIError = (error) => {
  const message = getErrorMessage(error);
  const validationErrors = getValidationErrors(error);
  
  return {
    message,
    validationErrors,
    statusCode: error.response?.status,
  };
};

/**
 * Log error untuk debugging
 */
export const logError = (error, context = '') => {
  console.error(`[${context}]`, {
    message: error.message,
    status: error.response?.status,
    data: error.response?.data,
    originalError: error,
  });
};
