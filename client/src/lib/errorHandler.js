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
        return `Backend Server Unavailable (${status}). Please verify your backend deployment on Render/Vercel.`;
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
      return 'Forbidden (403). You do not have permission to perform this action or usage limit reached.';
    }
    if (status === 404) {
      return 'API Route Not Found (404). Please check your backend URL and route paths.';
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
    return 'Request timed out. The server took too long to respond (AI generation may still be running).';
  }
  if (error.message === 'Network Error' || !error.response) {
    return 'Network Error. Could not connect to the backend server. Please verify VITE_BASE_URL points to your active backend (Render or Vercel).';
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
  if (data && data.success && data.content !== undefined) {
    return { success: true, content: data.content };
  }

  let message = data?.message;
  if (!message || (data && data.success && data.content === undefined)) {
    if (typeof data === 'string') {
      if (data.includes('Server is live') || data.includes('API WORKING') || data.includes('live and running')) {
        message = 'Backend reached root instead of API route. Please redeploy frontend on Vercel to apply the new VITE_BASE_URL.';
      } else if (data.includes('<!doctype') || data.includes('<html')) {
        message = 'Backend returned an HTML response page. Check backend API deployment.';
      } else if (data.trim().length > 0 && data.trim().length < 150) {
        message = data.trim();
      } else {
        message = `Failed to complete ${context}`;
      }
    } else if (data && data.status === 'healthy') {
      message = 'Backend reached root health endpoint instead of API route. Please check your backend routing.';
    } else {
      message = data?.message || `Failed to complete ${context}`;
    }
  }

  console.error(`[${context} Backend Error]:`, { data, message });
  toast.error(message, { duration: 6000 });
  return { success: false, message };
};
