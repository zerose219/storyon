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
import {
  getComments,
  createComment,
  updateComment,
  deleteComment,
  type Comment,
} from "../services/comments";
import {
  getPostLikes,
  createPostLike,
  deletePostLike,
  type PostLikeInfo,
} from "../services/postLikes";

function PostDetail() {
  const { postId } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState<Post | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [likeInfo, setLikeInfo] = useState<PostLikeInfo | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const [commentContent, setCommentContent] = useState("");
  const [commentVisibility, setCommentVisibility] =
    useState<"PUBLIC" | "PRIVATE">("PUBLIC");

  const [submittingComment, setSubmittingComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(
    null
  );
  const [editingContent, setEditingContent] = useState("");
  const [editingVisibility, setEditingVisibility] =
    useState<"PUBLIC" | "PRIVATE">("PUBLIC");

  const [commentError, setCommentError] = useState("");
  const [likeError, setLikeError] = useState("");
  const [liking, setLiking] = useState(false);

  const id = Number(postId);

  // 게시글, 카테고리, 댓글, 좋아요 정보 조회
  useEffect(() => {
    async function fetchPageData() {
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

        const [commentData, likeData] = await Promise.all([
          getComments(id),
          getPostLikes(id),
        ]);

        setComments(commentData);
        setLikeInfo(likeData);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "게시글 정보를 불러오지 못했습니다."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchPageData();
  }, [id]);

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
    if (!post) return;

    const confirmed = window.confirm(
      "정말 이 게시글을 삭제하시겠습니까?"
    );

    if (!confirmed) return;

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

  // 댓글 작성
  async function handleCreateComment(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!post) return;

    if (!commentContent.trim()) {
      setCommentError("댓글 내용을 입력해 주세요.");
      return;
    }

    try {
      setSubmittingComment(true);
      setCommentError("");

      await createComment(post.post_id, {
        content: commentContent.trim(),
        is_public: commentVisibility,
      });

      const updatedComments = await getComments(post.post_id);
      setComments(updatedComments);
      setCommentContent("");
      setCommentVisibility("PUBLIC");
    } catch (err) {
      setCommentError(
        err instanceof Error ? err.message : "댓글 작성에 실패했습니다."
      );
    } finally {
      setSubmittingComment(false);
    }
  }

  // 댓글 수정 시작
  function startEditingComment(comment: Comment) {
    setEditingCommentId(comment.comment_id);
    setEditingContent(comment.content);
    setEditingVisibility(comment.is_public);
    setCommentError("");
  }

  // 댓글 수정 취소
  function cancelEditingComment() {
    setEditingCommentId(null);
    setEditingContent("");
    setEditingVisibility("PUBLIC");
  }

  // 댓글 수정 저장
  async function handleUpdateComment(commentId: number) {
    if (!post) return;

    if (!editingContent.trim()) {
      setCommentError("댓글 내용을 입력해 주세요.");
      return;
    }

    try {
      setCommentError("");

      await updateComment(post.post_id, commentId, {
        content: editingContent.trim(),
        is_public: editingVisibility,
      });

      const updatedComments = await getComments(post.post_id);
      setComments(updatedComments);
      cancelEditingComment();
    } catch (err) {
      setCommentError(
        err instanceof Error ? err.message : "댓글 수정에 실패했습니다."
      );
    }
  }

  // 댓글 삭제
  async function handleDeleteComment(commentId: number) {
    if (!post) return;

    const confirmed = window.confirm("이 댓글을 삭제하시겠습니까?");
    if (!confirmed) return;

    try {
      setCommentError("");

      await deleteComment(post.post_id, commentId);

      setComments((previous) =>
        previous.filter((comment) => comment.comment_id !== commentId)
      );
    } catch (err) {
      setCommentError(
        err instanceof Error ? err.message : "댓글 삭제에 실패했습니다."
      );
    }
  }

  // 좋아요 등록 또는 취소
  async function handleToggleLike() {
    if (!post || !likeInfo || liking) return;

    try {
      setLiking(true);
      setLikeError("");

      if (likeInfo.liked) {
        await deletePostLike(post.post_id);
      } else {
        await createPostLike(post.post_id);
      }

      const updatedLikeInfo = await getPostLikes(post.post_id);
      setLikeInfo(updatedLikeInfo);
    } catch (err) {
      setLikeError(
        err instanceof Error ? err.message : "좋아요 처리에 실패했습니다."
      );
    } finally {
      setLiking(false);
    }
  }

  if (loading) {
    return <p>게시글을 불러오는 중입니다...</p>;
  }

  if (error && !post) {
    return (
      <div>
        <p role="alert">{error}</p>
        <button type="button" onClick={() => navigate("/posts")}>
          목록으로
        </button>
      </div>
    );
  }

  if (!post) {
    return <p>게시글이 없습니다.</p>;
  }

  const category = categories.find(
    (item) => item.category_id === post.category_id
  );

  return (
    <div>
      <h1>{post.title}</h1>

      <p>작성자 ID: {post.user_id}</p>
      <p>카테고리: {category?.category_name ?? "미분류"}</p>
      <p>상태: {post.status === "DRAFT" ? "임시저장" : "게시됨"}</p>
      <p>공개 설정: {post.visibility === "PUBLIC" ? "공개" : "비공개"}</p>
      <p>작성일: {new Date(post.created_at).toLocaleString()}</p>

      <hr />

      <div style={{ whiteSpace: "pre-wrap" }}>{post.content}</div>

      {error && <p role="alert">{error}</p>}

      <div>
        {currentUserId === post.user_id && (
          <>
            <button
              type="button"
              onClick={() => navigate(`/posts/${post.post_id}/edit`)}
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

        <button type="button" onClick={() => navigate("/posts")}>
          목록으로
        </button>
      </div>

      <hr />

      {/* 좋아요 */}
      <section>
        <h2>좋아요</h2>

        {likeInfo && (
          <>
            <button
              type="button"
              onClick={handleToggleLike}
              disabled={liking}
            >
              {liking
                ? "처리 중..."
                : likeInfo.liked
                  ? "♥ 좋아요 취소"
                  : "♡ 좋아요"}
            </button>

            <span> 좋아요 {likeInfo.like_count}개</span>
          </>
        )}

        {likeError && <p role="alert">{likeError}</p>}
      </section>

      <hr />

      {/* 댓글 */}
      <section>
        <h2>댓글 ({comments.length})</h2>

        <form onSubmit={handleCreateComment}>
          <div>
            <label htmlFor="comment-content">댓글 내용</label>
            <br />
            <textarea
              id="comment-content"
              value={commentContent}
              onChange={(event) => setCommentContent(event.target.value)}
              rows={3}
              required
            />
          </div>

          <div>
            <label htmlFor="comment-visibility">공개 설정</label>
            {" "}
            <select
              id="comment-visibility"
              value={commentVisibility}
              onChange={(event) =>
                setCommentVisibility(
                  event.target.value as "PUBLIC" | "PRIVATE"
                )
              }
            >
              <option value="PUBLIC">공개</option>
              <option value="PRIVATE">비공개</option>
            </select>
          </div>

          <button type="submit" disabled={submittingComment}>
            {submittingComment ? "등록 중..." : "댓글 작성"}
          </button>
        </form>

        {commentError && <p role="alert">{commentError}</p>}

        {comments.length === 0 ? (
          <p>아직 댓글이 없습니다.</p>
        ) : (
          <ul>
            {comments.map((comment) => (
              <li key={comment.comment_id}>
                <p>
                  <strong>{comment.nickname}</strong>
                  {" · "}
                  {comment.is_public === "PUBLIC" ? "공개" : "비공개"}
                  {" · "}
                  {new Date(comment.created_at).toLocaleString()}
                </p>

                {editingCommentId === comment.comment_id ? (
                  <div>
                    <textarea
                      value={editingContent}
                      onChange={(event) =>
                        setEditingContent(event.target.value)
                      }
                      rows={3}
                    />

                    <div>
                      <label>공개 설정 </label>
                      <select
                        value={editingVisibility}
                        onChange={(event) =>
                          setEditingVisibility(
                            event.target.value as "PUBLIC" | "PRIVATE"
                          )
                        }
                      >
                        <option value="PUBLIC">공개</option>
                        <option value="PRIVATE">비공개</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleUpdateComment(comment.comment_id)}
                    >
                      저장
                    </button>

                    <button type="button" onClick={cancelEditingComment}>
                      취소
                    </button>
                  </div>
                ) : (
                  <p style={{ whiteSpace: "pre-wrap" }}>{comment.content}</p>
                )}

                {currentUserId === comment.user_id && (
                  <div>
                    {editingCommentId !== comment.comment_id && (
                      <button
                        type="button"
                        onClick={() => startEditingComment(comment)}
                      >
                        댓글 수정
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDeleteComment(comment.comment_id)}
                    >
                      댓글 삭제
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default PostDetail;
