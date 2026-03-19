import { api } from "../api/axios";

/**
 * Comment type returned from the backend
 */
export interface CommentItem {
  _id: string;
  text: string;
  createdAt: string;
  updatedAt?: string;
  author: {
    _id: string;
    username: string;
    profileImage?: string;
    profilePicture?: string;
  };
}

/**
 * Get all comments for a specific post
 */
export const getComments = async (postId: string): Promise<CommentItem[]> => {
  const res = await api.get(`/posts/${postId}/comments`);
  return res.data;
};

/**
 * Create a new comment for a specific post
 * Requires access token because the route is protected
 */
export const createComment = async (
  postId: string,
  text: string,
  accessToken: string
): Promise<CommentItem> => {
  const res = await api.post(
    `/posts/${postId}/comments`,
    { text },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return res.data;
};