import React, { useState } from 'react';
import { X, CheckSquare, Square, CheckCircle2 } from 'lucide-react';

export default function FeiraModeModal({ 
  isOpen, 
  onClose, 
  itensParaComprar = [], 
  onConfirmarCompra,
  loading = false 
}) {
  const [comprados, setComprados] = useState({});

  if (!isOpen) return null;

  const toggleComprado = (id) => {
    setComprados((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const totalComprados = Object.values(comprados).filter(Boolean).length;
  const totalItens = itensParaComprar.length;
  const progresso = totalItens > 0 ? Math.round((totalComprados / totalItens) * 100) : 0;
  const isComplete = progresso === 100 && totalItens > 0;

  const handleConfirmar = () => {
    if (!isComplete || loading) return;
    const certeza = window.confirm(
      'Tem certeza que deseja confirmar a compra de todos os itens e atualizar o estoque automaticamente?'
    );
    if (certeza) {
      onConfirmarCompra();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="brand-logo-badge" style={{ width: '36px', height: '36px', fontSize: '1.2rem' }}>
              🧺
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem' }}>Lista Interativa</h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Checklist dinâmico de compras com unidades de medida
              </p>
            </div>
          </div>

          <button 
            type="button" 
            className="btn btn-secondary btn-icon-only" 
            onClick={onClose}
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Progress Bar */}
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.04)', 
            padding: '0.85rem 1.25rem', 
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
              <span>Progresso das Compras</span>
              <strong style={{ color: isComplete ? 'var(--emerald-success)' : 'var(--amber-light)' }}>
                {totalComprados} de {totalItens} ({progresso}%)
              </strong>
            </div>
            <div style={{ width: '100%', height: '8px', background: '#1f2937', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ 
                width: `${progresso}%`, 
                height: '100%', 
                background: isComplete 
                  ? 'var(--emerald-success)' 
                  : 'linear-gradient(90deg, var(--amber-primary), var(--emerald-success))',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>

          {/* Checklist */}
          <div className="feira-checklist">
            {itensParaComprar.map((item, idx) => {
              const isChecked = !!comprados[item.id || idx];
              return (
                <div
                  key={item.id || idx}
                  className={`feira-item ${isChecked ? 'comprado' : ''}`}
                  onClick={() => toggleComprado(item.id || idx)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    {isChecked ? (
                      <CheckSquare size={22} color="var(--emerald-success)" />
                    ) : (
                      <Square size={22} color="var(--text-muted)" />
                    )}
                    <div>
                      <div className="feira-item-text">
                        {item.texto_formatado}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {item.regra_aplicada === 'VENCIDO' && 'Motivo: Lote anterior estragou'}
                        {item.regra_aplicada === 'FALTA_NO_MES' && 'Motivo: Faltou no meio do mês (+20%)'}
                        {item.regra_aplicada === 'NORMAL' && 'Motivo: Reposição de rotina'}
                      </span>
                    </div>
                  </div>

                  <span style={{ 
                    fontSize: '0.85rem', 
                    fontWeight: 700,
                    color: isChecked ? 'var(--emerald-success)' : 'var(--amber-light)'
                  }}>
                    {item.quantidade_formatada} {item.unidade}
                  </span>
                </div>
              );
            })}
          </div>

          {isComplete && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              animation: 'fadeIn 0.25s ease-out'
            }}>
              <CheckCircle2 size={24} color="var(--emerald-success)" />
              <div>
                <strong style={{ color: 'var(--emerald-success)' }}>Lista 100% concluída!</strong>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Clique no botão <strong>Confirmar</strong> abaixo para atualizar automaticamente o estoque do restaurante.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            {isComplete ? (
              <span style={{ color: 'var(--emerald-success)', fontWeight: 600 }}>
                ✓ Checklist concluído
              </span>
            ) : (
              <span>Marque todos os itens para liberar confirmação</span>
            )}
          </span>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Fechar
            </button>

            <button
              id="btn-confirmar-estoque"
              type="button"
              className="btn btn-success"
              onClick={handleConfirmar}
              disabled={!isComplete || loading}
              title={isComplete ? 'Confirmar e atualizar estoque' : 'Complete 100% da lista para habilitar'}
              style={{
                opacity: isComplete ? 1 : 0.3,
                cursor: isComplete ? 'pointer' : 'not-allowed',
                boxShadow: isComplete ? '0 4px 14px var(--emerald-glow)' : 'none',
                filter: isComplete ? 'none' : 'grayscale(0.7)',
                pointerEvents: isComplete ? 'auto' : 'none',
                transition: 'all 0.3s ease',
              }}
            >
              <CheckCircle2 size={17} />
              <span>{loading ? 'Atualizando...' : 'Confirmar'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
