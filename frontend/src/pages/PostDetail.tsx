import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getPost,
  deletePost,
  type Post,
} from "../services/posts";
import { getMyInfo } from "../services/auth";
import {
  getCategories,
  type Category,
} from "../services/categories";

function PostDetail() {
  const { postId } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState<Post | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  // 게시글 및 카테고리 조회
  useEffect(() => {
    async function fetchPost() {
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

    fetchPost();
  }, [postId]);

  // 로그인한 사용자 정보 조회
  useEffect(() => {
    async function fetchMyInfo() {
      try {
        const user = await getMyInfo();
        setCurrentUserId(user.user_id);
      } catch {
        setCurrentUserId(null);
      }
    }

    fetchMyInfo();
  }, []);

  // 게시글 삭제
  async function handleDelete() {
    if (!post) {
      return;
    }

    const confirmed = window.confirm(
      "정말 이 게시글을 삭제하시겠습니까?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      setError("");

      await deletePost(post.post_id);

      navigate("/posts");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "게시글 삭제에 실패했습니다."
      );
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return <p>게시글을 불러오는 중입니다...</p>;
  }

  if (error && !post) {
    return (
      <div>
        <p>{error}</p>
        <button
          type="button"
          onClick={() => navigate("/posts")}
        >
          목록으로
        </button>
      </div>
    );
  }

  if (!post) {
    return <p>게시글이 없습니다.</p>;
  }

  // 카테고리 ID에 해당하는 이름 찾기
  const category = categories.find(
    (item) => item.category_id === post.category_id
  );

  return (
    <div>
      <h1>{post.title}</h1>

      <p>작성자 ID: {post.user_id}</p>
      <p>
        카테고리: {category?.category_name ?? "미분류"}
      </p>

      <p>
        상태: {post.status === "DRAFT" ? "임시저장" : "게시됨"}
      </p>

      <p>
        공개 설정:{" "}
        {post.visibility === "PUBLIC" ? "공개" : "비공개"}
      </p>

      <p>
        작성일: {new Date(post.created_at).toLocaleString()}
      </p>

      <hr />

      <div style={{ whiteSpace: "pre-wrap" }}>
        {post.content}
      </div>

      {error && <p role="alert">{error}</p>}

      <div>
        {currentUserId === post.user_id && (
          <>
            <button
              type="button"
              onClick={() =>
                navigate(`/posts/${post.post_id}/edit`)
              }
            >
              수정
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "삭제 중..." : "삭제"}
            </button>
          </>
        )}

        <button
          type="button"
          onClick={() => navigate("/posts")}
        >
          목록으로
        </button>
      </div>
    </div>
  );
}

export default PostDetail;