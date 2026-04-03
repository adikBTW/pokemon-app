import React, { useState, useEffect } from 'react';
import { useThemeLang } from '../../context/ThemeLanguageContext';
import './PokemonCard.css';

const TYPE_EFFECTIVENESS = {
  normal:   { weakTo: ['fighting'], immuneTo: ['ghost'] },
  fire:     { weakTo: ['water','ground','rock'] },
  water:    { weakTo: ['electric','grass'] },
  electric: { weakTo: ['ground'] },
  grass:    { weakTo: ['fire','ice','poison','flying','bug'] },
  ice:      { weakTo: ['fire','fighting','rock','steel'] },
  fighting: { weakTo: ['flying','psychic','fairy'] },
  poison:   { weakTo: ['ground','psychic'] },
  ground:   { weakTo: ['water','grass','ice'], immuneTo: ['electric'] },
  flying:   { weakTo: ['electric','ice','rock'], immuneTo: ['ground'] },
  psychic:  { weakTo: ['bug','ghost','dark'] },
  bug:      { weakTo: ['fire','flying','rock'] },
  rock:     { weakTo: ['water','grass','fighting','ground','steel'] },
  ghost:    { weakTo: ['ghost','dark'], immuneTo: ['normal','fighting'] },
  dragon:   { weakTo: ['ice','dragon','fairy'] },
  dark:     { weakTo: ['fighting','bug','fairy'] },
  steel:    { weakTo: ['fire','fighting','ground'] },
  fairy:    { weakTo: ['poison','steel'], immuneTo: ['dragon'] },
};

export const getWeaknesses = (types) => {
  const weaknesses = new Set();
  const immunities = new Set();
  types.forEach(type => {
    const data = TYPE_EFFECTIVENESS[type] || {};
    (data.weakTo || []).forEach(w => weaknesses.add(w));
    (data.immuneTo || []).forEach(i => immunities.add(i));
  });
  immunities.forEach(i => weaknesses.delete(i));
  return [...weaknesses];
};

const getFavorites = () => {
  try { return JSON.parse(localStorage.getItem('pokeFavorites') || '[]'); }
  catch { return []; }
};

