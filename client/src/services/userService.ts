import { api } from "../api/axios";
import type { Post } from "./postService";

/*
 * User service — API calls for profile features.
 * getProfile           — public, no token needed
 * updateProfile        — requires access token
 * uploadAvatar         — requires access token, multipart/form-data
 * getLikedPostsByUser  — public
 * getCommentedPostsByUser — public
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
  const res = await api.put("/users/me", fields, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return res.data;
};

export const uploadAvatar = async (
  file: File,
  accessToken: string
): Promise<{ profilePicture: string }> => {
  const form = new FormData();
  form.append("avatar", file);

  const res = await api.post("/users/me/avatar", form, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  return res.data;
};

export const getLikedPostsByUser = async (userId: string): Promise<Post[]> => {
  const res = await api.get(`/users/${userId}/liked-posts`);
  return res.data;
};

export const getCommentedPostsByUser = async (
  userId: string
): Promise<Post[]> => {
  const res = await api.get(`/users/${userId}/commented-posts`);
  return res.data;
};