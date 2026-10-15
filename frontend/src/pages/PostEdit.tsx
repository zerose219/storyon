import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getPost,
  updatePost,
  type Post,
} from "../services/posts";
import {
  getCategories,
  type Category,
} from "../services/categories";
import "../styles/common.css";
import "./PostEdit.css";

function PostEdit() {
  const { postId } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState<Post | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] =
    useState<"DRAFT" | "PUBLISHED">("PUBLISHED");
  const [visibility, setVisibility] =
    useState<"PUBLIC" | "PRIVATE">("PUBLIC");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // 게시글과 카테고리 목록 조회
  useEffect(() => {
    async function fetchData() {
      const id = Number(postId);

      if (!Number.isInteger(id) || id <= 0) {
        setError("올바르지 않은 게시글 ID입니다.");
        setLoading(false);
        return;
      }

      try {
        const [postData, categoryData] = await Promise.all([
          getPost(id),
          getCategories(),
        ]);

        setPost(postData);
        setCategories(categoryData);

        setTitle(postData.title);
        setContent(postData.content);
        setCategoryId(String(postData.category_id));
        setStatus(postData.status);
        setVisibility(postData.visibility);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "게시글 또는 카테고리를 불러오지 못했습니다."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [postId]);

  // 게시글 수정
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!post) {
      setError("수정할 게시글이 없습니다.");
      return;
    }

    const parsedCategoryId = Number(categoryId);

    if (
      !Number.isInteger(parsedCategoryId) ||
      parsedCategoryId <= 0
    ) {
      setError("카테고리를 선택해 주세요.");
      return;
    }

    try {
      setSubmitting(true);

      await updatePost(post.post_id, {
        title,
        content,
        category_id: parsedCategoryId,
        status,
        visibility,
      });

      navigate(`/posts/${post.post_id}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "게시글 수정에 실패했습니다."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="page-container">
        <section className="card status-message-empty">
          게시글을 불러오는 중입니다...
        </section>
      </main>
    );
  }

  if (error && !post) {
    return (
      <main className="page-container">
        <section className="card">
          <p
            role="alert"
            className="status-message status-message-error"
          >
            {error}
          </p>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => navigate("/posts")}
        >
          목록으로
        </button>
        </section>
      </main>
    );
  }

  if (!post) {
    return (
      <main className="page-container">
        <section className="card status-message-empty">
          게시글이 없습니다.
        </section>
      </main>
    );
  }

  return (
    <main className="page-container post-edit-page">
      <section className="page-heading">
        <div>
          <h1>게시글 수정</h1>
          <p className="page-description">
            작성한 내용을 수정하고 변경 사항을 저장하세요.
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
            placeholder="게시글 내용을 입력하세요."
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
              disabled={categories.length === 0}
            >
              <option value="">카테고리를 선택하세요</option>

              {categories.map((category) => (
                <option
                  key={category.category_id}
                  value={String(category.category_id)}
                >
                  {category.category_name}
                </option>
              ))}
            </select>

            {categories.length === 0 && (
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
            disabled={submitting || categories.length === 0}
          >
            {submitting ? "저장 중..." : "수정 완료"}
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate(`/posts/${post.post_id}`)}
          >
            취소
          </button>
        </div>
      </form>
    </main>
  );
}

export default PostEdit;