const PokemonCard = ({ pokemonData }) => {
  const { t } = useThemeLang();
  const [shiny, setShiny] = useState(false);
  const [movesOpen, setMovesOpen] = useState(false);
  const [moves, setMoves] = useState([]);
  const [loadingMoves, setLoadingMoves] = useState(false);
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    if (!pokemonData) return;
    setShiny(false);
    setMovesOpen(false);
    setMoves([]);
    const favs = getFavorites();
    setIsFav(favs.some(f => f.id === pokemonData.id));
  }, [pokemonData]);

  const toggleFavorite = () => {
    const favs = getFavorites();
    let updated;
    if (isFav) {
      updated = favs.filter(f => f.id !== pokemonData.id);
    } else {
      updated = [...favs, {
        id: pokemonData.id,
        name: pokemonData.name,
        sprite: pokemonData.sprites?.other?.['official-artwork']?.front_default || pokemonData.sprites?.front_default,
        types: pokemonData.types.map(tp => tp.type.name),
      }];
    }
    localStorage.setItem('pokeFavorites', JSON.stringify(updated));
    setIsFav(!isFav);
  };

  const toggleMoves = async () => {
    if (movesOpen) { setMovesOpen(false); return; }
    setMovesOpen(true);
    if (moves.length > 0) return;
    setLoadingMoves(true);
    try {
      const levelMoves = pokemonData.moves
        .map(m => {
          const entry = m.version_group_details.find(v => v.move_learn_method.name === 'level-up');
          return entry ? { url: m.move.url, name: m.move.name, level: entry.level_learned_at, method: 'level-up' } : null;
        })
        .filter(Boolean)
        .sort((a, b) => a.level - b.level);

      const otherMoves = pokemonData.moves
        .map(m => {
          const entry = m.version_group_details.find(v => v.move_learn_method.name !== 'level-up');
          return entry ? { url: m.move.url, name: m.move.name, level: null, method: entry.move_learn_method.name } : null;
        })
        .filter(Boolean);

      const combined = [...levelMoves, ...otherMoves].slice(0, 30);

      const detailed = await Promise.all(combined.map(async m => {
        try {
          const res = await fetch(m.url);
          const data = await res.json();
          return {
            name: m.name,
            type: data.type?.name || '—',
            power: data.power ?? '—',
            accuracy: data.accuracy ?? '—',
            pp: data.pp ?? '—',
            method: m.method,
            level: m.level,
          };
        } catch {
          return { name: m.name, type: '—', power: '—', accuracy: '—', pp: '—', method: m.method, level: m.level };
        }
      }));
      setMoves(detailed);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMoves(false);
    }
  };

  if (!pokemonData) return null;

  const types = pokemonData.types.map(tp => tp.type.name);
  const weaknesses = getWeaknesses(types);
  const officialArt = pokemonData.sprites?.other?.['official-artwork']?.front_default;
  const officialArtShiny = pokemonData.sprites?.other?.['official-artwork']?.front_shiny;
  const frontShiny = pokemonData.sprites?.front_shiny;
  const shinyImage = officialArtShiny || frontShiny;
  const mainImage = shiny ? shinyImage : officialArt;
  const hasShiny = !!shinyImage;
  const shinyThumb = frontShiny;

  return (
    <div className="poke-card-wrapper">
      <div className="pokemon-card">
        <div className="sprite-container">
          <div className="main-sprite-box">
            <img src={mainImage} alt={pokemonData.name} className="pokemon-sprite" />
          </div>
          {hasShiny && (
            <div
              className={`shiny-thumb${shiny ? ' shiny-thumb--active' : ''}`}
              onClick={() => setShiny(s => !s)}
              title={shiny ? t.switchNormal : t.switchShiny}
            >
              <img src={shinyThumb} alt="shiny" />
              <span className="shiny-star">✨</span>
            </div>
          )}
        </div>

        <div className="pokemon-info">
          <div className="pokemon-name-row">
            <h3 className="pokemon-name">{pokemonData.name}</h3>
            <button
              className={`fav-btn${isFav ? ' fav-btn--active' : ''}`}
              onClick={toggleFavorite}
              title={isFav ? t.removeFavorite : t.addFavorite}
            >
              {isFav ? '❤️' : '🤍'}
            </button>
          </div>
          <p className="pokemon-id">#{String(pokemonData.id).padStart(3, '0')}</p>

          <div className="pokemon-types">
            {types.map(type => (
              <span key={type} className={`type-badge type-${type}`}>{type}</span>
            ))}
          </div>

          <div className="pokemon-stats">
            {pokemonData.stats.map(s => (
              <div key={s.stat.name} className="stat-row">
                <span className="stat-label">{t.stats[s.stat.name] || s.stat.name}:</span>
                <span className="stat-value">{s.base_stat}</span>
              </div>
            ))}
            <div className="stat-row">
              <span className="stat-label">{t.weight}:</span>
              <span className="stat-value">{(pokemonData.weight / 10).toFixed(1)} kg</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">{t.height}:</span>
              <span className="stat-value">{(pokemonData.height / 10).toFixed(1)} m</span>
            </div>
          </div>

          {weaknesses.length > 0 && (
            <div className="effective-types">
              <h3>{t.effectiveTypes} {pokemonData.name}:</h3>
              <div className="type-list">
                {weaknesses.map(type => (
                  <span key={type} className={`type-badge type-${type}`}>{type}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="moves-section">
        <button className="moves-toggle" onClick={toggleMoves}>
          <span>{movesOpen ? t.movesHide : t.movesShow}</span>
          <span className={`moves-chevron${movesOpen ? ' moves-chevron--open' : ''}`}>▾</span>
        </button>

        {movesOpen && (
          <div className="moves-body">
            {loadingMoves ? (
              <div className="loading">{t.loadingMoves}</div>
            ) : moves.length === 0 ? (
              <div className="loading">{t.noMoves}</div>
            ) : (
              <div className="moves-table-wrapper">
                <table className="moves-table">
                  <thead>
                    <tr>
                      <th>{t.moveName}</th>
                      <th>{t.moveType}</th>
                      <th>{t.movePower}</th>
                      <th>{t.moveAccuracy}</th>
                      <th>{t.movePP}</th>
                      <th>{t.moveLearnMethod}</th>
                      <th>{t.moveLevel}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {moves.map((m, i) => (
                      <tr key={i}>
                        <td className="move-name">{m.name.replace(/-/g, ' ')}</td>
                        <td><span className={`type-badge type-${m.type}`}>{m.type}</span></td>
                        <td>{m.power}</td>
                        <td>{m.accuracy}</td>
                        <td>{m.pp}</td>
                        <td className="move-method">{m.method.replace(/-/g, ' ')}</td>
                        <td>{m.level || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PokemonCard;