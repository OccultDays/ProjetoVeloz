import React, { useState, useEffect } from 'react';
import { X, Save, AlertTriangle, Flame, Plus, Check } from 'lucide-react';

const COMMON_UNITS = ['Kg', 'L', 'unidade', 'g', 'ml', 'dz', 'pct'];

export default function IngredientModal({ isOpen, onClose, onSave, editingItem }) {
  const [formData, setFormData] = useState({
    nome: '',
    unidade: 'Kg',
    meta: '',
    estoque_atual: '0',
    vencido: false,
    faltou_no_meio_do_mes: false,
    consumo_real: '',
    observacao: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingItem) {
      setFormData({
        nome: editingItem.nome || '',
        unidade: editingItem.unidade || 'Kg',
        meta: editingItem.meta || '',
        estoque_atual: editingItem.estoque_atual || '0',
        vencido: !!editingItem.vencido,
        faltou_no_meio_do_mes: !!editingItem.faltou_no_meio_do_mes,
        consumo_real: editingItem.consumo_real || '',
        observacao: editingItem.observacao || '',
      });
    } else {
      setFormData({
        nome: '',
        unidade: 'Kg',
        meta: '',
        estoque_atual: '0',
        vencido: false,
        faltou_no_meio_do_mes: false,
        consumo_real: '',
        observacao: '',
      });
    }
    setErrors({});
  }, [editingItem, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.nome.trim()) {
      errs.nome = 'O nome do ingrediente é obrigatório.';
    }
    if (!formData.unidade.trim()) {
      errs.unidade = 'A unidade de medida é obrigatória.';
    }
    if (formData.meta === '' || isNaN(Number(formData.meta)) || Number(formData.meta) < 0) {
      errs.meta = 'Informe uma meta válida maior ou igual a zero.';
    }
    if (formData.estoque_atual === '' || isNaN(Number(formData.estoque_atual)) || Number(formData.estoque_atual) < 0) {
      errs.estoque_atual = 'Informe um estoque atual válido.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      ...formData,
      meta: parseFloat(formData.meta),
      estoque_atual: parseFloat(formData.estoque_atual),
      consumo_real: formData.consumo_real ? parseFloat(formData.consumo_real) : null,
    };

    onSave(payload);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content ingredient-modal-dialog" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div className="brand-logo-badge" style={{ width: '36px', height: '36px', fontSize: '1.15rem' }}>
              {editingItem ? '✏️' : '🥗'}
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                {editingItem ? 'Editar Ingrediente' : 'Adicionar Novo Ingrediente'}
              </h2>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                {editingItem ? 'Modifique os dados do ingrediente' : 'Cadastre as metas e estoque do Seu Raimundo'}
              </p>
            </div>
          </div>

          <button 
            type="button" 
            className="btn btn-secondary btn-icon-only" 
            onClick={onClose}
            aria-label="Fechar modal"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div className="modal-body" style={{ overflowY: 'auto' }}>
            {/* Nome do Ingrediente */}
            <div className="form-group">
              <label className="form-label" htmlFor="input-nome">
                Nome do Ingrediente *
              </label>
              <input
                id="input-nome"
                type="text"
                className="form-input"
                placeholder="Ex: Farinha de Trigo, Leite Integral, Café..."
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                autoFocus
              />
              {errors.nome && <span style={{ color: 'var(--rose-danger)', fontSize: '0.78rem' }}>{errors.nome}</span>}
            </div>

            {/* Seletor de Unidade Touch-Friendly */}
            <div className="form-group">
              <label className="form-label">
                Unidade de Medida *
              </label>
              <div className="unit-chips-scroll">
                {COMMON_UNITS.map((u) => (
                  <button
                    key={u}
                    type="button"
                    className={`unit-chip ${formData.unidade === u ? 'active' : ''}`}
                    onClick={() => setFormData({ ...formData, unidade: u })}
                  >
                    {formData.unidade === u && <Check size={13} />}
                    <span>{u}</span>
                  </button>
                ))}
              </div>
              <input
                type="text"
                className="form-input"
                style={{ marginTop: '6px' }}
                placeholder="Ou digite outra unidade (ex: caixa, maço, fardo)"
                value={formData.unidade}
                onChange={(e) => setFormData({ ...formData, unidade: e.target.value })}
              />
              {errors.unidade && <span style={{ color: 'var(--rose-danger)', fontSize: '0.78rem' }}>{errors.unidade}</span>}
            </div>

            {/* Meta e Estoque Atual em Grid Responsivo */}
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="input-meta">
                  Meta Mensal ({formData.unidade || 'unidade'}) *
                </label>
                <input
                  id="input-meta"
                  type="number"
                  step="any"
                  min="0"
                  className="form-input"
                  placeholder="Ex: 50"
                  value={formData.meta}
                  onChange={(e) => setFormData({ ...formData, meta: e.target.value })}
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Quantidade para o início do mês.
                </span>
                {errors.meta && <span style={{ color: 'var(--rose-danger)', fontSize: '0.78rem' }}>{errors.meta}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="input-estoque">
                  Estoque Atual / Sobra ({formData.unidade || 'unidade'}) *
                </label>
                <input
                  id="input-estoque"
                  type="number"
                  step="any"
                  min="0"
                  className="form-input"
                  placeholder="Ex: 12"
                  value={formData.estoque_atual}
                  onChange={(e) => setFormData({ ...formData, estoque_atual: e.target.value })}
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Sobra restante neste momento.
                </span>
                {errors.estoque_atual && <span style={{ color: 'var(--rose-danger)', fontSize: '0.78rem' }}>{errors.estoque_atual}</span>}
              </div>
            </div>

            {/* Regras de Negócio do Seu Raimundo (Cards de toque largo) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <label className={`checkbox-card ${formData.vencido ? 'active-vencido-card' : ''}`}>
                <input
                  type="checkbox"
                  checked={formData.vencido}
                  onChange={(e) => setFormData({ ...formData, vencido: e.target.checked })}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '0.9rem' }}>
                    <AlertTriangle size={16} color="var(--rose-danger)" />
                    <span>Ingrediente estragou ou venceu?</span>
                  </div>
                  <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.4 }}>
                    Sobra será descartada; o sistema comprará a <strong>meta inteira</strong>.
                  </p>
                </div>
              </label>

              <label className={`checkbox-card ${formData.faltou_no_meio_do_mes ? 'active-falta-card' : ''}`}>
                <input
                  type="checkbox"
                  checked={formData.faltou_no_meio_do_mes}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setFormData({ 
                      ...formData, 
                      faltou_no_meio_do_mes: checked,
                      estoque_atual: checked ? '0' : formData.estoque_atual
                    });
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '0.9rem' }}>
                    <Flame size={16} color="var(--orange-warning)" />
                    <span>Faltou no meio do mês antes de acabar?</span>
                  </div>
                  <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.4 }}>
                    Meta estava subdimensionada; comprará o consumo com <strong>+20% de gordurinha</strong>.
                  </p>
                </div>
              </label>

              {formData.faltou_no_meio_do_mes && (
                <div className="form-group" style={{ 
                  background: 'rgba(249, 115, 22, 0.08)', 
                  border: '1px solid rgba(249, 115, 22, 0.3)',
                  padding: '0.85rem',
                  borderRadius: 'var(--radius-md)',
                  animation: 'fadeIn 0.2s ease-out'
                }}>
                  <label className="form-label" htmlFor="input-consumo">
                    Consumo Real Total do Mês ({formData.unidade || 'unidade'})
                  </label>
                  <input
                    id="input-consumo"
                    type="number"
                    step="any"
                    min="0"
                    className="form-input"
                    placeholder={`Opcional. Padrão: ${formData.meta || 0}`}
                    value={formData.consumo_real}
                    onChange={(e) => setFormData({ ...formData, consumo_real: e.target.value })}
                  />
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Preencha caso tenha comprado estoque extra de emergência durante o mês.
                  </span>
                </div>
              )}
            </div>

            {/* Observações */}
            <div className="form-group">
              <label className="form-label" htmlFor="input-observacao">Observações (opcional)</label>
              <textarea
                id="input-observacao"
                rows="2"
                className="form-textarea"
                placeholder="Ex: Fornecedor habitual, marca preferida, etc."
                value={formData.observacao}
                onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
              />
            </div>
          </div>

          {/* Footer fixo e sempre visível */}
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              <Save size={16} />
              <span>Salvar Ingrediente</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
