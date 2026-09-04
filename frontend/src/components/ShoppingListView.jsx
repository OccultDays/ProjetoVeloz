import React, { useState } from 'react';
import {
  Copy,
  Check,
  Smartphone,
  AlertTriangle,
  Flame,
  TrendingUp
} from 'lucide-react';

export default function ShoppingListView({
  shoppingData,
  onOpenFeiraMode,
  onAtualizarMetas,
  onSalvarHistorico,
  onRefresh,
  loading,
}) {
  const [copied, setCopied] = useState(false);

  const {
    total_itens_a_comprar = 0,
    linhas_texto = [],
    texto_final = '',
    itens_para_comprar = [],
  } = shoppingData || {};

  const handleCopy = () => {
    if (!texto_final) return;
    navigator.clipboard.writeText(texto_final);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="shopping-list-container">
      {/* Banner */}
      <div className="list-header-banner">
        <div>
          <h2>Lista de Compras Oficial do Mês</h2>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            id="btn-copy-shopping-list"
            className="btn btn-primary"
            onClick={handleCopy}
            disabled={total_itens_a_comprar === 0}
          >
            {copied ? <Check size={16} color="#059669" /> : <Copy size={16} />}
            <span>{copied ? 'Copiado!' : 'Copiar Lista'}</span>
          </button>

          <button
            id="btn-open-feira-mode"
            className="btn btn-success"
            onClick={onOpenFeiraMode}
            disabled={total_itens_a_comprar === 0}
          >
            <Smartphone size={16} />
            <span>Lista Interativa</span>
          </button>
        </div>
      </div>

      {total_itens_a_comprar === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🎉</div>
          <h3>Estoque totalmente abastecido!</h3>
          <p>Nenhum ingrediente necessita de compra neste ciclo mensal.</p>
        </div>
      ) : (
        <>
          {/* Saída Estrita do Desafio Técnico */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--amber-light)', fontWeight: 600 }}>
                {total_itens_a_comprar} {total_itens_a_comprar === 1 ? 'item' : 'itens'} a comprar
              </span>
            </div>

            <div className="list-code-block" id="strict-output-text">
              {texto_final}
            </div>
          </div>

          {/* Cards dos Itens com Justificativa das Regras */}
          <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>
            Detalhamento e Justificativas de Cálculo:
          </h3>

          <div className="shopping-items-grid">
            {itens_para_comprar.map((item, idx) => {
              let cardType = 'normal';
              let Icon = TrendingUp;
              let badgeColor = 'var(--emerald-success)';

              if (item.regra_aplicada === 'VENCIDO') {
                cardType = 'vencido';
                Icon = AlertTriangle;
                badgeColor = 'var(--rose-danger)';
              } else if (item.regra_aplicada === 'FALTA_NO_MES') {
                cardType = 'falta';
                Icon = Flame;
                badgeColor = 'var(--orange-warning)';
              }

              return (
                <div key={idx} className={`shopping-item-card ${cardType}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span className="shopping-item-title">{item.nome}</span>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: badgeColor,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <Icon size={13} />
                      {item.regra_aplicada === 'VENCIDO' && 'VENCIDO'}
                      {item.regra_aplicada === 'FALTA_NO_MES' && '+20% '}
                      {item.regra_aplicada === 'NORMAL' && 'NORMAL'}
                    </span>
                  </div>

                  <div style={{
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    color: '#ffffff',
                    fontFamily: 'var(--font-heading)'
                  }}>
                    {item.texto_formatado}
                  </div>

                  <p className="shopping-item-reason">
                    {item.motivo}
                  </p>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
