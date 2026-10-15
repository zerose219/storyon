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
import "../styles/common.css";
import "./PostCreate.css";

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
    <main className="page-container post-create-page">
      <section className="page-heading">
        <div>
          <h1>게시글 작성</h1>
          <p className="page-description">
            새롭게 배운 내용과 경험을 기록해 보세요.
          </p>
        </div>
      </section>

      <form className="card post-form" onSubmit={handleSubmit}>
        {error && (
          <p
            role="alert"
            className="status-message status-message-error"
          >
            {error}
          </p>
        )}

        <div className="form-group">
          <label htmlFor="title">제목</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={255}
            placeholder="게시글 제목을 입력하세요"
            required
          />
          <span className="form-help">
            최대 255자까지 입력할 수 있습니다.
          </span>
        </div>

        <div className="form-group">
          <label htmlFor="content">내용</label>
          <textarea
            id="content"
            className="post-content-input"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={14}
            placeholder="공유하고 싶은 학습 내용이나 경험을 작성하세요."
            required
          />
        </div>

        <div className="post-form-options">
          <div className="form-group">
            <label htmlFor="categoryId">카테고리</label>
            <select
              id="categoryId"
              value={categoryId}
              onChange={(event) =>
                setCategoryId(event.target.value)
              }
              required
              disabled={
                loadingCategories || categories.length === 0
              }
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
              <p className="form-help">
                등록된 카테고리가 없습니다.
              </p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="status">게시글 상태</label>
            <select
              id="status"
              value={status}
              onChange={(event) =>
                setStatus(
                  event.target.value as "DRAFT" | "PUBLISHED"
                )
              }
            >
              <option value="DRAFT">임시저장</option>
              <option value="PUBLISHED">게시</option>
            </select>
          </div>

          <div className="form-group">
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
        </div>

        <div className="form-actions post-form-actions">
          <button
            type="submit"
            className="btn btn-primary"
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
            className="btn btn-secondary"
            onClick={() => navigate("/posts")}
          >
            취소
          </button>
        </div>
      </form>
    </main>
  );
}

export default PostCreate;