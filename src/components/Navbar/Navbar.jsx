import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useThemeLang } from '../../context/ThemeLanguageContext';
import './Navbar.css';

const SunIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);
const MoonIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);
const SystemIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2"/>
    <line x1="8" y1="21" x2="16" y2="21"/>
    <line x1="12" y1="17" x2="12" y2="21"/>
  </svg>
);
const GearIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);

const THEMES = [
  { key: 'light',  icon: <SunIcon /> },
  { key: 'dark',   icon: <MoonIcon /> },
  { key: 'system', icon: <SystemIcon /> },
];

const LANGUAGES = ['EN', 'CZ', 'ES', 'FR', 'JA', 'ZH'];

const NAV_LINKS = (t) => [
  { to: '/',          label: t.pokemons  },
  { to: '/items',     label: t.items     },
  { to: '/favorites', label: t.favorites },
  { to: '/compare',   label: t.compare   },
];

const Navbar = () => {
  const { language, setLanguage, theme, setTheme, t } = useThemeLang();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const settingsRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const handler = (e) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target)) {
        setSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const links = NAV_LINKS(t);

  return (
    <>
      <nav className="pokemon-navbar">
        <div className="navbar-scanlines" />
        <div className="navbar-container">
          <Link to="/" className="navbar-logo">
            <span className="app-title">Pokéstats</span>
          </Link>
          <div className="navbar-right">
            <div className="nav-links">
              {links.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`nav-link${location.pathname === to ? ' nav-link--active' : ''}`}
                >
                  {label}
                </Link>
              ))}
            </div>

            <div className="navbar-divider" />

            <div className="settings-wrapper" ref={settingsRef}>
              <button
                className={`settings-btn${settingsOpen ? ' settings-btn--active' : ''}`}
                onClick={() => setSettingsOpen(o => !o)}
                aria-label={t.settings}
                title={t.settings}
              >
                <span className={`gear-icon${settingsOpen ? ' gear-icon--spin' : ''}`}><GearIcon /></span>
                <span className="settings-btn-label">{t.settings}</span>
              </button>

              {settingsOpen && (
                <div className="settings-dropdown">
                  <div className="settings-arrow" />
                  <div className="settings-section">
                    <span className="settings-label">{t.language}</span>
                    <div className="settings-pills">
                      {LANGUAGES.map(lang => (
                        <button
                          key={lang}
                          className={`pill${language === lang ? ' pill--active' : ''}`}
                          onClick={() => setLanguage(lang)}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="settings-divider" />
                  <div className="settings-section">
                    <span className="settings-label">{t.theme}</span>
                    <div className="settings-pills">
                      {THEMES.map(({ key, icon }) => (
                        <button
                          key={key}
                          className={`pill pill--icon${theme === key ? ' pill--active' : ''}`}
                          onClick={() => setTheme(key)}
                          title={t[key]}
                        >
                          {icon}<span>{t[key]}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              className={`hamburger${menuOpen ? ' hamburger--open' : ''}`}
              onClick={() => setMenuOpen(o => !o)}
              aria-label="Menu"
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </nav>

      <div className={`mobile-drawer${menuOpen ? ' mobile-drawer--open' : ''}`}>
        <div className="mobile-nav-links">
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`mobile-nav-link${location.pathname === to ? ' mobile-nav-link--active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="mobile-settings">
          <div className="settings-section">
            <span className="settings-label">{t.language}</span>
            <div className="settings-pills">
              {LANGUAGES.map(lang => (
                <button
                  key={lang}
                  className={`pill${language === lang ? ' pill--active' : ''}`}
                  onClick={() => setLanguage(lang)}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>
          <div className="settings-divider" />
          <div className="settings-section">
            <span className="settings-label">{t.theme}</span>
            <div className="settings-pills">
              {THEMES.map(({ key, icon }) => (
                <button
                  key={key}
                  className={`pill pill--icon${theme === key ? ' pill--active' : ''}`}
                  onClick={() => setTheme(key)}
                >
                  {icon}<span>{t[key]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;