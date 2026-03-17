import { api } from "../api/axios";

/*
 * User service — API calls for profile features.
 * getProfile   — public, no token needed
 * updateBio    — requires access token (logged-in user only)
 * uploadAvatar — requires access token, sends multipart/form-data
 */

export interface UserProfile {
  _id: string;
  username: string;
  email: string;
  bio?: string;
  profilePicture?: string;
}

export const getProfile = async (userId: string): Promise<UserProfile> => {
  const res = await api.get(`/users/${userId}`);
  return res.data;
};

export const updateProfile = async (
  fields: { bio?: string; username?: string },
  accessToken: string
): Promise<UserProfile> => {
  const res = await api.put(
    "/users/me",
    fields,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  return res.data;
};

export const uploadAvatar = async (file: File, accessToken: string): Promise<{ profilePicture: string }> => {
  const form = new FormData();
  form.append("avatar", file);
  const res = await api.post("/users/me/avatar", form, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};
