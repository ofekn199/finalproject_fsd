import { api } from "../api/axios";

/*
 * Post service — API calls for post CRUD and feed.
 * getPosts    — public, no token needed
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

// GET /posts?page=&limit= — returns paginated feed, newest first
export const getPosts = async (page = 1, limit = 10): Promise<FeedResult> => {
  const res = await api.get(`/posts?page=${page}&limit=${limit}`);
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
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

// PUT /posts/:id — updates the post text, only the owner can call this
export const updatePost = async (
  id: string,
  text: string,
  accessToken: string
): Promise<Post> => {
  const res = await api.put(
    `/posts/${id}`,
    { text },
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
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
