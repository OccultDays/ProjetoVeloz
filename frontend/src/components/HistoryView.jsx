import React, { useState } from 'react';
import { Calendar, CheckCircle, Trash2, AlertTriangle, X } from 'lucide-react';

export default function HistoryView({ historico = [], onDeleteHistorico, loading = false }) {
  const [itemParaApagar, setItemParaApagar] = useState(null);

  const handleConfirmarExclusao = () => {
    if (!itemParaApagar) return;
    onDeleteHistorico(itemParaApagar.id);
    setItemParaApagar(null);
  };

  return (
    <div className="shopping-list-container" style={{ position: 'relative' }}>
      {/* Aviso de Confirmação Integrado na Interface (Substitui window.confirm) */}
      {itemParaApagar && (
        <div className="modal-overlay" onClick={() => setItemParaApagar(null)}>
          <div
            className="modal-content"
            style={{ maxWidth: '480px', textAlign: 'center', padding: '2rem' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              color: 'var(--rose-danger)',
              boxShadow: '0 0 20px rgba(244, 63, 94, 0.25)'
            }}>
              <AlertTriangle size={32} />
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.6rem', color: '#ffffff' }}>
              Apagar Lista do Histórico?
            </h3>

            <p style={{
              fontSize: '0.9rem',
              color: 'var(--text-secondary)',
              marginBottom: '1.75rem',
              lineHeight: 1.5
            }}>
              Tem certeza que deseja apagar a lista de compras arquivada em{' '}
              <strong style={{ color: '#ffffff' }}>{itemParaApagar.data_formatada}</strong> ({itemParaApagar.total_itens} itens)? Esta ação removerá o registro permanentemente do sistema.
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                id="btn-cancelar-apagar-historico"
                type="button"
                className="btn btn-secondary"
                style={{ flex: 1, padding: '0.7rem 1rem' }}
                onClick={() => setItemParaApagar(null)}
                disabled={loading}
              >
                Cancelar
              </button>

              <button
                id="btn-confirmar-apagar-historico"
                type="button"
                className="btn btn-danger"
                style={{ flex: 1, padding: '0.7rem 1rem' }}
                onClick={handleConfirmarExclusao}
                disabled={loading}
              >
                <Trash2 size={16} />
                <span>{loading ? 'Apagando...' : 'Sim, Apagar'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="list-header-banner">
        <div>
          <h2>Histórico de Listas de Compras Arquivadas</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            Registro de todas as listas geradas para controle de compras passadas do Seu Raimundo.
          </p>
        </div>
      </div>

      {historico.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📜</div>
          <h3>Nenhum histórico arquivado ainda</h3>
          <p>
            Vá até a aba "Lista de Compras" e clique em "Arquivar no Histórico" para salvar a lista deste mês.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {historico.map((item) => (
            <div
              key={item.id}
              id={`card-historico-${item.id}`}
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                transition: 'border-color 0.2s ease',
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.75rem',
                flexWrap: 'wrap',
                gap: '0.75rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={16} color="var(--amber-primary)" />
                  <strong style={{ fontSize: '1rem' }}>{item.data_formatada}</strong>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className="status-badge normal">
                    <CheckCircle size={13} />
                    {item.total_itens} {item.total_itens === 1 ? 'item comprado' : 'itens comprados'}
                  </span>

                  <button
                    id={`btn-apagar-historico-${item.id}`}
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => setItemParaApagar(item)}
                    title="Apagar esta lista do histórico"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                  >
                    <Trash2 size={14} />
                    <span>Apagar Lista</span>
                  </button>
                </div>
              </div>

              <div className="list-code-block" style={{ fontSize: '0.95rem', marginBottom: 0 }}>
                {item.conteudo_texto}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
