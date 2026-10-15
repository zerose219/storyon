
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import MyPage from "./pages/MyPage";
import Posts from "./pages/Posts";
import ProtectedRoute from "./components/ProtectedRoute";
import ProtectedLayout from "./components/ProtectedLayout";
import GuestRoute from "./components/GuestRoute";
import PostCreate from "./pages/PostCreate";
import PostDetail from "./pages/PostDetail";
import PostEdit from "./pages/PostEdit";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<ProtectedLayout />}>
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/posts" element={<Posts />} />
            <Route path="/posts/new" element={<PostCreate />} />
            <Route path="/posts/:postId" element={<PostDetail />} />
            <Route path="/posts/:postId/edit" element={<PostEdit />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
