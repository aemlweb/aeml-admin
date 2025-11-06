import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./AuthContext";
import "./App.css";

// Auth
import Login from "./Login/Login";

// Dashboard
import Dashboard from "./Admin/Dashboard/Dashboard";

// Articles
import Articles from "./Admin/Article/ListArticle";
import Add from "./Admin/Article/NewArticle";
import View from "./Admin/Article/DetailArticle";
import UpdateArticle from "./Admin/Article/UpdateArticle";

// Publications
import Publications from "./Admin/Publications/ListPublications";
import NewPublication from "./Admin/Publications/NewPublication";

// Questions
import Questions from "./Admin/Questions/Questions";
import DetailQuestion from "./Admin/Questions/DetailQuestion";
import NewQuestion from "./Admin/Questions/NewQuestion";
import UpdateQuestion from "./Admin/Questions/UpdateQuestion";

// Misc
import NotFound from "./layouts/PageNotFound";

function App() {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <HashRouter>
      <Routes>
        {/* Login */}
        <Route
          path="/Login"
          element={
            isAuthenticated ? (
              <Navigate to="/Admin/Articles" replace />
            ) : (
              <Login />
            )
          }
        />

        {isAuthenticated ? (
          <>
            {/* Dashboard */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/Admin" element={<Dashboard />} />

            {/* Articles */}
            <Route
              path="/Admin/Articles"
              element={<Articles initialType="article" title="Articles" />}
            />
            <Route path="/Admin/Articles/New" element={<Add />} />
            <Route
              path="/Admin/Articles/Update/:id"
              element={<UpdateArticle />}
            />
            <Route path="/Admin/Articles/:id" element={<View />} />

            {/* Publications */}
            <Route path="/Admin/Publications" element={<Publications />} />
            <Route
              path="/Admin/Publications/New"
              element={<NewPublication />}
            />

            {/* Questions */}
            <Route
              path="/Admin/Questions"
              element={<Questions initialType="question" title="Questions" />}
            />
            <Route path="/Admin/Questions/New" element={<NewQuestion />} />
            <Route
              path="/Admin/Questions/Update/:id"
              element={<UpdateQuestion />}
            />
            <Route path="/Admin/Questions/:id" element={<DetailQuestion />} />
          </>
        ) : (
          <Route path="*" element={<Navigate to="/Login" replace />} />
        )}

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
