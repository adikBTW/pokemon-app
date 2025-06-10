import React, { useState, useEffect, useRef } from 'react';
import './Items.css';

const Items = () => {
  const [allItems, setAllItems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [itemData, setItemData] = useState(null);
  const [flavorText, setFlavorText] = useState('');
  const [loadingAll, setLoadingAll] = useState(true);
  const [loadingItem, setLoadingItem] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    const fetchAllItems = async () => {
      try {
        const resp = await fetch('https://pokeapi.co/api/v2/item?limit=10000');
        const json = await resp.json();
        setAllItems(json.results.map(r => r.name));
      } catch (err) {
        console.error('Error loading all items:', err);
      } finally {
        setLoadingAll(false);
      }
    };
    fetchAllItems();
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setFiltered([]);
      return;
    }
    const termLower = searchTerm.toLowerCase();
    const matches = allItems
      .filter(name => name.includes(termLower))
      .slice(0, 10);
    setFiltered(matches);
  }, [searchTerm, allItems]);

  const fetchItemData = async (term) => {
    if (!term) return;
    try {
      setError(null);
      setItemData(null);
      setFlavorText('');
      setLoadingItem(true);
      const resp = await fetch(`https://pokeapi.co/api/v2/item/${term}`);
      if (!resp.ok) {
        throw new Error('Item not found');
      }
      const data = await resp.json();
      setItemData(data);

      const flavorEntry = data.flavor_text_entries.find(
        entry => entry.language.name === 'en'
      );
      if (flavorEntry && flavorEntry.flavor_text) {
        setFlavorText(flavorEntry.flavor_text.replace(/\n|\f/g, ' '));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingItem(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const term = e.target.elements.search.value.trim().toLowerCase();
    if (term) {
      setSearchTerm(term);
      fetchItemData(term);
      setFiltered([]);
    }
  };

  const handleSuggestionSelect = (name) => {
    setSearchTerm(name);
    fetchItemData(name);
    setFiltered([]);
    inputRef.current?.focus();
  };

  return (
    <div className="items-page">
      <h2 className="items-title">Item Search</h2>

      {loadingAll 
        ? <div className="loading">Loading item list for suggestions…</div>
        : (
          <div className="search-container">
            <form onSubmit={handleSearch} autoComplete="off">
              <div className="autocomplete-wrapper">
                <input
                  ref={inputRef}
                  type="text"
                  name="search"
                  placeholder="Enter an item..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="search-input"
                  onBlur={() => {
                    setTimeout(() => {
                      setFiltered([]);
                    }, 100);
                  }}
                />
                <button type="submit" className="search-button">
                  Search
                </button>
              </div>
              {filtered.length > 0 && (
                <ul className="suggestions-list">
                  {filtered.map(name => (
                    <li 
                      key={name} 
                      className="suggestion-item"
                      onMouseDown={() => handleSuggestionSelect(name)}
                    >
                      {name}
                    </li>
                  ))}
                </ul>
              )}
            </form>
          </div>
        )
      }

      {loadingItem && <div className="loading">Loading item details…</div>}
      {error && <div className="error">Error: {error}</div>}

      {itemData && (
        <div className="item-display">
          <div className="item-card">
            {itemData.sprites?.default && (
              <div className="item-sprite-container">
                <img
                  src={itemData.sprites.default}
                  alt={itemData.name}
                  className="item-sprite"
                />
              </div>
            )}
            <div className="item-info">
              <h3 className="item-name">{itemData.name}</h3>
              <p className="item-id">ID: {itemData.id}</p>
              <p className="item-cost">Cost: {itemData.cost} Pokédollars</p>

              {itemData.category && (
                <p className="item-category">
                  Category: {itemData.category.name}
                </p>
              )}

              {flavorText && (
                <div className="item-description">
                  <h4>Description:</h4>
                  <p>{flavorText}</p>
                </div>
              )}

              {itemData.effect_entries?.length > 0 && (
                <div className="item-effect">
                  <h4>Effect:</h4>
                  <p>{itemData.effect_entries[0].short_effect}</p>
                </div>
              )}

              {itemData.attributes?.length > 0 && (
                <div className="item-attributes">
                  <h4>Attributes:</h4>
                  <ul>
                    {itemData.attributes.map(attr => (
                      <li key={attr.name}>{attr.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Items;