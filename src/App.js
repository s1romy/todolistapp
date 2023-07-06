import "./App.css";
import Todo from "./Todo";

function App({ theme }) {
  return (
    <div>
      <div>
        <Todo theme={theme} />
      </div>
    </div>
  );
}

export default App;
