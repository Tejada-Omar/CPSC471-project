import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./Components/LoginPage/LoginPage";
import HomePage from "./Components/HomePage/HomePage";
import SignUpPage from "./Components/SignUpPage/SignUpPage";

function App() {
  return (
    <>
      <BrowserRouter>
        {/* Add routes here */}
        <Routes>
          <Route path="/" element={<HomePage></HomePage>}></Route>
          <Route path="/login" element={<LoginPage></LoginPage>}></Route>
          <Route path="/signUp" element={<SignUpPage></SignUpPage>}></Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
