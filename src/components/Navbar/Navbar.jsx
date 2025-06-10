import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="pokemon-navbar">
      <div className="navbar-container">
        <div className="logo-container">
          <Link to="/" className="pokeball-link">
            <div className="pokeball">
              <div className="pokeball-top"></div>
              <div className="pokeball-center"></div>
              <div className="pokeball-bottom"></div>
            </div>
          </Link>
          <span className="app-title">Pokédex</span>
        </div>

        <div className="nav-links">
          <Link to="/" className="nav-link">Pokémons</Link>
          <Link to="/items" className="nav-link">Items</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
