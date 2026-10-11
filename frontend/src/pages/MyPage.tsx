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
    return <p>사용자 정보를 불러오는 중...</p>;
  }

  if (userError || !user) {
    return (
      <main>
        <p>{userError || "사용자 정보를 불러오지 못했습니다."}</p>
        <button
          type="button"
          onClick={handleLogout}
        >
          로그인 화면으로
        </button>
      </main>
    );
  }

  return (
    <main>
      <h1>마이페이지</h1>

      <section>
        <h2>내 정보</h2>
        <p>사용자 ID: {user.user_id}</p>
        <p>닉네임: {user.nickname}</p>
        <p>이메일: {user.email}</p>

        <button
          type="button"
          onClick={handleLogout}
        >
          로그아웃
        </button>

        <button
          type="button"
          onClick={() => navigate("/posts")}
        >
          게시글 목록으로
        </button>
      </section>

      <section>
        <h2>내 게시글</h2>

        {postsLoading && (
          <p>게시글을 불러오는 중입니다...</p>
        )}

        {postsError && (
          <div>
            <p role="alert">{postsError}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
            >
              다시 시도
            </button>
          </div>
        )}

        {!postsLoading &&
          !postsError &&
          posts.length === 0 && (
            <p>작성한 게시글이 없습니다.</p>
          )}

        {!postsLoading &&
          !postsError &&
          posts.length > 0 && (
            <ul>
              {posts.map((post) => {
                const category = categories.find(
                  (item) =>
                    item.category_id === post.category_id
                );

                return (
                  <li key={post.post_id}>
                    <h3>
                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/posts/${post.post_id}`)
                        }
                      >
                        {post.title}
                      </button>
                    </h3>

                    <p>
                      카테고리:{" "}
                      {category?.category_name ?? "미분류"}
                    </p>

                    <p>
                      상태:{" "}
                      {post.status === "DRAFT"
                        ? "임시저장"
                        : "게시됨"}
                    </p>

                    <p>
                      공개 설정:{" "}
                      {post.visibility === "PUBLIC"
                        ? "공개"
                        : "비공개"}
                    </p>

                    <p>
                      작성일:{" "}
                      {new Date(
                        post.created_at
                      ).toLocaleString()}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
      </section>
    </main>
  );
}

export default MyPage;