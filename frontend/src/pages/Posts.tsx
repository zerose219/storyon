import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPosts, type Post } from "../services/posts";
import { logout } from "../services/auth";


function Posts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function handleLogout() {
  logout();
  navigate("/login", { replace: true });
}

  useEffect(() => {
    async function fetchPosts() {
      try {
        const data = await getPosts();
        setPosts(data);
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

    fetchPosts();
  }, []);

  if (loading) {
    return <p>게시글을 불러오는 중입니다...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <div>
        <button
          type="button"
          onClick={() => navigate("/posts/new")}
        >
          새 게시글 작성
        </button>

        <button
          type="button"
          onClick={() => navigate("/mypage")}
        >
          마이페이지
        </button>
        <button
          type="button"
          onClick={handleLogout}
        >
          로그아웃
        </button>
      </div>

      {posts.length === 0 ? (
        <p>등록된 게시글이 없습니다.</p>
      ) : (
        <ul>
          {posts.map((post) => (
            <li key={post.post_id}>
              <h2>
                <button
                  type="button"
                  onClick={() => navigate(`/posts/${post.post_id}`)}
                >
                  {post.title}
                </button>
              </h2>
              <p>{post.content}</p>
              <p>카테고리 ID: {post.category_id}</p>
              <p>작성자 ID: {post.user_id}</p>
              <p>작성일: {new Date(post.created_at).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Posts;