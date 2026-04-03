import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useThemeLang } from '../context/ThemeLanguageContext';
import PokemonCard from '../components/PokemonCard/PokemonCard';
import './Home.css';

const Home = () => {
  const { t } = useThemeLang();
  const [searchParams] = useSearchParams();
  const [allPokemons, setAllPokemons] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [pokemonData, setPokemonData] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef(null);
  const mouseInSuggestions = useRef(false);
  const skipNextFilter = useRef(false);

  useEffect(() => {
    fetch('https://pokeapi.co/api/v2/pokemon?limit=10000')
      .then(r => r.json())
      .then(json => setAllPokemons(json.results.map(p => p.name)))
      .catch(err => console.error(err))
      .finally(() => setLoadingList(false));
  }, []);

  useEffect(() => {
    const name = searchParams.get('pokemon');
    if (name) {
      skipNextFilter.current = true;
      setSearchTerm(name);
      setFiltered([]);
      fetchPokemonData(name);
    }
  }, [searchParams]);

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

  const fetchPokemonData = async (name) => {
    try {
      setLoadingDetails(true);
      setError(null);
      setPokemonData(null);
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
      if (!res.ok) throw new Error('Pokémon not found');
      setPokemonData(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const term = searchTerm.trim().toLowerCase();
    if (term) { fetchPokemonData(term); setFiltered([]); }
  };

  const handleSuggestionSelect = (name) => {
    mouseInSuggestions.current = false;
    setSearchTerm(name);
    fetchPokemonData(name);
    setFiltered([]);
    inputRef.current?.focus();
  };

  const handleRandom = () => {
    if (allPokemons.length === 0) return;
    const randomName = allPokemons[Math.floor(Math.random() * allPokemons.length)];
    skipNextFilter.current = true;
    setSearchTerm(randomName);
    setFiltered([]);
    fetchPokemonData(randomName);
  };

  return (
    <div className="home-page">
      <h2 className="home-title">{t.pokemonSearch}</h2>

      {loadingList ? (
        <div className="loading">{t.loadingList}</div>
      ) : (
        <form onSubmit={handleSearch} autoComplete="off" className="search-form">
          <div className="search-container">
            <div className="autocomplete-wrapper">
              <input
                ref={inputRef}
                type="text"
                placeholder={t.searchPokemon}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="search-input"
                onBlur={() => { if (!mouseInSuggestions.current) setTimeout(() => setFiltered([]), 100); }}
              />
              <button type="submit" className="search-button">{t.searchButton}</button>
              <button type="button" className="random-button" onClick={handleRandom} title={t.randomButton}>
                🎲
              </button>
            </div>
            {filtered.length > 0 && (!pokemonData || searchTerm.toLowerCase() !== pokemonData.name.toLowerCase()) && (
              <ul
                className="suggestions-list"
                onMouseEnter={() => { mouseInSuggestions.current = true; }}
                onMouseLeave={() => { mouseInSuggestions.current = false; }}
              >
                {filtered.map(({ name, imageUrl }) => (
                  <li key={name} className="suggestion-item" onMouseDown={() => handleSuggestionSelect(name)}>
                    <img src={imageUrl} alt={name} className="suggestion-image" />
                    <span>{name}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </form>
      )}

      {loadingDetails && <div className="loading">{t.loadingData}</div>}
      {error && <div className="error">{t.errorPrefix} {error}</div>}

      {pokemonData && (
        <div className="pokemon-display">
          <PokemonCard pokemonData={pokemonData} />
        </div>
      )}
    </div>
  );
};

export default Home;