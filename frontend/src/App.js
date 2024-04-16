import Navigation from "./components/Navigation";
import Home from "./components/Home";
import { Routes, Route } from 'react-router-dom';


export default function App() {
  return (
    <>
      <Navigation />
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>

      </div>
    </>
  );
}



