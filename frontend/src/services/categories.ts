
export interface Category {
  category_id: number;
  category_name: string;
}

export async function getCategories(): Promise<Category[]> {
  const token = localStorage.getItem("access_token");

  const response = await fetch(
    "http://localhost:8000/api/categories",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error("카테고리 목록을 불러오지 못했습니다.");
  }

  return response.json();
}
