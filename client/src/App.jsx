import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./Components/LoginPage/LoginPage";
import HomePage from "./Components/HomePage/HomePage";
import SignUpPage from "./Components/SignUpPage/SignUpPage";
import AdminPage from "./Components/AdminPage/AdminPage";
import LibrarianPage from "./Components/LibrarianPage/LibrarianPage";
import UserPage from "./Components/UserPage/UserPage";

function App() {
  return (
    <>
      <BrowserRouter>
        {/* Add routes here */}
        <Routes>
          <Route path="/" element={<HomePage></HomePage>}></Route>
          <Route path="/login" element={<LoginPage></LoginPage>}></Route>
          <Route path="/signUp" element={<SignUpPage></SignUpPage>}></Route>
          <Route path="/admin" element={<AdminPage></AdminPage>}></Route>
          <Route path="/librarian" element={<LibrarianPage></LibrarianPage>}></Route>
          <Route path="/user" element={<UserPage></UserPage>}></Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
