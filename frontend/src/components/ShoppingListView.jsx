import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  Download, 
  Smartphone, 
  RefreshCw, 
  Archive, 
  AlertTriangle, 
  Flame, 
  TrendingUp,
  FileText
} from 'lucide-react';

export default function ShoppingListView({
  shoppingData,
  onOpenFeiraMode,
  onAtualizarMetas,
  onSalvarHistorico,
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

  const handleDownloadTxt = () => {
    const blob = new Blob([texto_final || 'Nenhum item para comprar.'], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lista_compras_seu_raimundo_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="shopping-list-container">
      {/* Header Banner */}
      <div className="list-header-banner">
        <div>
          <h2>Lista de Compras Oficial do Mês</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            Formato de saída gerado pelo backend Django: <code style={{ color: 'var(--amber-light)' }}>Comprar: &lt;quantidade&gt; &lt;unidade&gt; de &lt;ingrediente&gt;</code>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            id="btn-copy-shopping-list"
            className="btn btn-primary"
            onClick={handleCopy}
            disabled={total_itens_a_comprar === 0}
          >
            {copied ? <Check size={16} color="#059669" /> : <Copy size={16} />}
            <span>{copied ? 'Copiado para WhatsApp!' : 'Copiar Lista'}</span>
          </button>

          <button
            id="btn-download-txt"
            className="btn btn-secondary"
            onClick={handleDownloadTxt}
            disabled={total_itens_a_comprar === 0}
          >
            <Download size={16} />
            <span>Baixar TXT</span>
          </button>

          <button
            id="btn-open-feira-mode"
            className="btn btn-success"
            onClick={onOpenFeiraMode}
            disabled={total_itens_a_comprar === 0}
          >
            <Smartphone size={16} />
            <span>Modo "Rapaz da Feira"</span>
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
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                SAÍDA CONFORME O EDITAL (UM ITEM POR LINHA):
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--amber-light)', fontWeight: 600 }}>
                {total_itens_a_comprar} {total_itens_a_comprar === 1 ? 'item' : 'itens'} a comprar
              </span>
            </div>

            <div className="list-code-block" id="strict-output-text">
              {texto_final}
            </div>
          </div>

          {/* Ações Avançadas */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            flexWrap: 'wrap', 
            gap: '1rem',
            background: 'rgba(255, 255, 255, 0.02)',
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '2rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={18} color="var(--indigo-accent)" />
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Deseja salvar esta lista como histórico ou ajustar as metas?
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                id="btn-adjust-metas"
                className="btn btn-secondary btn-sm"
                onClick={onAtualizarMetas}
                disabled={loading}
                title="Aplica a nova meta com +20% para os itens que faltaram no mês"
              >
                <RefreshCw size={14} />
                <span>Atualizar Metas (+20% Gordura)</span>
              </button>

              <button
                id="btn-save-history"
                className="btn btn-secondary btn-sm"
                onClick={onSalvarHistorico}
                disabled={loading}
              >
                <Archive size={14} />
                <span>Arquivar no Histórico</span>
              </button>
            </div>
          </div>

          {/* Cards Detalhados dos Itens com Justificativa das Regras */}
          <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>
            Detalhamento e Justificativas de Cálculo (Seu Raimundo)
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
                      {item.regra_aplicada === 'FALTA_NO_MES' && '+20% GORDURA'}
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
