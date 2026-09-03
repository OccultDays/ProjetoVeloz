import React from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  AlertOctagon,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ShoppingBag
} from 'lucide-react';

export default function IngredientTable({
  ingredientes,
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  onAddNew,
  onEdit,
  onDelete,
  onToggleVencido,
  onToggleFaltaMes,
  onGoToShoppingList,
}) {
  // Filtros aplicados
  const filteredItems = ingredientes.filter((item) => {
    const matchesSearch = item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.observacao && item.observacao.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    const calc = item.calculo_reposicao || {};

    if (filterStatus === 'comprar') return calc.deve_comprar;
    if (filterStatus === 'vencidos') return item.vencido;
    if (filterStatus === 'faltaram') return item.faltou_no_meio_do_mes;
    if (filterStatus === 'ok') return !calc.deve_comprar;

    return true;
  });

  return (
    <div className="table-container-section">
      {/* Toolbar */}
      <div className="toolbar-container">
        <div className="search-filter-group">
          <div className="search-input-wrapper">
            <Search size={18} />
            <input
              id="search-ingredient-input"
              type="text"
              className="search-input"
              placeholder="Buscar ingrediente"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            id="status-filter-select"
            className="filter-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="todos">Todos os Ingredientes ({ingredientes.length})</option>
            <option value="comprar">Apenas para Comprar</option>
            <option value="vencidos">Ingredientes Vencidos</option>
            <option value="faltaram">Falta no Meio do Mês</option>
            <option value="ok">Estoque Suficiente (OK)</option>
          </select>
        </div>

        <div className="actions-group">
          <button
            id="btn-add-ingredient"
            className="btn btn-primary"
            onClick={onAddNew}
          >
            <Plus size={18} />
            <span>Novo Ingrediente</span>
          </button>

          <button
            id="btn-view-shopping-list"
            className="btn btn-success"
            onClick={onGoToShoppingList}
          >
            <ShoppingBag size={18} />
            <span>Ver Lista de Compras</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Ingrediente</th>
              <th>Unidade</th>
              <th>Meta</th>
              <th>Estoque Atual</th>
              <th>Status do Mês</th>
              <th>A Comprar</th>
              <th style={{ textAlign: 'center' }}>Ações Rápidas</th>
              <th style={{ textAlign: 'right' }}>Opções</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan="8">
                  <div className="empty-state">
                    <div className="empty-state-icon">📦</div>
                    <h3>Nenhum ingrediente encontrado</h3>
                    <p>Tente ajustar a busca ou cadastre um novo ingrediente acima.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => {
                const calc = item.calculo_reposicao || {};
                const deveComprar = calc.deve_comprar;

                let badgeClass = 'ok';
                let badgeText = 'Estoque OK';
                let BadgeIcon = CheckCircle2;

                if (item.vencido) {
                  badgeClass = 'vencido';
                  badgeText = 'Vencido (Descarte)';
                  BadgeIcon = AlertTriangle;
                } else if (item.faltou_no_meio_do_mes) {
                  badgeClass = 'falta';
                  badgeText = 'Faltou (+20% Gordura)';
                  BadgeIcon = Flame;
                } else if (deveComprar) {
                  badgeClass = 'normal';
                  badgeText = 'Reposição Padrão';
                  BadgeIcon = TrendingUp;
                }

                return (
                  <tr key={item.id} id={`row-ingrediente-${item.id}`}>
                    <td>
                      <div className="ingrediente-cell">
                        <span className="ingrediente-nome">{item.nome}</span>
                        {item.observacao && (
                          <span className="ingrediente-obs">{item.observacao}</span>
                        )}
                      </div>
                    </td>

                    <td>
                      <span style={{
                        fontWeight: 600,
                        color: 'var(--amber-light)',
                        background: 'rgba(245, 158, 11, 0.1)',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '0.85rem'
                      }}>
                        {item.unidade}
                      </span>
                    </td>

                    <td>
                      <strong>{calc.meta !== undefined ? parseFloat(calc.meta).toString() : item.meta}</strong> {item.unidade}
                    </td>

                    <td>
                      <span style={{ color: item.estoque_atual <= 0 ? 'var(--rose-danger)' : 'inherit' }}>
                        {calc.estoque_atual !== undefined ? parseFloat(calc.estoque_atual).toString() : item.estoque_atual} {item.unidade}
                      </span>
                    </td>

                    <td>
                      <span className={`status-badge ${badgeClass}`}>
                        <BadgeIcon size={13} />
                        {badgeText}
                      </span>
                    </td>

                    <td>
                      {deveComprar ? (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 700, color: 'var(--amber-primary)', fontSize: '0.95rem' }}>
                            {calc.quantidade_formatada} {item.unidade}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {calc.regra_aplicada === 'VENCIDO' && 'Meta cheia'}
                            {calc.regra_aplicada === 'FALTA_NO_MES' && '+20% gordurinha'}
                            {calc.regra_aplicada === 'NORMAL' && 'Meta - Sobra'}
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                          — (Nada a comprar)
                        </span>
                      )}
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      <div className="toggle-switch-group" style={{ justifyContent: 'center' }}>
                        <button
                          type="button"
                          className={`quick-toggle-btn ${item.vencido ? 'active-vencido' : ''}`}
                          title="Marcar/Desmarcar se o ingrediente venceu/estragou no mês"
                          onClick={() => onToggleVencido(item.id)}
                        >
                          <AlertTriangle size={13} />
                          <span>{item.vencido ? 'Vencido!' : 'Venceu?'}</span>
                        </button>

                        <button
                          type="button"
                          className={`quick-toggle-btn ${item.faltou_no_meio_do_mes ? 'active-falta' : ''}`}
                          title="Marcar/Desmarcar se faltou no meio do mês (+20% gordura)"
                          onClick={() => onToggleFaltaMes(item.id)}
                        >
                          <Flame size={13} />
                          <span>{item.faltou_no_meio_do_mes ? 'Faltou!' : 'Faltou?'}</span>
                        </button>
                      </div>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        <button
                          className="btn btn-secondary btn-icon-only"
                          title="Editar Ingrediente"
                          onClick={() => onEdit(item)}
                        >
                          <Edit2 size={15} />
                        </button>

                        <button
                          className="btn btn-danger btn-icon-only"
                          title="Excluir Ingrediente"
                          onClick={() => onDelete(item.id, item.nome)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
