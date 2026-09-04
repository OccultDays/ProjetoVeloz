import React, { useState, useEffect } from 'react';
import { X, Save, Search, Boxes, CheckCircle2, TrendingUp, AlertTriangle } from 'lucide-react';

export default function BulkStockModal({
  isOpen,
  onClose,
  ingredientes = [],
  onSaveBulk,
  loading = false
}) {
  const [stockValues, setStockValues] = useState({});
  const [filterQuery, setFilterQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      const initialMap = {};
      ingredientes.forEach((item) => {
        initialMap[item.id] = item.estoque_atual !== undefined ? item.estoque_atual : 0;
      });
      setStockValues(initialMap);
      setFilterQuery('');
    }
  }, [isOpen, ingredientes]);

  if (!isOpen) return null;

  const handleStockChange = (id, value) => {
    setStockValues((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleQuickFillMeta = (id, meta) => {
    setStockValues((prev) => ({
      ...prev,
      [id]: meta,
    }));
  };

  const handleQuickFillZero = (id) => {
    setStockValues((prev) => ({
      ...prev,
      [id]: 0,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = Object.entries(stockValues).map(([id, val]) => ({
      id: parseInt(id, 10),
      estoque_atual: parseFloat(val) || 0,
    }));
    onSaveBulk(payload);
  };

  const filteredList = ingredientes.filter((item) =>
    item.nome.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content bulk-stock-modal-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="brand-logo-badge" style={{ width: '38px', height: '38px', fontSize: '1.2rem' }}>
              📦
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem' }}>Atualizar Estoque Geral</h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Altere a sobra/estoque atual de todos os itens e salve tudo de uma vez
              </p>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-icon-only"
            onClick={onClose}
            aria-label="Fechar"
            disabled={loading}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
            {/* Search filter inside modal */}
            <div className="search-input-wrapper" style={{ width: '100%', minWidth: '100%', marginBottom: '0.75rem' }}>
              <Search size={16} />
              <input
                type="text"
                className="search-input"
                placeholder="Filtrar ingredientes nesta lista..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filteredList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  Nenhum ingrediente corresponde à busca.
                </div>
              ) : (
                filteredList.map((item) => {
                  const currentVal = stockValues[item.id] !== undefined ? stockValues[item.id] : item.estoque_atual;
                  const numVal = parseFloat(currentVal) || 0;
                  const numMeta = parseFloat(item.meta) || 0;
                  const dif = numMeta - numVal;

                  return (
                    <div
                      key={item.id}
                      className="bulk-stock-item-row"
                    >
                      <div className="bulk-item-info">
                        <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{item.nome}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          Meta: <strong style={{ color: 'var(--text-secondary)' }}>{item.meta} {item.unidade}</strong>
                          {item.vencido && (
                            <span style={{ color: 'var(--rose-danger)', marginLeft: '6px' }}>
                              (Vencido)
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="bulk-item-controls">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <input
                            type="number"
                            step="any"
                            min="0"
                            className="form-input bulk-num-input"
                            value={currentVal}
                            onChange={(e) => handleStockChange(item.id, e.target.value)}
                          />
                          <span style={{ fontSize: '0.85rem', color: 'var(--amber-light)', fontWeight: 600, minWidth: '28px' }}>
                            {item.unidade}
                          </span>
                        </div>

                        {/* Quick Action Helpers */}
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.45rem 0.65rem', fontSize: '0.75rem' }}
                            title="Zerar estoque deste item"
                            onClick={() => handleQuickFillZero(item.id)}
                          >
                            0
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.45rem 0.65rem', fontSize: '0.75rem' }}
                            title="Preencher com o valor da meta"
                            onClick={() => handleQuickFillMeta(item.id, item.meta)}
                          >
                            Meta
                          </button>
                        </div>
                      </div>

                      {/* Status indicator */}
                      <div className="bulk-item-status">
                        {dif > 0 ? (
                          <span style={{ color: 'var(--amber-light)', fontWeight: 600 }}>
                            Comprar: {dif.toFixed(2).replace(/\.00$/, '')} {item.unidade}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--emerald-success)', fontWeight: 500 }}>
                            ✓ Suficiente
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="modal-footer" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {ingredientes.length} ingrediente(s)
            </span>

            <div style={{ display: 'flex', gap: '0.75rem', width: 'auto' }} className="modal-footer-btns">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                <Save size={16} />
                <span>{loading ? 'Salvando...' : 'Salvar Estoques'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
