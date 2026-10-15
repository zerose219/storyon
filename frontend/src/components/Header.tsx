import { useNavigate } from "react-router-dom";
import { logout } from "../services/auth";
import "./Header.css";

function Header() {
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <button
          type="button"
          className="site-logo"
          onClick={() => navigate("/posts")}
        >
          StoryOn
        </button>

        <nav className="site-nav" aria-label="주 메뉴">
          <button
            type="button"
            onClick={() => navigate("/posts")}
          >
            게시글
          </button>

          <button
            type="button"
            onClick={() => navigate("/posts/new")}
          >
            글 작성
          </button>

          <button
            type="button"
            onClick={() => navigate("/mypage")}
          >
            마이페이지
          </button>

          <button
            type="button"
            className="site-nav__logout"
            onClick={handleLogout}
          >
            로그아웃
          </button>
        </nav>
      </div>
    </header>
  );
}

export default Header;
