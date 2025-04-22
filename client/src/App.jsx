import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./Components/LoginPage/LoginPage";
import HomePage from "./Components/HomePage/HomePage";
import SignUpPage from "./Components/SignUpPage/SignUpPage";
import AdminPage from "./Components/AdminPage/AdminPage";
import LibrarianPage from "./Components/LibrarianPage/LibrarianPage";
import UserPage from "./Components/UserPage/UserPage";
import BookPage from "./Components/BookPage/BookPage";
import AddBookPage from "./Components/LibrarianPage/AddBookPage"
import AddAuthorPage from "./Components/LibrarianPage/AddAuthorPage"
import RemoveBooksPage from "./Components/LibrarianPage/RemoveBooksPage"
import AddLibraryPage from "./Components/AdminPage/AddLibraryPage"
import AuthorPage from "./Components/AuthorPage/AuthorPage";

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
          <Route path="/book/:bookId/:authorId" element={<BookPage />} />
          <Route path="/author/:authorId" element={<AuthorPage/>}></Route>
          <Route path="/addBook" element={<AddBookPage></AddBookPage>}></Route>
          <Route path="/addAuthor" element={<AddAuthorPage></AddAuthorPage>}></Route>
          <Route path="/addLibrary" element={<AddLibraryPage></AddLibraryPage>}></Route>
          <Route path="/removeBooks" element={<RemoveBooksPage></RemoveBooksPage>}></Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
