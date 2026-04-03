import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeLanguageProvider } from './context/ThemeLanguageContext';
import Navbar from './components/Navbar/Navbar';
import Home from './pages/Home';
import Items from './pages/Items';
import Favorites from './pages/Favorites';
import Compare from './pages/Compare';

function App() {
  return (
    <ThemeLanguageProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/"          element={<Home />} />
          <Route path="/items"     element={<Items />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/compare"   element={<Compare />} />
        </Routes>
      </Router>
    </ThemeLanguageProvider>
  );
}

export default App;