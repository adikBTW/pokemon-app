import React, { useState, useEffect, useRef } from 'react';
import { useThemeLang } from '../context/ThemeLanguageContext';
import PokemonCard from '../components/PokemonCard/PokemonCard';
import './Compare.css';

const SearchPanel = ({ label, allPokemons, onPokemonLoaded, t }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filtered, setFiltered] = useState([]);
  const [pokemonData, setPokemonData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  const mouseInSuggestions = useRef(false);
  const skipNextFilter = useRef(false);

  useEffect(() => {
    if (skipNextFilter.current) { skipNextFilter.current = false; setFiltered([]); return; }
    if (!searchTerm.trim()) { setFiltered([]); return; }
    const termLower = searchTerm.toLowerCase();
    const matches = allPokemons.filter(n => n.includes(termLower)).slice(0, 10);
    Promise.all(matches.map(async name => {
      try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
        const data = await res.json();
        return { name, imageUrl: data.sprites.front_default || '' };
      } catch { return { name, imageUrl: '' }; }
    })).then(setFiltered);
  }, [searchTerm, allPokemons]);

  const fetchPokemon = async (name) => {
    try {
      setLoading(true);
      setError(null);
      setPokemonData(null);
      onPokemonLoaded(null);
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
      if (!res.ok) throw new Error('Pokémon not found');
      const data = await res.json();
      setPokemonData(data);
      onPokemonLoaded(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const term = searchTerm.trim().toLowerCase();
    if (term) { fetchPokemon(term); setFiltered([]); }
  };

  const handleSelect = (name) => {
    mouseInSuggestions.current = false;
    setSearchTerm(name);
    setFiltered([]);
    fetchPokemon(name);
    inputRef.current?.blur();
  };

  const handleRandom = () => {
    if (allPokemons.length === 0) return;
    const name = allPokemons[Math.floor(Math.random() * allPokemons.length)];
    skipNextFilter.current = true;
    setSearchTerm(name);
    setFiltered([]);
    fetchPokemon(name);
  };

  const handleBlur = () => {
    if (!mouseInSuggestions.current) {
      setTimeout(() => setFiltered([]), 100);
    }
  };

  return (
    <div className="compare-panel">
      <h3 className="compare-panel-label">{label}</h3>

      <form onSubmit={handleSearch} autoComplete="off" className="compare-search-form">
        <div className="compare-autocomplete">
          <input
            ref={inputRef}
            type="text"
            placeholder={t.searchPokemon}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="search-input"
            onBlur={handleBlur}
          />
          <button type="submit" className="search-button">{t.searchButton}</button>
          <button type="button" className="random-button" onClick={handleRandom}>🎲</button>
        </div>
        {filtered.length > 0 && (
          <ul
            className="suggestions-list"
            onMouseEnter={() => { mouseInSuggestions.current = true; }}
            onMouseLeave={() => { mouseInSuggestions.current = false; }}
          >
            {filtered.map(({ name, imageUrl }) => (
              <li
                key={name}
                className="suggestion-item"
                onMouseDown={() => handleSelect(name)}
              >
                <img src={imageUrl} alt={name} className="suggestion-image" />
                <span>{name}</span>
              </li>
            ))}
          </ul>
        )}
      </form>

      {loading && <div className="loading">{t.loadingData}</div>}
      {error && <div className="error">{t.errorPrefix} {error}</div>}

      {pokemonData ? (
        <PokemonCard pokemonData={pokemonData} />
      ) : (
        !loading && !error && (
          <div className="compare-empty-slot">
            <span>?</span>
            <p>{t.compareEmpty}</p>
          </div>
        )
      )}
    </div>
  );
};

const Compare = () => {
  const { t } = useThemeLang();
  const [allPokemons, setAllPokemons] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [pokemon1, setPokemon1] = useState(null);
  const [pokemon2, setPokemon2] = useState(null);

  useEffect(() => {
    fetch('https://pokeapi.co/api/v2/pokemon?limit=10000')
      .then(r => r.json())
      .then(json => setAllPokemons(json.results.map(p => p.name)))
      .catch(err => console.error(err))
      .finally(() => setLoadingList(false));
  }, []);

  const getStatWinner = (s1, s2) => {
    if (s1 > s2) return 'left';
    if (s2 > s1) return 'right';
    return 'tie';
  };

  const statKeys = ['hp','attack','defense','special-attack','special-defense','speed'];

  return (
    <div className="compare-page">
      <h2 className="compare-title">{t.compareTitle}</h2>

      {loadingList ? (
        <div className="loading">{t.loadingList}</div>
      ) : (
        <>
          <div className="compare-grid">
            <SearchPanel label={t.comparePokemon1} allPokemons={allPokemons} onPokemonLoaded={setPokemon1} t={t} />
            <SearchPanel label={t.comparePokemon2} allPokemons={allPokemons} onPokemonLoaded={setPokemon2} t={t} />
          </div>

          {pokemon1 && pokemon2 && (
            <div className="stat-comparison">
              <h3 className="stat-comparison-title">
                <span className="comp-name comp-name--left">{pokemon1.name}</span>
                <span className="comp-vs">VS</span>
                <span className="comp-name comp-name--right">{pokemon2.name}</span>
              </h3>
              {statKeys.map(key => {
                const s1 = pokemon1.stats.find(s => s.stat.name === key)?.base_stat || 0;
                const s2 = pokemon2.stats.find(s => s.stat.name === key)?.base_stat || 0;
                const winner = getStatWinner(s1, s2);
                const max = Math.max(s1, s2, 1);
                return (
                  <div key={key} className="comp-stat-row">
                    <span className={`comp-val comp-val--left${winner === 'left' ? ' comp-val--win' : ''}`}>{s1}</span>
                    <div className="comp-bars">
                      <div className="comp-bar-wrap comp-bar-wrap--left">
                        <div className={`comp-bar comp-bar--left${winner === 'left' ? ' comp-bar--win' : ''}`} style={{ width: `${(s1 / max) * 100}%` }} />
                      </div>
                      <span className="comp-stat-label">{t.stats[key] || key}</span>
                      <div className="comp-bar-wrap comp-bar-wrap--right">
                        <div className={`comp-bar comp-bar--right${winner === 'right' ? ' comp-bar--win' : ''}`} style={{ width: `${(s2 / max) * 100}%` }} />
                      </div>
                    </div>
                    <span className={`comp-val comp-val--right${winner === 'right' ? ' comp-val--win' : ''}`}>{s2}</span>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Compare;