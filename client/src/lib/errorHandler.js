import toast from 'react-hot-toast';

export const parseErrorMessage = (error, fallbackMessage = 'An unexpected error occurred') => {
  if (!error) return fallbackMessage;

  // 1. If error is an Axios error with response data
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;

    // Check if backend returned HTML (e.g. 504 Gateway Timeout or 500 error page)
    if (typeof data === 'string' && data.includes('<!doctype html>')) {
      if (status === 504) {
        return 'Serverless Gateway Timeout (504). The AI generation took longer than the server limit. Please try again with a simpler prompt.';
      }
      if (status === 502 || status === 503) {
        return `Backend Server Unavailable (${status}). Please verify the backend deployment on Vercel.`;
      }
      return `Server Error (${status}). The backend returned an HTML error page.`;
    }

    if (data && typeof data === 'object') {
      if (data.message) return data.message;
      if (data.error) return typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
    }

    if (status === 401) {
      return 'Unauthorized (401). Your session may have expired. Please sign in again.';
    }
    if (status === 403) {
      return 'Forbidden (403). You do not have permission to perform this action.';
    }
    if (status === 429) {
      return 'Too Many Requests (429). Rate limit exceeded. Please wait a moment and try again.';
    }
    if (status === 500) {
      return 'Internal Server Error (500). Please check backend server logs.';
    }
    if (status === 504) {
      return 'Gateway Timeout (504). The request took too long to complete. Please try again.';
    }
  }

  // 2. If it's a network error / timeout
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return 'Request timed out. The server took too long to respond.';
  }
  if (error.message === 'Network Error' || !error.response) {
    return 'Network Error. Could not connect to the backend server. Please check your internet or VITE_BASE_URL configuration.';
  }

  // 3. Normal Error or string
  if (typeof error === 'string') return error;
  if (error.message) return error.message;

  return fallbackMessage;
};

export const handleApiError = (error, context = 'AI Tool') => {
  const message = parseErrorMessage(error, `Failed to execute ${context}`);
  console.error(`[${context} Error]:`, {
    message,
    status: error?.response?.status,
    data: error?.response?.data,
    raw: error
  });
  toast.error(message, { duration: 6000 });
  return message;
};

export const handleApiResponse = (data, context = 'AI Tool') => {
  if (data && data.success) {
    return { success: true, content: data.content };
  }

  const message = data?.message || (typeof data === 'string' && data.includes('<!doctype')
    ? 'Backend returned HTML. Check API configuration.'
    : `Failed to complete ${context}`);

  console.error(`[${context} Backend Error]:`, { data, message });
  toast.error(message, { duration: 6000 });
  return { success: false, message };
};
