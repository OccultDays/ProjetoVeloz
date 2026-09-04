import React, { useState, useEffect } from 'react';
import { X, CheckSquare, Square, CheckCircle2, AlertCircle, Search } from 'lucide-react';

export default function FeiraModeModal({
  isOpen,
  onClose,
  itensParaComprar = [],
  onConfirmarCompra,
  loading = false
}) {
  const [comprados, setComprados] = useState({});
  const [filterQuery, setFilterQuery] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Reseta estado ao abrir/fechar
  useEffect(() => {
    if (!isOpen) {
      setShowConfirmDialog(false);
      setFilterQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleComprado = (id) => {
    setComprados((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleMarcarTodos = () => {
    const todos = {};
    itensParaComprar.forEach((item, idx) => {
      todos[item.id || idx] = true;
    });
    setComprados(todos);
  };

  const handleDesmarcarTodos = () => {
    setComprados({});
  };

  const totalComprados = Object.values(comprados).filter(Boolean).length;
  const totalItens = itensParaComprar.length;
  const progresso = totalItens > 0 ? Math.round((totalComprados / totalItens) * 100) : 0;
  const isComplete = progresso === 100 && totalItens > 0;

  const handleOpenConfirm = () => {
    if (!isComplete || loading) return;
    setShowConfirmDialog(true);
  };

  const handleExecutarConfirmacao = () => {
    setShowConfirmDialog(false);
    onConfirmarCompra();
  };

  const filteredItens = itensParaComprar.filter((item) =>
    (item.nome || item.texto_formatado || '').toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="modal-overlay" onClick={() => !showConfirmDialog && onClose()}>
      <div
        className="modal-content"
        style={{ position: 'relative' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Aviso de Confirmação Integrado na Interface */}
        {showConfirmDialog && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(11, 15, 25, 0.96)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            zIndex: 30,
            borderRadius: 'var(--radius-lg)',
            animation: 'fadeIn 0.2s ease-out',
            textAlign: 'center',
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem',
              color: 'var(--emerald-success)',
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.25)'
            }}>
              <AlertCircle size={34} />
            </div>

            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.6rem', color: '#ffffff' }}>
              Confirmar Compra dos Itens?
            </h3>

            <p style={{
              fontSize: '0.92rem',
              color: 'var(--text-secondary)',
              maxWidth: '440px',
              marginBottom: '1.75rem',
              lineHeight: 1.5
            }}>
              Você marcou todos os <strong>{totalItens} itens</strong> como comprados.
              Tem certeza que deseja confirmar e <strong>atualizar o estoque automaticamente</strong> com as novas metas do Seu Raimundo?
            </p>

            <div style={{ display: 'flex', gap: '1rem', width: '100%', maxWidth: '380px' }}>
              <button
                id="btn-cancelar-aviso-confirmacao"
                type="button"
                className="btn btn-secondary"
                style={{ flex: 1, padding: '0.75rem 1rem' }}
                onClick={() => setShowConfirmDialog(false)}
                disabled={loading}
              >
                Cancelar
              </button>

              <button
                id="btn-aceitar-aviso-confirmacao"
                type="button"
                className="btn btn-primary"
                style={{ flex: 1, padding: '0.75rem 1rem' }}
                onClick={handleExecutarConfirmacao}
                disabled={loading}
              >
                <CheckCircle2 size={18} />
                <span>{loading ? 'Atualizando...' : 'Sim, Atualizar'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Cabeçalho Padronizado */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="brand-logo-badge" style={{ width: '38px', height: '38px', fontSize: '1.2rem' }}>
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
            disabled={showConfirmDialog || loading}
          >
            <X size={18} />
          </button>
        </div>

        {/* Corpo com Rolagem e Filtro Interno */}
        <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {/* Busca interna */}
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

          {/* Barra de Progresso & Ações Rápidas */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.04)',
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span>Progresso das Compras</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <strong style={{ color: isComplete ? 'var(--emerald-success)' : 'var(--amber-light)' }}>
                  {totalComprados} de {totalItens} ({progresso}%)
                </strong>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '0.25rem 0.55rem', fontSize: '0.72rem' }}
                    onClick={handleMarcarTodos}
                    title="Marcar todos os itens como comprados"
                  >
                    Todos
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '0.25rem 0.55rem', fontSize: '0.72rem' }}
                    onClick={handleDesmarcarTodos}
                    title="Desmarcar todos os itens"
                  >
                    Limpar
                  </button>
                </div>
              </div>
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

          {/* Checklist de Itens */}
          <div className="feira-checklist">
            {filteredItens.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                Nenhum ingrediente corresponde à busca.
              </div>
            ) : (
              filteredItens.map((item, idx) => {
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
              })
            )}
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
                  Clique em <strong>Confirmar</strong> abaixo para atualizar automaticamente o estoque do restaurante.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé Padronizado */}
        <div className="modal-footer" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {isComplete ? (
              <span style={{ color: 'var(--emerald-success)', fontWeight: 600 }}>
                ✓ Checklist concluído
              </span>
            ) : (
              <span>{totalComprados} de {totalItens} item(ns) marcado(s)</span>
            )}
          </span>

          <div style={{ display: 'flex', gap: '0.75rem', width: 'auto' }} className="modal-footer-btns">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading || showConfirmDialog}
            >
              Cancelar
            </button>

            <button
              id="btn-confirmar-estoque"
              type="button"
              className="btn btn-primary"
              onClick={handleOpenConfirm}
              disabled={!isComplete || loading}
              title={isComplete ? 'Confirmar compra e atualizar estoque' : 'Marque todos os itens para habilitar'}
              style={{
                opacity: isComplete ? 1 : 0.4,
                cursor: isComplete ? 'pointer' : 'not-allowed',
              }}
            >
              <CheckCircle2 size={16} />
              <span>{loading ? 'Atualizando...' : 'Confirmar'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
