import type {
  SignupRequest,
  SignupResponse,
  LoginRequest,
  LoginResponse,
} from "../types/auth";

const API_BASE_URL = "http://localhost:8000";

export async function signup(
  data: SignupRequest,
): Promise<SignupResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      typeof result.detail === "string"
        ? result.detail
        : "회원가입 요청에 실패했습니다.",
    );
  }

  return result as SignupResponse;
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await fetch("http://localhost:8000/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result: LoginResponse = await response.json();

  if (!response.ok) {
    throw new Error("로그인에 실패했습니다.");
  }


  localStorage.setItem("access_token", result.access_token);
  return result;
}


// 인증된 API 요청을 위한 함수

export async function getMyInfo() {
  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("로그인이 필요합니다.");
  }

  const response = await fetch("http://localhost:8000/api/auth/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    localStorage.removeItem("access_token");
    throw new Error("로그인이 만료되었습니다. 다시 로그인해 주세요.");
  }

  if (!response.ok) {
    throw new Error("사용자 정보를 불러오지 못했습니다.");
  }

  return response.json();
}



export function logout() {
  localStorage.removeItem("access_token");
}
