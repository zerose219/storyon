import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  createPost,
  type PostCreateRequest,
} from "../services/posts";
import {
  getCategories,
  type Category,
} from "../services/categories";

function PostCreate() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [status, setStatus] =
    useState<"DRAFT" | "PUBLISHED">("PUBLISHED");
  const [visibility, setVisibility] =
    useState<"PUBLIC" | "PRIVATE">("PUBLIC");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const navigate = useNavigate();

  // 카테고리 목록 조회
  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "카테고리 목록을 불러오지 못했습니다."
        );
      } finally {
        setLoadingCategories(false);
      }
    }

    loadCategories();
  }, []);

  // 게시글 작성
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const parsedCategoryId = Number(categoryId);

    if (
      !Number.isInteger(parsedCategoryId) ||
      parsedCategoryId <= 0
    ) {
      setError("카테고리를 선택해 주세요.");
      return;
    }

    const postData: PostCreateRequest = {
      title,
      content,
      category_id: parsedCategoryId,
      status,
      visibility,
    };

    try {
      setSubmitting(true);

      await createPost(postData);

      navigate("/posts");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "게시글 작성에 실패했습니다."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1>게시글 작성</h1>

      <form onSubmit={handleSubmit}>
        {/* 제목 */}
        <div>
          <label htmlFor="title">제목</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={255}
            required
          />
        </div>

        {/* 내용 */}
        <div>
          <label htmlFor="content">내용</label>
          <textarea
            id="content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={10}
            required
          />
        </div>

        {/* 카테고리 선택 */}
        <div>
          <label htmlFor="categoryId">카테고리</label>

          <select
            id="categoryId"
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            required
            disabled={loadingCategories || categories.length === 0}
          >
            <option value="">
              {loadingCategories
                ? "카테고리 불러오는 중..."
                : "카테고리를 선택하세요"}
            </option>

            {categories.map((category) => (
              <option
                key={category.category_id}
                value={String(category.category_id)}
              >
                {category.category_name}
              </option>
            ))}
          </select>

          {!loadingCategories && categories.length === 0 && (
            <p>등록된 카테고리가 없습니다.</p>
          )}
        </div>

        {/* 게시글 상태 */}
        <div>
          <label htmlFor="status">게시글 상태</label>
          <select
            id="status"
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as "DRAFT" | "PUBLISHED")
            }
          >
            <option value="DRAFT">임시저장</option>
            <option value="PUBLISHED">게시</option>
          </select>
        </div>

        {/* 공개 설정 */}
        <div>
          <label htmlFor="visibility">공개 설정</label>
          <select
            id="visibility"
            value={visibility}
            onChange={(event) =>
              setVisibility(
                event.target.value as "PUBLIC" | "PRIVATE"
              )
            }
          >
            <option value="PUBLIC">공개</option>
            <option value="PRIVATE">비공개</option>
          </select>
        </div>

        {/* 오류 메시지 */}
        {error && <p role="alert">{error}</p>}

        {/* 버튼 */}
        <button
          type="submit"
          disabled={
            submitting ||
            loadingCategories ||
            categories.length === 0
          }
        >
          {submitting ? "작성 중..." : "게시글 작성"}
        </button>

        <button
          type="button"
          onClick={() => navigate("/posts")}
        >
          취소
        </button>
      </form>
    </div>
  );
}

export default PostCreate;