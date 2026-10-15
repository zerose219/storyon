import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { login } from "../services/auth";
import "./Login.css";

function Login() {
  const location = useLocation();
  const navigationMessage =
    (location.state as { message?: string } | null)?.message;
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsLoading(true);

    try {
      await login({
        email,
        password,
      });

      navigate("/posts", { replace: true });
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "로그인 중 오류가 발생했습니다.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <Link className="login-logo" to="/posts">
          StoryOn
        </Link>

        <h1>로그인</h1>
        <p className="login-description">
          다시 돌아오신 것을 환영합니다.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="email">이메일</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />

          <label htmlFor="password">비밀번호</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />

          <button type="submit" disabled={isLoading}>
            {isLoading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        {(message || navigationMessage) && (
          <p className="login-message" role="status">
            {message || navigationMessage}
          </p>
        )}

        <p className="login-signup-link">
          아직 회원이 아니신가요?{" "}
          <Link to="/signup">회원가입</Link>
        </p>
      </section>
    </main>
  );
}

export default Login;