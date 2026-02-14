import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../app/router/paths";

export function AuthSignupCompletePage() {
  const navigate = useNavigate();

  return (
    <div style={{ display: "grid", gap: "12px" }}>
      <h1 style={{ margin: 0 }}>가입 완료</h1>
      <p style={{ margin: 0, color: "#334155" }}>가입이 정상적으로 완료되었습니다.</p>
      <button type="button" onClick={() => navigate(ROUTE_PATHS.home, { replace: true })}>
        홈으로 이동
      </button>
      <button type="button" onClick={() => navigate(ROUTE_PATHS.authLogin, { replace: true })}>
        로그인 페이지로 이동
      </button>
    </div>
  );
}
