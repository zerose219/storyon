const API_BASE_URL = "http://localhost:8000";

export interface PostLikeInfo {
  post_id: number;
  like_count: number;
  liked: boolean;
}

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("access_token");

  return {
    Authorization: `Bearer ${token}`,
  };
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = "좋아요 요청에 실패했습니다.";

    try {
      const data = await response.json();
      message = data.detail ?? message;
    } catch {
      // 기본 오류 메시지 사용
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export async function getPostLikes(
  postId: number
): Promise<PostLikeInfo> {
  const response = await fetch(
    `${API_BASE_URL}/api/posts/${postId}/likes`,
    { headers: getAuthHeaders() }
  );

  return handleResponse<PostLikeInfo>(response);
}

export async function createPostLike(
  postId: number
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/posts/${postId}/likes`,
    {
      method: "POST",
      headers: getAuthHeaders(),
    }
  );

  await handleResponse<void>(response);
}

export async function deletePostLike(
  postId: number
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/posts/${postId}/likes`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    }
  );

  await handleResponse<void>(response);
}