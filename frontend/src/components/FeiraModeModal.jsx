import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  CheckSquare, 
  Square, 
  CheckCircle2, 
  Search, 
  ShoppingBag, 
  Sparkles, 
  Check, 
  RotateCcw 
} from 'lucide-react';

export default function FeiraModeModal({ 
  isOpen, 
  onClose, 
  itensParaComprar = [], 
  onConfirmarCompra,
  loading = false 
}) {
  const [comprados, setComprados] = useState({});
  const [exibirConfirmacao, setExibirConfirmacao] = useState(false);
  const [termoBusca, setTermoBusca] = useState('');
  const [abaAtiva, setAbaAtiva] = useState('todos'); // 'todos' | 'pendentes' | 'comprados'

  // Trava a rolagem da página de fundo quando o modal estiver aberto no mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
      setExibirConfirmacao(false);
      setTermoBusca('');
      setAbaAtiva('todos');
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const totalItens = itensParaComprar.length;
  const totalComprados = Object.values(comprados).filter(Boolean).length;
  const totalPendentes = totalItens - totalComprados;
  const progresso = totalItens > 0 ? Math.round((totalComprados / totalItens) * 100) : 0;
  const estaCompleto = progresso === 100 && totalItens > 0;

  const alternarComprado = (identificador) => {
    setComprados((anterior) => ({
      ...anterior,
      [identificador]: !anterior[identificador],
    }));
  };

  const handleMarcarTodos = () => {
    const novoEstado = {};
    itensParaComprar.forEach((item, idx) => {
      novoEstado[item.id || idx] = true;
    });
    setComprados(novoEstado);
  };

  const handleDesmarcarTodos = () => {
    setComprados({});
  };

  const handleOpenConfirm = () => {
    if (!estaCompleto || loading) return;
    setExibirConfirmacao(true);
  };

  const handleExecutarConfirmacao = () => {
    setExibirConfirmacao(false);
    onConfirmarCompra();
  };

  // Filtragem dos itens por busca e aba
  const itensFiltrados = useMemo(() => {
    return itensParaComprar.filter((item, idx) => {
      const id = item.id || idx;
      const marcado = !!comprados[id];

      // Filtro da aba
      if (abaAtiva === 'pendentes' && marcado) return false;
      if (abaAtiva === 'comprados' && !marcado) return false;

      // Filtro de texto da busca
      if (termoBusca.trim()) {
        const termo = termoBusca.toLowerCase();
        const nomeMatch = (item.nome || '').toLowerCase().includes(termo);
        const textoMatch = (item.texto_formatado || '').toLowerCase().includes(termo);
        return nomeMatch || textoMatch;
      }

      return true;
    });
  }, [itensParaComprar, comprados, abaAtiva, termoBusca]);

  return (
    <div className="modal-overlay" onClick={() => !exibirConfirmacao && onClose()}>
      <div 
        id="modal-lista-interativa-conteudo"
        className="modal-content modal-lista-interativa" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Diálogo de Confirmação Integrado na Interface (Touch-Friendly) */}
        {exibirConfirmacao && (
          <div 
            id="dialogo-confirmacao-compra"
            className="dialogo-confirmacao-interativo"
          >
            <div className="icone-alerta-confirmacao">
              <Sparkles size={36} />
            </div>

            <h3 className="titulo-confirmacao-interativo">
              Confirmar Compras do Mês?
            </h3>

            <p className="texto-confirmacao-interativo">
              Você marcou todos os <strong>{totalItens} itens</strong> como comprados!
              Ao confirmar, o sistema atualizará automaticamente o estoque com as quantidades repostas e as novas metas de segurança do Seu Raimundo.
            </p>

            <div className="botoes-confirmacao-interativo">
              <button
                id="btn-aceitar-aviso-confirmacao"
                type="button"
                className="btn btn-success btn-touch-largo"
                onClick={handleExecutarConfirmacao}
                disabled={loading}
              >
                <CheckCircle2 size={20} />
                <span>{loading ? 'Atualizando...' : 'Sim, Atualizar Estoque'}</span>
              </button>

              <button
                id="btn-cancelar-aviso-confirmacao"
                type="button"
                className="btn btn-secondary btn-touch-largo"
                onClick={() => setExibirConfirmacao(false)}
                disabled={loading}
              >
                Voltar ao Checklist
              </button>
            </div>
          </div>
        )}

        {/* 1. Cabeçalho Fixo do Modal */}
        <div className="modal-header cabecalho-lista-interativa">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="brand-logo-badge" style={{ width: '40px', height: '40px', fontSize: '1.25rem' }}>
              🧺
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Lista Interativa</h2>
                <span className="badge-feira-mobile">Modo Feira</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Checklist em tempo real para compras no mercado
              </p>
            </div>
          </div>

          <button 
            id="btn-fechar-lista-interativa"
            type="button" 
            className="btn btn-secondary btn-icon-only" 
            onClick={onClose}
            aria-label="Fechar Lista Interativa"
            disabled={exibirConfirmacao || loading}
          >
            <X size={20} />
          </button>
        </div>

        {/* 2. Barra de Progresso e Filtros Fixos */}
        <div className="secao-progresso-interativa">
          {/* Indicador visual de progresso */}
          <div className="topo-progresso-interativa">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShoppingBag size={16} color={estaCompleto ? 'var(--emerald-success)' : 'var(--amber-light)'} />
              <span style={{ fontSize: '0.86rem', fontWeight: 600 }}>Progresso</span>
            </div>
            <strong className={`texto-progresso-contador ${estaCompleto ? 'concluido' : ''}`}>
              {totalComprados} de {totalItens} ({progresso}%)
            </strong>
          </div>

          <div className="barra-progresso-trilho">
            <div 
              className={`barra-progresso-preenchimento ${estaCompleto ? 'completo' : ''}`}
              style={{ width: `${progresso}%` }} 
            />
          </div>

          {/* Abas e Busca para Mobile */}
          <div className="barra-controles-interativa">
            {/* Abas de Filtro Touch */}
            <div className="abas-filtro-interativa">
              <button
                id="aba-filtro-todos"
                type="button"
                className={`btn-aba-filtro ${abaAtiva === 'todos' ? 'ativo' : ''}`}
                onClick={() => setAbaAtiva('todos')}
              >
                Todos ({totalItens})
              </button>
              <button
                id="aba-filtro-pendentes"
                type="button"
                className={`btn-aba-filtro ${abaAtiva === 'pendentes' ? 'ativo' : ''}`}
                onClick={() => setAbaAtiva('pendentes')}
              >
                Pendentes ({totalPendentes})
              </button>
              <button
                id="aba-filtro-comprados"
                type="button"
                className={`btn-aba-filtro ${abaAtiva === 'comprados' ? 'ativo' : ''}`}
                onClick={() => setAbaAtiva('comprados')}
              >
                Comprados ({totalComprados})
              </button>
            </div>

            {/* Ação rápida marcar/desmarcar todos */}
            <div className="acoes-rapidas-interativa">
              {totalComprados < totalItens ? (
                <button
                  type="button"
                  className="link-acao-rapida"
                  onClick={handleMarcarTodos}
                >
                  <Check size={13} />
                  <span>Marcar todos</span>
                </button>
              ) : (
                <button
                  type="button"
                  className="link-acao-rapida"
                  onClick={handleDesmarcarTodos}
                >
                  <RotateCcw size={13} />
                  <span>Desmarcar todos</span>
                </button>
              )}
            </div>
          </div>

          {/* Campo de Busca Rápida Opcional */}
          {totalItens > 4 && (
            <div className="campo-busca-interativa">
              <Search size={15} color="var(--text-muted)" />
              <input
                id="input-busca-lista-interativa"
                type="text"
                placeholder="Buscar ingrediente..."
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
              />
              {termoBusca && (
                <button
                  id="btn-limpar-busca-interativa"
                  type="button"
                  className="btn-limpar-busca"
                  onClick={() => setTermoBusca('')}
                  aria-label="Limpar busca"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* 3. Corpo Rolável com os Cards Touch-First (Scroll Nativo Perfeito no Celular) */}
        <div 
          id="corpo-rolavel-lista-interativa"
          className="corpo-rolavel-interativa"
        >
          {itensFiltrados.length === 0 ? (
            <div className="estado-vazio-interativo">
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔍</div>
              <p style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                Nenhum ingrediente encontrado nesta visualização.
              </p>
              {termoBusca && (
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm" 
                  style={{ marginTop: '0.75rem' }}
                  onClick={() => setTermoBusca('')}
                >
                  Limpar busca
                </button>
              )}
            </div>
          ) : (
            <div className="lista-itens-interativa">
              {itensFiltrados.map((item, idx) => {
                const idItem = item.id || idx;
                const estaMarcado = !!comprados[idItem];

                return (
                  <div
                    key={idItem}
                    id={`item-interativo-${idItem}`}
                    className={`card-item-interativo ${estaMarcado ? 'item-marcado' : ''}`}
                    onClick={() => alternarComprado(idItem)}
                    role="button"
                    tabIndex={0}
                  >
                    {/* Checkbox Touch Amplo */}
                    <div className="checkbox-touch-area">
                      {estaMarcado ? (
                        <CheckSquare size={26} color="var(--emerald-success)" />
                      ) : (
                        <Square size={26} color="var(--text-muted)" />
                      )}
                    </div>

                    {/* Informações Centrais do Ingrediente */}
                    <div className="info-item-interativo">
                      <div className="linha-titulo-item">
                        <span className="nome-item-interativo">
                          {item.nome}
                        </span>
                      </div>

                      {/* Tag explicativa da regra de cálculo */}
                      <div className="rotulos-regra-container">
                        {item.regra_aplicada === 'VENCIDO' && (
                          <span className="rotulo-regra-interativo tag-vencido">
                            Lote anterior estragou (repor meta cheia)
                          </span>
                        )}
                        {item.regra_aplicada === 'FALTA_NO_MES' && (
                          <span className="rotulo-regra-interativo tag-falta">
                            Acabou no meio do mês (+20% margem)
                          </span>
                        )}
                        {item.regra_aplicada === 'NORMAL' && (
                          <span className="rotulo-regra-interativo tag-normal">
                            Reposição regular de rotina
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Badge da Quantidade a Comprar */}
                    <div className={`badge-quantidade-interativa ${estaMarcado ? 'quantidade-marcada' : ''}`}>
                      <span className="valor-quantidade">
                        {item.quantidade_formatada}
                      </span>
                      <span className="unidade-quantidade">
                        {item.unidade}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Banner Comemorativo de 100% Concluído */}
          {estaCompleto && (
            <div className="banner-sucesso-interativo">
              <div className="banner-sucesso-icone">
                <CheckCircle2 size={26} />
              </div>
              <div style={{ flex: 1 }}>
                <strong style={{ color: 'var(--emerald-success)', fontSize: '0.96rem', display: 'block', marginBottom: '2px' }}>
                  Todos os itens comprados! 🎉
                </strong>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
                  Tudo pronto. Toque em <strong>Confirmar</strong> abaixo para atualizar automaticamente o estoque do restaurante.
                </p>
              </div>
            </div>
          )}

          {/* Espaçador invisível para rolagem confortável sem cortes no mobile */}
          <div className="espacador-inferior-interativo" aria-hidden="true" />
        </div>

        {/* 4. Rodapé Fixo Touch-First com Safe Area */}
        <div className="modal-footer rodape-lista-interativa">
          <div className="rodape-status-linha">
            <span className="texto-status-rodape">
              {estaCompleto ? (
                <span style={{ color: 'var(--emerald-success)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Check size={15} /> 100% no carrinho
                </span>
              ) : (
                <span>
                  Faltam <strong>{totalPendentes} {totalPendentes === 1 ? 'item' : 'itens'}</strong> para liberar
                </span>
              )}
            </span>
          </div>

          <div className="rodape-botoes-container">
            <button 
              id="btn-fechar-rodape-interativa"
              type="button" 
              className="btn btn-secondary btn-touch-rodape" 
              onClick={onClose} 
              disabled={loading || exibirConfirmacao}
            >
              Fechar
            </button>

            <button
              id="btn-confirmar-estoque"
              type="button"
              className={`btn btn-success btn-touch-rodape btn-confirmar-interativa ${estaCompleto ? 'pulsar-destaque' : ''}`}
              onClick={handleOpenConfirm}
              disabled={!estaCompleto || loading}
              title={estaCompleto ? 'Confirmar e atualizar estoque' : 'Marque todos os itens para liberar a confirmação'}
            >
              <CheckCircle2 size={19} />
              <span>{loading ? 'Atualizando...' : estaCompleto ? 'Confirmar e Atualizar' : 'Confirmar'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
