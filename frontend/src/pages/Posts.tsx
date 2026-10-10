
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getPosts,
  searchPosts,
  type Post,
} from "../services/posts";
import { logout } from "../services/auth";

function Posts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [keyword, setKeyword] = useState("");

  const navigate = useNavigate();

  // 전체 게시글 조회
  const loadPosts = async () => {
    setLoading(true);
    setError("");

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
  };

  // 게시글 제목 검색
  const handleSearch = async () => {
    if (!keyword.trim()) {
      await loadPosts();
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await searchPosts(keyword.trim());
      setPosts(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "게시글 검색에 실패했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  // 로그아웃
  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  // 페이지 진입 시 전체 게시글 조회
  useEffect(() => {
    loadPosts();
  }, []);

  if (loading) {
    return <p>게시글을 불러오는 중입니다...</p>;
  }

  if (error) {
    return (
      <div>
        <p>{error}</p>
        <button type="button" onClick={loadPosts}>
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* 상단 메뉴 */}
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

      {/* 게시글 검색 */}
      <div>
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
          placeholder="게시글 제목 검색"
        />

        <button
          type="button"
          onClick={handleSearch}
        >
          검색
        </button>

        <button
          type="button"
          onClick={() => {
            setKeyword("");
            loadPosts();
          }}
        >
          전체 목록
        </button>
      </div>

      {/* 게시글 목록 */}
      {posts.length === 0 ? (
        <p>검색 결과 또는 등록된 게시글이 없습니다.</p>
      ) : (
        <ul>
          {posts.map((post) => (
            <li key={post.post_id}>
              <h2>
                <button
                  type="button"
                  onClick={() =>
                    navigate(`/posts/${post.post_id}`)
                  }
                >
                  {post.title}
                </button>
              </h2>

              <p>{post.content}</p>
              <p>카테고리 ID: {post.category_id}</p>
              <p>작성자 ID: {post.user_id}</p>
              <p>
                작성일:{" "}
                {new Date(post.created_at).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Posts;
