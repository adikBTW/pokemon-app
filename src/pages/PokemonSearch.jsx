import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Home.css';

const PokemonSearch = () => {
  const { query } = useParams();
  const navigate = useNavigate();
  const [pokemonData, setPokemonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPokemon = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${query.toLowerCase()}`);
        if (!response.ok) {
          throw new Error('Pokémon not found');
        }
        const data = await response.json();
        setPokemonData(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        setPokemonData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPokemon();
  }, [query]);

  const handleSearch = (e) => {
    e.preventDefault();
    const term = e.target.elements.search.value;
    if (term.trim()) {
      navigate(`/search/${term.trim()}`);
    }
  };

  return (
    <div className="home">
      <div className="search-container">
        <form onSubmit={handleSearch}>
          <input 
            type="text" 
            name="search" 
            placeholder="Search Pokémon..." 
            defaultValue={query}
          />
          <button type="submit">Search</button>
        </form>
      </div>

      {loading && <div className="loading">Loading...</div>}
      {error && <div className="error">Error: {error}</div>}

      {pokemonData && (
        <div className="pokemon-display">
          {}
          <div className="pokemon-card">
            <img 
              src={pokemonData.sprites.other['official-artwork'].front_default || pokemonData.sprites.front_default} 
              alt={pokemonData.name} 
              className="pokemon-sprite" 
            />
            <div className="pokemon-info">
              <h1 className="pokemon-name">{pokemonData.name}</h1>
              <p className="pokemon-id">#{pokemonData.id.toString().padStart(3, '0')}</p>
              
              <div className="pokemon-types">
                {pokemonData.types.map((typeInfo, index) => (
                  <span 
                    key={index} 
                    className={`type-badge type-${typeInfo.type.name}`}
                  >
                    {typeInfo.type.name}
                  </span>
                ))}
              </div>
              
              <div className="pokemon-stats">
                {pokemonData.stats.map((stat, index) => (
                  <div key={index} className="stat-row">
                    <span className="stat-label">{stat.stat.name.replace('-', ' ')}:</span>
                    <span className="stat-value">{stat.base_stat}</span>
                  </div>
                ))}
                <div className="stat-row">
                  <span className="stat-label">weight:</span>
                  <span className="stat-value">{(pokemonData.weight / 10).toFixed(1)} kg</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">height:</span>
                  <span className="stat-value">{(pokemonData.height / 10).toFixed(1)} m</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PokemonSearch;