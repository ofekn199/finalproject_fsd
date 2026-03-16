import { api } from "../api/axios";

export const register = async (data: {
  username: string;
  email: string;
  password: string;
}) => {
  const res = await api.post("/auth/register", data);
  return res.data;
};

export const login = async (data: {
  username: string;
  password: string;
}) => {
  const res = await api.post("/auth/login", data);
  return res.data;
};

export const logoutRequest = async (accessToken: string) => {
  const res = await api.post(
    "/auth/logout",
    {},
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return res.data;
};