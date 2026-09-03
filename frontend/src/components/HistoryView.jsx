import React from 'react';
import { Calendar, Package, FileText, CheckCircle } from 'lucide-react';

export default function HistoryView({ historico = [] }) {
  return (
    <div className="shopping-list-container">
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
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={16} color="var(--amber-primary)" />
                  <strong style={{ fontSize: '1rem' }}>{item.data_formatada}</strong>
                </div>

                <span className="status-badge normal">
                  <CheckCircle size={13} />
                  {item.total_itens} {item.total_itens === 1 ? 'item comprado' : 'itens comprados'}
                </span>
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
