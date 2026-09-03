import React, { useState, useEffect } from 'react';
import { X, Save, AlertTriangle, Flame } from 'lucide-react';

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
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{editingItem ? 'Editar Ingrediente' : 'Novo Ingrediente'}</h2>
          <button 
            type="button" 
            className="btn btn-secondary btn-icon-only" 
            onClick={onClose}
            aria-label="Fechar modal"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label" htmlFor="input-nome">Nome do Ingrediente *</label>
              <input
                id="input-nome"
                type="text"
                className="form-input"
                placeholder="Ex: Farinha de Trigo, Leite Integral, Ovo Caipira"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                autoFocus
              />
              {errors.nome && <span style={{ color: 'var(--rose-danger)', fontSize: '0.78rem' }}>{errors.nome}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Unidade de Medida *</label>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                {COMMON_UNITS.map((u) => (
                  <button
                    key={u}
                    type="button"
                    className={`btn btn-sm ${formData.unidade === u ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setFormData({ ...formData, unidade: u })}
                  >
                    {u}
                  </button>
                ))}
              </div>
              <input
                type="text"
                className="form-input"
                placeholder="Outra unidade (ex: caixa, garrafa, maço)"
                value={formData.unidade}
                onChange={(e) => setFormData({ ...formData, unidade: e.target.value })}
              />
              {errors.unidade && <span style={{ color: 'var(--rose-danger)', fontSize: '0.78rem' }}>{errors.unidade}</span>}
            </div>

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
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Quantidade para manter no início do mês.
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
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Sobra encontrada no fim do mês.
                </span>
                {errors.estoque_atual && <span style={{ color: 'var(--rose-danger)', fontSize: '0.78rem' }}>{errors.estoque_atual}</span>}
              </div>
            </div>

            {/* Business Rules Controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
              <label className="checkbox-card">
                <input
                  type="checkbox"
                  checked={formData.vencido}
                  onChange={(e) => setFormData({ ...formData, vencido: e.target.checked })}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                    <AlertTriangle size={15} color="var(--rose-danger)" />
                    <span>O ingrediente venceu ou estragou neste mês?</span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Regra do Seu Raimundo: Toda a sobra será descartada e o sistema recomendará recomprar a <strong>meta integral</strong>.
                  </p>
                </div>
              </label>

              <label className="checkbox-card">
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
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                    <Flame size={15} color="var(--orange-warning)" />
                    <span>Acabou no meio do mês antes de terminar?</span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Regra do Seu Raimundo: A meta estava muito baixa. Comprará com base no que foi consumido + <strong>20% de margem</strong>.
                  </p>
                </div>
              </label>

              {formData.faltou_no_meio_do_mes && (
                <div className="form-group" style={{ 
                  background: 'rgba(249, 115, 22, 0.08)', 
                  border: '1px solid rgba(249, 115, 22, 0.25)',
                  padding: '0.85rem',
                  borderRadius: 'var(--radius-md)'
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
                    placeholder={`Opcional. Se vazio, assume a meta de ${formData.meta || 0}`}
                    value={formData.consumo_real}
                    onChange={(e) => setFormData({ ...formData, consumo_real: e.target.value })}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Preencha caso tenha comprado estoque extra de emergência durante o mês que também foi consumido.
                  </span>
                </div>
              )}
            </div>

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
