import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getPosts,
  searchPosts,
  type Post,
} from "../services/posts";
import {
  getCategories,
  type Category,
} from "../services/categories";
import "../styles/common.css";
import "./Posts.css";

function Posts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [keyword, setKeyword] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] =
    useState("all");

  const navigate = useNavigate();

  // 게시글 및 카테고리 목록 조회
  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [postsData, categoriesData] = await Promise.all([
        getPosts(),
        getCategories(),
      ]);

      setPosts(postsData);
      setCategories(categoriesData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "게시글 또는 카테고리를 불러오지 못했습니다."
      );
    } finally {
      setLoading(false);
    }
  }, []);

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

  // 카테고리별 게시글 필터링
  const filteredPosts =
    selectedCategoryId === "all"
      ? posts
      : posts.filter(
          (post) =>
            String(post.category_id) === selectedCategoryId
        );

  // 페이지 진입 시 데이터 조회
  useEffect(() => {
    void Promise.resolve().then(loadPosts);
  }, [loadPosts]);

  if (loading) {
    return (
      <main className="page-container">
        <section className="card status-message-empty">
          게시글을 불러오는 중입니다...
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="page-container">
        <section className="card">
          <p className="status-message status-message-error">
            {error}
          </p>

          <button
            type="button"
            className="btn btn-primary"
            onClick={loadPosts}
          >
            다시 시도
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="page-container">
      <section className="page-heading">
        <div>
          <h1>게시글</h1>
          <p className="page-description">
            개발하며 배운 내용을 기록하고 공유해 보세요.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => navigate("/posts/new")}
        >
          + 새 게시글 작성
        </button>
      </section>

      <section className="card">
        <div className="form-group">
          <label htmlFor="post-search">게시글 검색</label>

          <div className="posts-search">
            <input
              id="post-search"
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
              placeholder="게시글 제목을 검색하세요"
            />

            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSearch}
            >
              검색
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setKeyword("");
                setSelectedCategoryId("all");
                loadPosts();
              }}
            >
              전체 목록
            </button>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="category-filter">카테고리</label>

          <select
            id="category-filter"
            value={selectedCategoryId}
            onChange={(e) =>
              setSelectedCategoryId(e.target.value)
            }
          >
            <option value="all">전체 카테고리</option>

            {categories.map((category) => (
              <option
                key={category.category_id}
                value={String(category.category_id)}
              >
                {category.category_name}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="posts-list-section">
        <div className="posts-list-heading">
          <h2>전체 게시글</h2>
          <span>{filteredPosts.length}개</span>
        </div>

        {filteredPosts.length === 0 ? (
          <div className="card status-message-empty">
            해당하는 게시글이 없습니다.
          </div>
        ) : (
          <div className="posts-list">
            {filteredPosts.map((post) => {
              const category = categories.find(
                (item) =>
                  item.category_id === post.category_id
              );

              return (
                <article
                  className="card post-card"
                  key={post.post_id}
                >
                  <div className="post-card__top">
                    <span className="post-category">
                      {category?.category_name ?? "미분류"}
                    </span>

                    <span className="post-date">
                      {new Date(
                        post.created_at
                      ).toLocaleString()}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="post-title"
                    onClick={() =>
                      navigate(`/posts/${post.post_id}`)
                    }
                  >
                    {post.title}
                  </button>

                  <p className="post-content">
                    {post.content}
                  </p>

                  <div className="post-card__footer">
                    <span>작성자 ID: {post.user_id}</span>

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

export default Posts;