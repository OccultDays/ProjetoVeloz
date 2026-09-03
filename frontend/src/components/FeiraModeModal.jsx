import React, { useState } from 'react';
import { X, CheckSquare, Square, ShoppingCart, CheckCircle2 } from 'lucide-react';

export default function FeiraModeModal({ isOpen, onClose, itensParaComprar }) {
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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="brand-logo-badge" style={{ width: '36px', height: '36px', fontSize: '1.2rem' }}>
              🧺
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem' }}>Modo "Rapaz da Feira"</h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Checklist interativo com unidades de medida exatas
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
              <strong style={{ color: 'var(--emerald-success)' }}>{totalComprados} de {totalItens} ({progresso}%)</strong>
            </div>
            <div style={{ width: '100%', height: '8px', background: '#1f2937', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ 
                width: `${progresso}%`, 
                height: '100%', 
                background: 'linear-gradient(90deg, var(--amber-primary), var(--emerald-success))',
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

          {progresso === 100 && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              padding: '1rem',
              borderRadius: 'var(--radius-md)'
            }}>
              <CheckCircle2 size={24} color="var(--emerald-success)" />
              <div>
                <strong style={{ color: 'var(--emerald-success)' }}>Tudo comprado na feira!</strong>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  O Seu Raimundo já pode reabastecer a cozinha para o novo mês.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
