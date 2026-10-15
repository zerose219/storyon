import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyInfo, logout } from "../services/auth";
import {
  getMyPosts,
  type Post,
} from "../services/posts";
import {
  getCategories,
  type Category,
} from "../services/categories";
import "../styles/common.css";
import "./MyPage.css";

type UserInfo = {
  user_id: number;
  nickname: string;
  email: string;
};

function MyPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [userLoading, setUserLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [userError, setUserError] = useState("");
  const [postsError, setPostsError] = useState("");

  const navigate = useNavigate();

  // 사용자 정보 조회
  useEffect(() => {
    async function fetchUser() {
      try {
        const data = await getMyInfo();
        setUser(data);
      } catch (err) {
        setUserError(
          err instanceof Error
            ? err.message
            : "사용자 정보를 불러오지 못했습니다."
        );
      } finally {
        setUserLoading(false);
      }
    }

    fetchUser();
  }, []);

  // 내 게시글 및 카테고리 조회
  useEffect(() => {
    async function fetchMyPosts() {
      try {
        const [postsData, categoriesData] = await Promise.all([
          getMyPosts(),
          getCategories(),
        ]);

        setPosts(postsData);
        setCategories(categoriesData);
      } catch (err) {
        setPostsError(
          err instanceof Error
            ? err.message
            : "내 게시글을 불러오지 못했습니다."
        );
      } finally {
        setPostsLoading(false);
      }
    }

    fetchMyPosts();
  }, []);

  // 로그아웃
  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  if (userLoading) {
    return (
      <main className="page-container">
        <section className="card status-message-empty">
          사용자 정보를 불러오는 중...
        </section>
      </main>
    );
  }

  if (userError || !user) {
    return (
      <main className="page-container">
        <section className="card">
          <p className="status-message status-message-error" role="alert">
            {userError || "사용자 정보를 불러오지 못했습니다."}
          </p>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleLogout}
          >
            로그인 화면으로
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="page-container mypage">
      <section className="page-heading">
        <div>
          <h1>마이페이지</h1>
          <p className="page-description">
            내 계정 정보와 작성한 게시글을 관리하세요.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate("/posts")}
        >
          게시글 목록으로
        </button>
      </section>

      <section className="card mypage-profile">
        <div className="mypage-section-heading">
          <div>
            <h2>내 정보</h2>
            <p>현재 로그인한 계정 정보입니다.</p>
          </div>
        </div>

        <div className="mypage-info-list">
          <div className="mypage-info-item">
            <span>사용자 ID</span>
            <strong>{user.user_id}</strong>
          </div>

          <div className="mypage-info-item">
            <span>닉네임</span>
            <strong>{user.nickname}</strong>
          </div>

          <div className="mypage-info-item">
            <span>이메일</span>
            <strong>{user.email}</strong>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate("/posts")}
          >
            게시글 목록
          </button>

          <button
            type="button"
            className="btn btn-danger"
            onClick={handleLogout}
          >
            로그아웃
          </button>
        </div>
      </section>

      <section className="mypage-posts-section">
        <div className="mypage-section-heading">
          <div>
            <h2>내 게시글</h2>
            <p>내가 작성한 게시글을 확인하세요.</p>
          </div>

          {!postsLoading && !postsError && (
            <span className="mypage-post-count">
              {posts.length}개
            </span>
          )}
        </div>

        {postsLoading && (
          <div className="card status-message-empty">
            게시글을 불러오는 중입니다...
          </div>
        )}

        {postsError && (
          <div className="card">
            <p
              role="alert"
              className="status-message status-message-error"
            >
              {postsError}
            </p>

            <button
              type="button"
              className="btn btn-primary"
              onClick={() => window.location.reload()}
            >
              다시 시도
            </button>
          </div>
        )}

        {!postsLoading &&
          !postsError &&
          posts.length === 0 && (
            <div className="card status-message-empty">
              작성한 게시글이 없습니다.
              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => navigate("/posts/new")}
                >
                  첫 게시글 작성하기
                </button>
              </div>
            </div>
          )}

        {!postsLoading &&
          !postsError &&
          posts.length > 0 && (
            <div className="mypage-post-list">
              {posts.map((post) => {
                const category = categories.find(
                  (item) =>
                    item.category_id === post.category_id
                );

                return (
                  <article
                    className="card mypage-post-card"
                    key={post.post_id}
                  >
                    <div className="mypage-post-meta">
                      <span className="post-category">
                        {category?.category_name ?? "미분류"}
                      </span>

                      <span
                        className={`post-status ${
                          post.status === "DRAFT"
                            ? "post-status-draft"
                            : "post-status-published"
                        }`}
                      >
                        {post.status === "DRAFT"
                          ? "임시저장"
                          : "게시됨"}
                      </span>

                      <span className="post-visibility">
                        {post.visibility === "PUBLIC"
                          ? "공개"
                          : "비공개"}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="mypage-post-title"
                      onClick={() =>
                        navigate(`/posts/${post.post_id}`)
                      }
                    >
                      {post.title}
                    </button>

                    <div className="mypage-post-footer">
                      <span>
                        작성일:{" "}
                        {new Date(
                          post.created_at
                        ).toLocaleString()}
                      </span>

                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() =>
                          navigate(`/posts/${post.post_id}`)
                        }
                      >
                        자세히 보기 →
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
      </section>
    </main>
  );
}

export default MyPage;