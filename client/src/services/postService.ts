import { api } from "../api/axios";

/*
 * Post service — API calls for post CRUD and feed.
 * getAllPosts — public, supports optional userId filter for profile pages
 * createPost  — auth required, supports optional image upload
 * updatePost  — auth required, owner only
 * deletePost  — auth required, owner only
 */

export interface Post {
  _id: string;
  text: string;
  imageUrl?: string;
  author: {
    _id: string;
    username: string;
    profilePicture?: string;
  };
  likesCount: number;
  commentsCount: number;
  createdAt: string;
}

export interface FeedResult {
  items: Post[];
  page: number;
  limit: number;
  hasMore: boolean;
}

// GET /posts — returns paginated posts, newest first
// Pass userId to filter by a specific author (used on profile pages)
export const getAllPosts = async (params?: { page?: number; limit?: number; userId?: string }): Promise<FeedResult> => {
  const { page = 1, limit = 10, userId } = params ?? {};
  const query = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (userId) query.set("userId", userId);
  const res = await api.get(`/posts?${query}`);
  return res.data;
};

// POST /posts — creates a new post, image is optional
export const createPost = async (
  text: string,
  accessToken: string,
  image?: File
): Promise<Post> => {
  const form = new FormData();
  form.append("text", text);
  if (image) form.append("image", image);

  const res = await api.post("/posts", form, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return res.data;
};

// PUT /posts/:id — updates the post text and/or image, only the owner can call this
// image: File = replace image, null = remove image, undefined = keep existing
export const updatePost = async (
  id: string,
  text: string,
  accessToken: string,
  image?: File | null
): Promise<Post> => {
  const form = new FormData();
  form.append("text", text);
  if (image === null) {
    form.append("removeImage", "true");
  } else if (image instanceof File) {
    form.append("image", image);
  }
  const res = await api.put(`/posts/${id}`, form, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return res.data;
};

// DELETE /posts/:id — removes the post, only the owner can call this
export const deletePost = async (
  id: string,
  accessToken: string
): Promise<void> => {
  await api.delete(`/posts/${id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
};
