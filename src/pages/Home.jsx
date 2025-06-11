import React, { useState, useEffect, useRef } from 'react';
import './Home.css';

const Home = () => {
  const [allPokemons, setAllPokemons] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [pokemonData, setPokemonData] = useState(null);
  const [loadingAll, setLoadingAll] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [effectiveTypes, setEffectiveTypes] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    const fetchAllPokemons = async () => {
      try {
        const resp = await fetch('https://pokeapi.co/api/v2/pokemon?limit=10000');
        const json = await resp.json();
        const names = json.results.map(r => r.name);
        setAllPokemons(names);
      } catch (err) {
        console.error('Error loading all Pokémon:', err);
      } finally {
        setLoadingAll(false);
      }
    };
    fetchAllPokemons();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFiltered([]);
      return;
    }
    const termLower = searchTerm.toLowerCase();
    const matches = allPokemons
      .filter(name => name.includes(termLower))
      .slice(0, 10);
    setFiltered(matches);
  }, [searchTerm, allPokemons]);

  const fetchPokemonData = async (term) => {
    if (!term) return;
    try {
      setError(null);
      setPokemonData(null);
      setEffectiveTypes([]);
      setLoading(true);
      const resp = await fetch(`https://pokeapi.co/api/v2/pokemon/${term.toLowerCase()}`);
      if (!resp.ok) throw new Error('Pokémon not found');
      const data = await resp.json();
      setPokemonData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchEffectiveTypes = async () => {
      if (!pokemonData) return;
      try {
        const typePromises = pokemonData.types.map(typeInfo =>
          fetch(`https://pokeapi.co/api/v2/type/${typeInfo.type.name}`).then(res => res.json())
        );
        const typesData = await Promise.all(typePromises);
        const allEffective = typesData.flatMap(type =>
          type.damage_relations.double_damage_from.map(t => t.name)
        );
        setEffectiveTypes([...new Set(allEffective)]);
      } catch (err) {
        console.error('Error loading effective types:', err);
        setEffectiveTypes([]);
      }
    };
    fetchEffectiveTypes();
  }, [pokemonData]);

  const handleSearch = (e) => {
    e.preventDefault();
    const term = e.target.elements.search.value.trim().toLowerCase();
    if (term) {
      setSearchTerm(term);
      fetchPokemonData(term);
      setFiltered([]);
    }
  };

  const handleSuggestionSelect = (name) => {
    setSearchTerm(name);
    fetchPokemonData(name);
    setFiltered([]);
    inputRef.current?.focus();
  };

  return (
    <div className="home">
      <h2 className="items-title">Pokémon Search</h2>

      <div className="search-container">
        {loadingAll ? (
          <div className="loading">Loading Pokémon list for suggestions…</div>
        ) : (
          <form onSubmit={handleSearch} autoComplete="off">
            <div className="autocomplete-wrapper">
              <input
                ref={inputRef}
                type="text"
                name="search"
                placeholder="Search for a Pokémon..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="search-input"
                onBlur={() => setTimeout(() => setFiltered([]), 100)}
              />
              <button type="submit" className="search-button">Search</button>
            </div>
            {filtered.length > 0 && (
              <ul className="suggestions-list">
                {filtered.map(name => (
                  <li
                    key={name}
                    className="suggestion-item"
                    onMouseDown={() => handleSuggestionSelect(name)}
                  >
                    <span className="suggestion-name">{name}</span>
                  </li>
                ))}
              </ul>
            )}
          </form>
        )}
      </div>

      {loading && <div className="loading">Loading...</div>}
      {error && <div className="error">Error: {error}</div>}

      {pokemonData && (
        <div className="pokemon-display">
          <div className="pokemon-card">
            <div className="sprite-container">
              <img
                src={pokemonData.sprites.other['official-artwork'].front_default || pokemonData.sprites.front_default}
                alt={pokemonData.name}
                className="pokemon-sprite"
              />
              {(pokemonData.sprites.other['official-artwork'].front_shiny || pokemonData.sprites.front_shiny) && (
                <img
                  src={pokemonData.sprites.other['official-artwork'].front_shiny || pokemonData.sprites.front_shiny}
                  alt={`${pokemonData.name} shiny`}
                  className="pokemon-sprite shiny"
                />
              )}
            </div>

            <div className="pokemon-info">
              <h1 className="pokemon-name">{pokemonData.name}</h1>
              <p className="pokemon-id">#{pokemonData.id.toString().padStart(3, '0')}</p>

              <div className="pokemon-types">
                {pokemonData.types.map((typeInfo, index) => (
                  <span key={index} className={`type-badge type-${typeInfo.type.name}`}>
                    {typeInfo.type.name}
                  </span>
                ))}
              </div>

              <div className="pokemon-stats">
                {pokemonData.stats.map((stat, idx) => (
                  <div key={idx} className="stat-row">
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

              {effectiveTypes.length > 0 && (
                <div className="effective-types">
                  <h3>Effective types against {pokemonData.name}:</h3>
                  <div className="type-list">
                    {effectiveTypes.map((type, idx) => (
                      <span key={idx} className={`type-badge type-${type}`}>
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
