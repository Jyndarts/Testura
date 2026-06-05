import api from "./axios";

export async function signupApi(data: {
  name: string;
  email: string;
  password: string;
}) {
  const res = await api.post("/auth/signup", data);
  return res.data.data;
}

export async function loginApi(data: { email: string; password: string }) {
  const res = await api.post("/auth/login", data);
  return res.data.data;
}

export async function refreshApi(refreshToken: string) {
  const res = await api.post("/auth/refresh", { refreshToken });
  return res.data.data;
}

export async function logoutApi() {
  const res = await api.post("/auth/logout");
  return res.data;
}

export async function getMeApi() {
  const res = await api.get("/auth/me");
  return res.data.data;
}
