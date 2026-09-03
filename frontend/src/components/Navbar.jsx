import React from 'react';
import { UtensilsCrossed, ShoppingBag, History } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, totalParaComprar = 0 }) {
  return (
    <>
      {/* Barra de Topo */}
      <header className="navbar">
        <div className="navbar-content">
          <div className="brand-section">
            <div className="brand-logo-badge">
              🍲
            </div>
            <div>
              <h1 className="brand-title">Restaurante do Seu Raimundo</h1>
              <p className="brand-subtitle">Controle Inteligente de Estoque & Reposição</p>
            </div>
          </div>

          {/* Navegação Desktop (oculta em smartphones) */}
          <nav className="navbar-nav desktop-navbar-nav">
            <button
              id="tab-estoque-btn"
              className={`nav-tab-btn ${activeTab === 'estoque' ? 'active' : ''}`}
              onClick={() => setActiveTab('estoque')}
            >
              <UtensilsCrossed size={18} />
              <span>Ingredientes & Estoque</span>
            </button>

            <button
              id="tab-compras-btn"
              className={`nav-tab-btn ${activeTab === 'compras' ? 'active' : ''}`}
              onClick={() => setActiveTab('compras')}
            >
              <ShoppingBag size={18} />
              <span>Lista de Compras</span>
              {totalParaComprar > 0 && (
                <span className="nav-badge-count">
                  {totalParaComprar}
                </span>
              )}
            </button>

            <button
              id="tab-historico-btn"
              className={`nav-tab-btn ${activeTab === 'historico' ? 'active' : ''}`}
              onClick={() => setActiveTab('historico')}
            >
              <History size={18} />
              <span>Histórico</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Barra de Navegação Inferior Nativa para Mobile (App-like Bottom Navigation) */}
      <nav className="mobile-bottom-nav" aria-label="Navegação móvel inferior">
        <button
          type="button"
          className={`mobile-bottom-tab ${activeTab === 'estoque' ? 'active' : ''}`}
          onClick={() => setActiveTab('estoque')}
        >
          <div className="mobile-tab-icon-wrapper">
            <UtensilsCrossed size={20} />
          </div>
          <span className="mobile-tab-label">Estoque</span>
        </button>

        <button
          type="button"
          className={`mobile-bottom-tab ${activeTab === 'compras' ? 'active' : ''}`}
          onClick={() => setActiveTab('compras')}
        >
          <div className="mobile-tab-icon-wrapper">
            <ShoppingBag size={20} />
            {totalParaComprar > 0 && (
              <span className="mobile-tab-badge">
                {totalParaComprar}
              </span>
            )}
          </div>
          <span className="mobile-tab-label">Compras</span>
        </button>

        <button
          type="button"
          className={`mobile-bottom-tab ${activeTab === 'historico' ? 'active' : ''}`}
          onClick={() => setActiveTab('historico')}
        >
          <div className="mobile-tab-icon-wrapper">
            <History size={20} />
          </div>
          <span className="mobile-tab-label">Histórico</span>
        </button>
      </nav>
    </>
  );
}
