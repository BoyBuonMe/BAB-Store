import axios from "axios";

const httpClient = axios.create({
  baseURL: import.meta.env.VITE_BASE_API,
});

const _send = async (method, path, data, config) => {
  const response = await httpClient.request({
    ...config,
    method,
    url: path,
    data,
  });

  return response.data;
};

httpClient.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// httpClient.interceptors.request.use((config) => {
//   const accessToken = localStorage.getItem("accessToken");
//   if (accessToken) {
//     config.headers.set("Authorization", `Bearer ${accessToken}`);
//   }

//   return config;
// });

const get = async (path, config) => {
  const response = await _send("get", path, null, config);
  return response.data;
};

const post = async (path, data, config) => {
  const response = await _send("post", path, data, config);
  return response.data;
};

const put = async (path, data, config) => {
  const response = await _send("put", path, data, config);
  return response.data;
};

const patch = async (path, data, config) => {
  const response = await _send("patch", path, data, config);
  return response.data;
};

const del = async (path, data, config) => {
  const response = await _send("delete", path, data, config);
  return response.data;
};

const http = { get, post, put, patch, del };
export default http;
