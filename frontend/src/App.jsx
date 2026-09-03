import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import MetricCards from './components/MetricCards';
import IngredientTable from './components/IngredientTable';
import IngredientModal from './components/IngredientModal';
import ShoppingListView from './components/ShoppingListView';
import FeiraModeModal from './components/FeiraModeModal';
import HistoryView from './components/HistoryView';
import { api } from './services/api';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('estoque');
  const [ingredientes, setIngredientes] = useState([]);
  const [shoppingData, setShoppingData] = useState(null);
  const [stats, setStats] = useState({});
  const [historico, setHistorico] = useState([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');

  const [isIngredientModalOpen, setIsIngredientModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isFeiraModalOpen, setIsFeiraModalOpen] = useState(false);

  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [ings, shopping, dashStats, hist] = await Promise.all([
        api.getIngredientes(),
        api.getListaCompras(),
        api.getDashboardStats(),
        api.getHistorico(),
      ]);

      setIngredientes(ings || []);
      setShoppingData(shopping || null);
      setStats(dashStats || {});
      setHistorico(hist || []);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      showToast(`Erro ao carregar dados da API: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handlers para Ingredientes
  const handleAddNew = () => {
    setEditingItem(null);
    setIsIngredientModalOpen(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setIsIngredientModalOpen(true);
  };

  const handleSaveIngredient = async (formData) => {
    try {
      if (editingItem && editingItem.id) {
        await api.updateIngrediente(editingItem.id, formData);
        showToast(`Ingrediente "${formData.nome}" atualizado com sucesso!`);
      } else {
        await api.createIngrediente(formData);
        showToast(`Ingrediente "${formData.nome}" cadastrado com sucesso!`);
      }
      setIsIngredientModalOpen(false);
      loadData();
    } catch (err) {
      showToast(`Erro ao salvar ingrediente: ${err.message}`, 'error');
    }
  };

  const handleDelete = async (id, nome) => {
    if (!window.confirm(`Tem certeza que deseja excluir o ingrediente "${nome}"?`)) return;
    try {
      await api.deleteIngrediente(id);
      showToast(`Ingrediente "${nome}" removido do estoque.`);
      loadData();
    } catch (err) {
      showToast(`Erro ao excluir ingrediente: ${err.message}`, 'error');
    }
  };

  const handleToggleVencido = async (id) => {
    try {
      const updated = await api.toggleVencido(id);
      const statusText = updated.vencido ? 'marcado como vencido' : 'desmarcado de vencido';
      showToast(`"${updated.nome}" ${statusText}.`);
      loadData();
    } catch (err) {
      showToast(`Erro ao atualizar status: ${err.message}`, 'error');
    }
  };

  const handleToggleFaltaMes = async (id) => {
    try {
      const updated = await api.toggleFaltaMes(id);
      const statusText = updated.faltou_no_meio_do_mes 
        ? 'marcado com falta no mês (+20% de gordurinha aplicado)' 
        : 'desmarcado de falta no mês';
      showToast(`"${updated.nome}" ${statusText}.`);
      loadData();
    } catch (err) {
      showToast(`Erro ao atualizar status: ${err.message}`, 'error');
    }
  };

  // Ações da Lista de Compras
  const handleAtualizarMetas = async () => {
    if (!window.confirm('Deseja atualizar a meta dos ingredientes que acabaram no meio do mês para a nova meta com +20% de margem?')) {
      return;
    }
    try {
      setLoading(true);
      const res = await api.atualizarMetasAjustadas();
      showToast(res.mensagem || 'Metas atualizadas com sucesso!');
      loadData();
    } catch (err) {
      showToast(`Erro ao atualizar metas: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSalvarHistorico = async () => {
    try {
      setLoading(true);
      await api.salvarHistoricoCompras();
      showToast('Lista de compras arquivada no histórico com sucesso!');
      loadData();
    } catch (err) {
      showToast(`Erro ao arquivar histórico: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmarCompra = async () => {
    try {
      setLoading(true);
      const res = await api.confirmarCompra();
      showToast(res.mensagem || 'Estoque atualizado com sucesso!');
      setIsFeiraModalOpen(false);
      await loadData();
    } catch (err) {
      showToast(`Erro ao atualizar estoque: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        totalParaComprar={stats.total_para_comprar || 0}
      />

      <main className="app-container">
        {/* KPI Cards em destaque */}
        <MetricCards 
          stats={stats} 
          onSelectFilter={(statusKey) => {
            setFilterStatus(statusKey);
            setActiveTab('estoque');
          }}
        />

        {/* Conteúdo dinâmico por abas */}
        {activeTab === 'estoque' && (
          <IngredientTable
            ingredientes={ingredientes}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            onAddNew={handleAddNew}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleVencido={handleToggleVencido}
            onToggleFaltaMes={handleToggleFaltaMes}
            onGoToShoppingList={() => setActiveTab('compras')}
          />
        )}

        {activeTab === 'compras' && (
          <ShoppingListView
            shoppingData={shoppingData}
            onOpenFeiraMode={() => setIsFeiraModalOpen(true)}
            onAtualizarMetas={handleAtualizarMetas}
            onSalvarHistorico={handleSalvarHistorico}
            loading={loading}
          />
        )}

        {activeTab === 'historico' && (
          <HistoryView historico={historico} />
        )}
      </main>

      {/* Modal de Cadastro / Edição de Ingrediente */}
      <IngredientModal
        isOpen={isIngredientModalOpen}
        onClose={() => setIsIngredientModalOpen(false)}
        onSave={handleSaveIngredient}
        editingItem={editingItem}
      />

      {/* Modal Lista Interativa / Checklist */}
      <FeiraModeModal
        isOpen={isFeiraModalOpen}
        onClose={() => setIsFeiraModalOpen(false)}
        itensParaComprar={(shoppingData && shoppingData.itens_para_comprar) || []}
        onConfirmarCompra={handleConfirmarCompra}
        loading={loading}
      />

      {/* Feedback Toast */}
      {toast && (
        <div className="toast-notification">
          {toast.type === 'error' ? (
            <AlertCircle size={20} color="var(--rose-danger)" />
          ) : (
            <CheckCircle2 size={20} color="var(--emerald-success)" />
          )}
          <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
