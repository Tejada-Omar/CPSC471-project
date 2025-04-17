import { useState } from "react";

const HomePage = () => {
  const [count, setCount] = useState(0);

  return (
    <>
      <h1>This is the home page</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
      </div>
    </>
  );
};

export default HomePage;
