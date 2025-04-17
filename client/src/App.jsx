import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./Components/HomePage/HomePage";

function App() {
  return (
    <>
      <BrowserRouter>
        {/* Add routes here */}
        <Routes>
          <Route path="/" element={<HomePage></HomePage>}></Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
