/**
 * Serviço de comunicação HTTP com a API Django
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export async function fetchApi(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `Erro na requisição: ${response.status} ${response.statusText}`;
    try {
      const errData = await response.json();
      errorMsg = errData.detail || JSON.stringify(errData);
    } catch {
      // Ignora erro de parse de erro
    }
    throw new Error(errorMsg);
  }

  // Se resposta não tiver conteúdo JSON (ex: 204 No Content)
  if (response.status === 204) return null;
  return response.json();
}

export const api = {
  // Ingredientes
  getIngredientes: () => fetchApi('/ingredientes/'),
  createIngrediente: (data) => fetchApi('/ingredientes/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateIngrediente: (id, data) => fetchApi(`/ingredientes/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteIngrediente: (id) => fetchApi(`/ingredientes/${id}/`, {
    method: 'DELETE',
  }),
  toggleVencido: (id) => fetchApi(`/ingredientes/${id}/toggle-vencido/`, {
    method: 'POST',
  }),
  toggleFaltaMes: (id) => fetchApi(`/ingredientes/${id}/toggle-falta-mes/`, {
    method: 'POST',
  }),

  // Compras e Reposição
  getListaCompras: () => fetchApi('/compras/'),
  getListaComprasTxtUrl: () => `${API_BASE_URL}/compras/texto/`,
  salvarHistoricoCompras: () => fetchApi('/compras/salvar/', {
    method: 'POST',
  }),
  atualizarMetasAjustadas: () => fetchApi('/compras/atualizar-metas/', {
    method: 'POST',
  }),
  confirmarCompra: () => fetchApi('/compras/confirmar-compra/', {
    method: 'POST',
  }),

  // Dashboard & Histórico
  getDashboardStats: () => fetchApi('/dashboard/'),
  getHistorico: () => fetchApi('/historico/'),
  deleteHistorico: (id) => fetchApi(`/historico/${id}/`, {
    method: 'DELETE',
  }),
};
