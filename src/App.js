import './App.css';
import { Route, Routes } from 'react-router-dom';
import Inquiry from "./components/inquiry/Inquiry";
import Navbar from "./global/Navbar";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path='/inquiries' element={<Inquiry />} />
      </Routes>
    </>
  );
}

export default App;
