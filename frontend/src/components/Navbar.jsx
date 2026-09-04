import React from 'react';
import { UtensilsCrossed, ShoppingBag, History } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, totalParaComprar }) {
  return (
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

        <nav className="navbar-nav">
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
              <span style={{
                background: 'var(--rose-danger)',
                color: '#fff',
                fontSize: '0.72rem',
                padding: '2px 7px',
                borderRadius: '999px',
                fontWeight: 700,
                marginLeft: '4px'
              }}>
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
  );
}
