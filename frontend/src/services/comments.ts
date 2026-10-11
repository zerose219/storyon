export interface Comment {
  comment_id: number;
  post_id: number;
  user_id: number;
  content: string;
  is_public: "PUBLIC" | "PRIVATE";
  created_at: string;
  updated_at: string | null;
  nickname: string;
}

export interface CommentCreate {
  content: string;
  is_public: "PUBLIC" | "PRIVATE";
}

export interface CommentUpdate {
  content?: string;
  is_public?: "PUBLIC" | "PRIVATE";
}

const API_BASE_URL = "http://localhost:8000";

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("access_token");

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = "댓글 요청에 실패했습니다.";

    try {
      const data = await response.json();
      message = data.detail ?? message;
    } catch {
      // 응답에 JSON 오류 내용이 없는 경우 기본 메시지 사용
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export async function getComments(
  postId: number
): Promise<Comment[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/posts/${postId}/comments`,
    { headers: getAuthHeaders() }
  );

  return handleResponse<Comment[]>(response);
}

export async function createComment(
  postId: number,
  data: CommentCreate
): Promise<Comment> {
  const response = await fetch(
    `${API_BASE_URL}/api/posts/${postId}/comments`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }
  );

  return handleResponse<Comment>(response);
}

export async function updateComment(
  postId: number,
  commentId: number,
  data: CommentUpdate
): Promise<Comment> {
  const response = await fetch(
    `${API_BASE_URL}/api/posts/${postId}/comments/${commentId}`,
    {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }
  );

  return handleResponse<Comment>(response);
}

export async function deleteComment(
  postId: number,
  commentId: number
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/posts/${postId}/comments/${commentId}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    }
  );

  await handleResponse<void>(response);
}