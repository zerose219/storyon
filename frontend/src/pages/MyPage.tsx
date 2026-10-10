
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyInfo, logout } from "../services/auth";

type UserInfo = {
  user_id: number;
  nickname: string;
  email: string;
};

function MyPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [error, setError] = useState("");
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
    </main>
  );
}

export default MyPage;
