import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getPost,
  updatePost,
  type Post,
} from "../services/posts";

function PostEdit() {
  const { postId } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState<Post | null>(null);
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

  useEffect(() => {
    async function fetchPost() {
      const id = Number(postId);

      if (!Number.isInteger(id) || id <= 0) {
        setError("올바르지 않은 게시글 ID입니다.");
        setLoading(false);
        return;
      }

      try {
        const data = await getPost(id);

        setPost(data);
        setTitle(data.title);
        setContent(data.content);
        setCategoryId(String(data.category_id));
        setStatus(data.status);
        setVisibility(data.visibility);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "게시글을 불러오지 못했습니다."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, [postId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!post) {
      setError("수정할 게시글이 없습니다.");
      return;
    }

    const parsedCategoryId = Number(categoryId);

    if (!Number.isInteger(parsedCategoryId) || parsedCategoryId <= 0) {
      setError("올바른 카테고리 ID를 입력해 주세요.");
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
    return <p>게시글을 불러오는 중입니다...</p>;
  }

  if (error && !post) {
    return (
      <div>
        <p>{error}</p>
        <button onClick={() => navigate("/posts")}>
          목록으로
        </button>
      </div>
    );
  }

  if (!post) {
    return <p>게시글이 없습니다.</p>;
  }

  return (
    <div>
      <h1>게시글 수정</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">제목</label>
          <input
            id="title"
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
          {submitting ? "저장 중..." : "수정 완료"}
        </button>

        <button
          type="button"
          onClick={() => navigate(`/posts/${post.post_id}`)}
        >
          취소
        </button>
      </form>
    </div>
  );
}

export default PostEdit;
