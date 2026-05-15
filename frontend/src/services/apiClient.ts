const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

interface RequestOptions extends RequestInit {
  requireAuth?: boolean;
}

export const apiClient = async <T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> => {
  const { requireAuth = true, headers, ...customConfig } = options;

  const config: RequestInit = {
    ...customConfig,
    headers: {
      ...headers,
    },
  };

  if (customConfig.body) {
    if (customConfig.body instanceof FormData) {
      // FormData için Content-Type'ı tarayıcı otomatik belirler (boundary ile birlikte)
    } else {
      (config.headers as Record<string, string>)['Content-Type'] = 'application/json';
      if (typeof customConfig.body !== 'string') {
        config.body = JSON.stringify(customConfig.body);
      }
    }
  }

  if (requireAuth) {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
      }
    }
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    let errorMessage = 'Bir hata oluştu';
    try {
      const errorText = await response.text();
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        errorMessage = errorText;
      }
    } catch {
      // Ignored
    }
    throw new Error(errorMessage || 'API isteği başarısız oldu');
  }

  const text = await response.text();
  if (!text) return {} as T;

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T; // e.g., plain text success message
  }
};
