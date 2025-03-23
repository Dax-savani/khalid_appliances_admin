import './App.css';
import { Route, Routes } from 'react-router-dom';
import Navbar from "./global/Navbar";
import Inquiry from "./pages/inquiry/Inquiry";
import Slider from "./pages/slider/slider";
import Testimonial from "./pages/testimonial/testimonial";
import Services from "./pages/services/services";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path='/' element={<Inquiry />} />
        <Route path='/slider' element={<Slider />} />
        <Route path='/testimonial' element={<Testimonial />} />
        <Route path='/services' element={<Services />} />
      </Routes>
    </>
  );
}

export default App;
