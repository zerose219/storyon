import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Header from "./Header";

function ProtectedLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    function handleAuthExpired() {
      navigate("/login", {
        replace: true,
        state: {
          message: "로그인이 만료되었습니다. 다시 로그인해 주세요.",
        },
      });
    }

    window.addEventListener("auth:expired", handleAuthExpired);

    return () => {
      window.removeEventListener("auth:expired", handleAuthExpired);
    };
  }, [navigate]);

  return (
    <>
      <Header />
      <Outlet />
    </>
  );
}

export default ProtectedLayout;
