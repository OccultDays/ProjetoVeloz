import React from 'react';
import { Package, ShoppingCart, AlertTriangle, Flame } from 'lucide-react';

export default function MetricCards({ stats, onSelectFilter }) {
  return (
    <section className="metrics-grid" aria-label="Indicadores principais de estoque">
      <div
        className="metric-card"
        style={{ cursor: 'pointer' }}
        onClick={() => onSelectFilter('todos')}
      >
        <div className="metric-info">
          <h3>Total de Ingredientes</h3>
          <div className="metric-value">{stats.total_ingredientes || 0}</div>
          <div className="metric-desc">Itens monitorados no cardápio</div>
        </div>
        <div className="metric-icon-box amber">
          <Package size={22} />
        </div>
      </div>

      <div
        className="metric-card"
        style={{ cursor: 'pointer' }}
        onClick={() => onSelectFilter('comprar')}
      >
        <div className="metric-info">
          <h3>Itens a Comprar</h3>
          <div className="metric-value" style={{ color: 'var(--amber-light)' }}>
            {stats.total_para_comprar || 0}
          </div>
          <div className="metric-desc">Necessitam reposição imediata</div>
        </div>
        <div className="metric-icon-box emerald">
          <ShoppingCart size={22} />
        </div>
      </div>

      <div
        className="metric-card"
        style={{ cursor: 'pointer' }}
        onClick={() => onSelectFilter('vencidos')}
      >
        <div className="metric-info">
          <h3>Ingredientes Vencidos</h3>
          <div className="metric-value" style={{ color: 'var(--rose-danger)' }}>
            {stats.total_vencidos || 0}
          </div>
          <div className="metric-desc">Sobra descartada; compra meta cheia</div>
        </div>
        <div className="metric-icon-box rose">
          <AlertTriangle size={22} />
        </div>
      </div>

      <div
        className="metric-card"
        style={{ cursor: 'pointer' }}
        onClick={() => onSelectFilter('faltaram')}
      >
        <div className="metric-info">
          <h3>Acabou no Meio do Mês</h3>
          <div className="metric-value" style={{ color: 'var(--orange-warning)' }}>
            {stats.total_faltaram || 0}
          </div>
          <div className="metric-desc">Meta baixa; +20% de gordurinha</div>
        </div>
        <div className="metric-icon-box orange">
          <Flame size={22} />
        </div>
      </div>
    </section>
  );
}
