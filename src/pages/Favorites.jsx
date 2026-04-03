import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useThemeLang } from '../context/ThemeLanguageContext';
import './Favorites.css';

const getFavorites = () => {
  try { return JSON.parse(localStorage.getItem('pokeFavorites') || '[]'); }
  catch { return []; }
};

const Favorites = () => {
  const { t } = useThemeLang();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    setFavorites(getFavorites());
  }, []);

  const removeFavorite = (id) => {
    const updated = favorites.filter(f => f.id !== id);
    localStorage.setItem('pokeFavorites', JSON.stringify(updated));
    setFavorites(updated);
  };

  const goToPokemon = (name) => {
    navigate(`/?pokemon=${name}`);
  };

  return (
    <div className="favorites-page">
      <h2 className="favorites-title">{t.favoritesTitle}</h2>

      {favorites.length === 0 ? (
        <div className="favorites-empty">{t.favoritesEmpty}</div>
      ) : (
        <div className="favorites-grid">
          {favorites.map(fav => (
            <div key={fav.id} className="fav-card" onClick={() => goToPokemon(fav.name)}>
              <button
                className="fav-remove"
                onClick={e => { e.stopPropagation(); removeFavorite(fav.id); }}
                title={t.removeFavorite}
              >✕</button>
              <div className="fav-img-box">
                <img src={fav.sprite} alt={fav.name} className="fav-img" />
              </div>
              <div className="fav-info">
                <p className="fav-id">#{String(fav.id).padStart(3, '0')}</p>
                <h3 className="fav-name">{fav.name}</h3>
                <div className="fav-types">
                  {fav.types.map(type => (
                    <span key={type} className={`type-badge type-${type}`}>{type}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;