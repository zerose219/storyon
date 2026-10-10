import type { SignupRequest, SignupResponse } from "../types/auth";

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