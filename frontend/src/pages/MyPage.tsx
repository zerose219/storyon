
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyInfo, logout } from "../services/auth";
import { getMyPosts, type Post } from "../services/posts";

type UserInfo = {
  user_id: number;
  nickname: string;
  email: string;
};

function MyPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [error, setError] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState("");
  const navigate = useNavigate();
  

  
  useEffect(() => {
    getMyInfo()
      .then((data: UserInfo) => {
        setUser(data);
      })
      .catch(() => {
        navigate("/login", { replace: true });
      });
  }, [navigate]);


  useEffect(() => {
  async function fetchMyPosts() {
    try {
      const data = await getMyPosts();
      setPosts(data);
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


  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  if (error) {
    return (
      <main>
        <p>{error}</p>
        <button onClick={handleLogout}>로그인 화면으로</button>
      </main>
    );
  }

  if (!user) {
    return <p>사용자 정보를 불러오는 중...</p>;
  }

  return (
    <main>
      <h1>마이페이지</h1>
      <p>사용자 ID: {user.user_id}</p>
      <p>닉네임: {user.nickname}</p>
      <p>이메일: {user.email}</p>
      <button onClick={handleLogout}>로그아웃</button>

      <section>
        <h2>내 게시글</h2>

        {postsLoading && <p>게시글을 불러오는 중입니다...</p>}

        {postsError && <p>{postsError}</p>}

        {!postsLoading && !postsError && posts.length === 0 && (
          <p>작성한 게시글이 없습니다.</p>
        )}

        {!postsLoading && !postsError && posts.length > 0 && (
          <ul>
            {posts.map((post) => (
              <li key={post.post_id}>
                <h3>
                  <button
                    type="button"
                    onClick={() => navigate(`/posts/${post.post_id}`)}
                  >
                    {post.title}
                  </button>
                </h3>

                <p>
                  상태: {post.status === "DRAFT" ? "임시저장" : "게시됨"}
                </p>

                <p>
                  공개 설정: {post.visibility === "PUBLIC" ? "공개" : "비공개"}
                </p>

                <p>
                  작성일: {new Date(post.created_at).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
    
  );
}

export default MyPage;
