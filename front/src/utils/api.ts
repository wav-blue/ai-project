import axios, { AxiosResponse } from 'axios';

const api = axios.create({
  // baseURL: 'http://localhost:5001/api',
  baseURL: 'http://kdt-ai-9-team01.elicecoding.com:5001/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

api.interceptors.request.use(
  req => {

    // Blob 데이터를 감지하고 Content-Type 설정
    if (req.data instanceof Blob) {
      // Blob의 MIME 타입을 Content-Type으로 설정
      req.headers['Content-Type'] = req.data.type;
    }

    if (req.data && req.data instanceof FormData) {
      req.headers['Content-Type'] = 'multipart/form-bodyData';
    }
    return req;
  },
  err => {
    console.log(err);
  },
);

async function get<T = any>(endpoint: string, token?: string, cookie?: string) {
  let headers: { [key: string]: string } = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (cookie) {
    headers['Cookie'] = cookie;
  }
  return await api.get<T>(endpoint, { headers });
}

async function post<T = any>(endpoint: string, bodyData?: FormData | Object, cookie?: string) {
  let headers: { [key: string]: string } = {};
  if (cookie) {
    headers['Cookie'] = cookie;
  }
  return await api.post<T>(endpoint, bodyData, { headers });
}

async function put<T = any>(endpoint: string, bodyData: FormData | Object, token?: string) {
  const headers = token ? { Authorization: `Bearer ${token}`} : {}
  return await api.put<T>(endpoint, bodyData, { headers })
}

async function del<T = any>(endpoint: string, token?: string) {
  const headers = token ? { Authorization: `Bearer ${token}`} : {}
  return await api.delete<T>(endpoint, { headers })
}

export { get, post, put, del };
