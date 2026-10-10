import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  createPost,
  type PostCreateRequest,
} from "../services/posts";

function PostCreate() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] =
    useState<"DRAFT" | "PUBLISHED">("PUBLISHED");
  const [visibility, setVisibility] =
    useState<"PUBLIC" | "PRIVATE">("PUBLIC");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const parsedCategoryId = Number(categoryId);

    if (!Number.isInteger(parsedCategoryId) || parsedCategoryId <= 0) {
      setError("올바른 카테고리 ID를 입력해 주세요.");
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

        <div>
          <label htmlFor="categoryId">카테고리 ID</label>
          <input
            id="categoryId"
            type="number"
            min="1"
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            required
          />
        </div>

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

        {error && <p>{error}</p>}

        <button type="submit" disabled={submitting}>
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