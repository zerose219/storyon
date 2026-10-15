import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "../services/auth";
import "./Signup.css";

function Signup() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (password !== confirmPassword) {
      setMessage("비밀번호가 일치하지 않습니다.");
      return;
    }

    setIsLoading(true);

    try {
      await signup({
        nickname,
        email,
        password,
      });

      navigate("/login", { replace: true });
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "회원가입 중 오류가 발생했습니다.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="signup-page">
      <section className="signup-card">
        <Link className="signup-logo" to="/login">
          StoryOn
        </Link>

        <h1>회원가입</h1>
        <p className="signup-description">
          당신의 이야기를 기록하고 공유해 보세요.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="nickname">닉네임</label>
          <input
            id="nickname"
            type="text"
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
            minLength={2}
            maxLength={50}
            autoComplete="nickname"
            required
          />

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
            minLength={8}
            maxLength={128}
            autoComplete="new-password"
            required
          />

          <label htmlFor="confirm-password">비밀번호 확인</label>
          <input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(event) =>
              setConfirmPassword(event.target.value)
            }
            autoComplete="new-password"
            required
          />

          <button type="submit" disabled={isLoading}>
            {isLoading ? "가입 처리 중..." : "회원가입"}
          </button>
        </form>

        {message && (
          <p className="signup-message" role="status">
            {message}
          </p>
        )}
      </section>
    </main>
  );
}

export default Signup;