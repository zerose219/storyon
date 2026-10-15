import { apiRequest } from "./api";

export type Post = {
  post_id: number;
  user_id: number;
  title: string;
  content: string;
  category_id: number;
  status: "DRAFT" | "PUBLISHED";
  visibility: "PUBLIC" | "PRIVATE";
  created_at: string;
  updated_at: string | null;
};

const API_URL = "/api/posts";

export async function getPosts(): Promise<Post[]> {
  const response = await apiRequest(API_URL);

  if (!response.ok) {
    throw new Error("게시글 목록을 불러오지 못했습니다.");
  }

  return response.json();
}

// 게시글 작성
export type PostCreateRequest = {
  title: string;
  content: string;
  category_id: number;
  status: "DRAFT" | "PUBLISHED";
  visibility: "PUBLIC" | "PRIVATE";
};

export async function createPost(
  postData: PostCreateRequest,
): Promise<Post> {
  const response = await apiRequest(API_URL, {
    method: "POST",
    body: JSON.stringify(postData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData?.detail ?? "게시글 작성에 실패했습니다.",
    );
  }

  return response.json();
}

// 게시글 상세 조회
export async function getPost(postId: number): Promise<Post> {
  const response = await apiRequest(`${API_URL}/${postId}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("게시글을 찾을 수 없습니다.");
    }

    if (response.status === 403) {
      throw new Error("이 게시글을 볼 권한이 없습니다.");
    }

    throw new Error("게시글을 불러오지 못했습니다.");
  }

  return response.json();
}

// 게시글 수정
export async function updatePost(
  postId: number,
  postData: Partial<PostCreateRequest>,
): Promise<Post> {
  const response = await apiRequest(`${API_URL}/${postId}`, {
    method: "PATCH",
    body: JSON.stringify(postData),
  });

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error("게시글을 수정할 권한이 없습니다.");
    }

    if (response.status === 404) {
      throw new Error("게시글을 찾을 수 없습니다.");
    }

    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData?.detail ?? "게시글 수정에 실패했습니다.",
    );
  }

  return response.json();
}

// 게시글 삭제
export async function deletePost(postId: number): Promise<void> {
  const response = await apiRequest(`${API_URL}/${postId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error("게시글을 삭제할 권한이 없습니다.");
    }

    if (response.status === 404) {
      throw new Error("게시글을 찾을 수 없습니다.");
    }

    throw new Error("게시글 삭제에 실패했습니다.");
  }
}

// 내 게시글 조회
export async function getMyPosts(): Promise<Post[]> {
  const response = await apiRequest(`${API_URL}/my`);

  if (!response.ok) {
    throw new Error("내 게시글 목록을 불러오지 못했습니다.");
  }

  return response.json();
}

// 글 검색
export async function searchPosts(keyword: string): Promise<Post[]> {
  const response = await apiRequest(
    `${API_URL}/search?keyword=${encodeURIComponent(keyword)}`,
  );

  if (!response.ok) {
    throw new Error("게시글 검색에 실패했습니다.");
  }

  return response.json();
}
