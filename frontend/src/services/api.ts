const API_BASE_URL = "http://localhost:8000";

export async function apiRequest(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const token = localStorage.getItem("access_token");
  const headers = new Headers(options.headers);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error(
      "서버에 연결할 수 없습니다. 네트워크와 서버 상태를 확인해 주세요.",
    );
  }

  if (response.status === 401) {
    localStorage.removeItem("access_token");
    window.dispatchEvent(new Event("auth:expired"));
  }

  return response;
}
