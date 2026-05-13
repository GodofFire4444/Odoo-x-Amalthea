import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const DEFAULT_FORM = {
  name: '',
  type: 'sequential',
  amountThresholdMin: '',
  amountThresholdMax: '',
  percentageRequired: '',
  isActive: true,
  approvers: [],
  specificApprovers: []
};

const TYPE_OPTIONS = [
  { value: 'sequential', label: 'Sequential' },
  { value: 'percentage', label: 'Parallel threshold' },
  { value: 'specific_approver', label: 'Specific approver' },
  { value: 'hybrid', label: 'Hybrid' }
];

const ApprovalRules = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [rules, setRules] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(DEFAULT_FORM);
  const [editingRuleId, setEditingRuleId] = useState(null);

  const approvalUsers = useMemo(() => {
    const merged = [...users];

    if (user?.role === 'admin' && user?._id && !merged.some((candidate) => candidate._id === user._id)) {
      merged.unshift(user);
    }

    return merged;
  }, [users, user]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rulesRes, usersRes] = await Promise.all([
        api.get('/approvals/rules'),
        api.get('/users')
      ]);

      setRules(rulesRes.data.data.rules || []);
      setUsers(usersRes.data.data.users || []);
    } catch (requestError) {
      console.error('Error loading approval rules:', requestError);
      const message = requestError.response?.data?.message || 'Error loading approval rules';
      setError(message);
      addToast({ type: 'error', title: 'Approval rules failed to load', message });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingRuleId(null);
    setForm(DEFAULT_FORM);
    setError('');
  };

  const startEdit = (rule) => {
    setEditingRuleId(rule._id);
    setForm({
      name: rule.name || '',
      type: rule.type || 'sequential',
      amountThresholdMin: rule.amountThreshold?.min !== undefined ? String(rule.amountThreshold.min) : '',
      amountThresholdMax: rule.amountThreshold?.max !== undefined ? String(rule.amountThreshold.max) : '',
      percentageRequired: rule.percentageRequired !== undefined && rule.percentageRequired !== null ? String(rule.percentageRequired) : '',
      isActive: Boolean(rule.isActive),
      approvers: (rule.approvers || []).map((approver) => ({
        userId: approver.user?._id || approver.user,
        sequence: approver.sequence || 1
      })),
      specificApprovers: (rule.specificApprovers || []).map((approver) => approver._id || approver)
    });
    setError('');
  };

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) {
      setError('');
    }
  };

  const toggleSequentialApprover = (userId) => {
    setForm((prev) => {
      const exists = prev.approvers.some((approver) => approver.userId === userId);

      if (exists) {
        return {
          ...prev,
          approvers: prev.approvers
            .filter((approver) => approver.userId !== userId)
            .map((approver, index) => ({ ...approver, sequence: index + 1 }))
        };
      }

      return {
        ...prev,
        approvers: [...prev.approvers, { userId, sequence: prev.approvers.length + 1 }]
      };
    });
  };

  const toggleSpecificApprover = (userId) => {
    setForm((prev) => {
      const exists = prev.specificApprovers.includes(userId);
      return {
        ...prev,
        specificApprovers: exists
          ? prev.specificApprovers.filter((approverId) => approverId !== userId)
          : [...prev.specificApprovers, userId]
      };
    });
  };

  const updateSequence = (userId, sequence) => {
    setForm((prev) => ({
      ...prev,
      approvers: prev.approvers.map((approver) => (
        approver.userId === userId
          ? { ...approver, sequence: sequence === '' ? '' : Number(sequence) }
          : approver
      ))
    }));
  };

  const buildPayload = () => {
    const payload = {
      name: form.name.trim(),
      type: form.type,
      isActive: form.isActive
    };

    if (form.amountThresholdMin !== '' || form.amountThresholdMax !== '') {
      payload.amountThreshold = {
        ...(form.amountThresholdMin !== '' ? { min: Number(form.amountThresholdMin) } : {}),
        ...(form.amountThresholdMax !== '' ? { max: Number(form.amountThresholdMax) } : {})
      };
    }

    if (form.type === 'percentage' || form.type === 'hybrid') {
      payload.percentageRequired = form.percentageRequired === '' ? undefined : Number(form.percentageRequired);
    }

    if (form.type === 'sequential' || form.type === 'percentage' || form.type === 'hybrid') {
      payload.approvers = [...form.approvers]
        .sort((left, right) => Number(left.sequence) - Number(right.sequence))
        .map((approver, index) => ({
          user: approver.userId,
          sequence: index + 1
        }));
    }

    if (form.type === 'specific_approver' || form.type === 'hybrid') {
      payload.specificApprovers = [...form.specificApprovers];
    }

    return payload;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setError('Please enter a rule name.');
      return;
    }

    if (form.type === 'sequential' && form.approvers.length === 0) {
      setError('Sequential rules need at least one approver.');
      return;
    }

    if ((form.type === 'percentage' || form.type === 'hybrid') && form.approvers.length === 0 && form.specificApprovers.length === 0) {
      setError('Parallel or hybrid rules need approvers.');
      return;
    }

    if ((form.type === 'percentage' || form.type === 'hybrid') && form.percentageRequired === '' && form.specificApprovers.length === 0) {
      setError('Percentage-based rules need a percentage threshold.');
      return;
    }

    if (form.type === 'specific_approver' && form.specificApprovers.length === 0) {
      setError('Specific approver rules need at least one selected approver.');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const payload = buildPayload();
      if (editingRuleId) {
        await api.put(`/approvals/rules/${editingRuleId}`, payload);
      } else {
        await api.post('/approvals/rules', payload);
      }

      addToast({
        type: 'success',
        title: editingRuleId ? 'Rule updated' : 'Rule created',
        message: 'Approval workflow saved successfully.'
      });
      resetForm();
      await loadData();
    } catch (requestError) {
      console.error('Error saving approval rule:', requestError);
      const message = requestError.response?.data?.message || 'Error saving approval rule';
      setError(message);
      addToast({ type: 'error', title: 'Could not save rule', message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (ruleId) => {
    const confirmed = window.confirm('Delete this approval rule?');
    if (!confirmed) {
      return;
    }

    try {
      setSaving(true);
      await api.delete(`/approvals/rules/${ruleId}`);
      addToast({ type: 'success', title: 'Rule deleted', message: 'The approval rule was removed.' });
      await loadData();
    } catch (requestError) {
      console.error('Error deleting approval rule:', requestError);
      const message = requestError.response?.data?.message || 'Error deleting approval rule';
      setError(message);
      addToast({ type: 'error', title: 'Delete failed', message });
    } finally {
      setSaving(false);
    }
  };

  const selectedApproverIds = form.approvers.map((approver) => approver.userId);

  return (
    <div style={{ fontFamily: 'Montserrat, sans-serif' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1.5rem', alignItems: 'start' }}>
        <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #e5e5e5' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0 }}>{editingRuleId ? 'Edit Approval Rule' : 'Create Approval Rule'}</h2>
            {editingRuleId && (
              <button
                type="button"
                onClick={resetForm}
                style={{
                  backgroundColor: '#f5f5f5',
                  border: '1px solid #ddd',
                  borderRadius: '0.5rem',
                  padding: '0.6rem 1rem',
                  cursor: 'pointer'
                }}
              >
                Cancel Edit
              </button>
            )}
          </div>

          {error ? (
            <div style={{
              marginBottom: '1rem',
              padding: '0.85rem 1rem',
              borderRadius: '0.75rem',
              backgroundColor: '#fdecea',
              color: '#b42318',
              border: '1px solid #f5c2c7'
            }}>
              {error}
            </div>
          ) : null}

          <div style={{ display: 'grid', gap: '1rem' }}>
            <label style={{ display: 'grid', gap: '0.5rem' }}>
              <span style={{ fontWeight: 600 }}>Rule name</span>
              <input
                value={form.name}
                onChange={(event) => updateField('name', event.target.value)}
                placeholder="e.g. High value travel approvals"
                style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ddd' }}
              />
            </label>

            <label style={{ display: 'grid', gap: '0.5rem' }}>
              <span style={{ fontWeight: 600 }}>Rule type</span>
              <select
                value={form.type}
                onChange={(event) => updateField('type', event.target.value)}
                style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ddd' }}
              >
                {TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1rem' }}>
              <label style={{ display: 'grid', gap: '0.5rem' }}>
                <span style={{ fontWeight: 600 }}>Amount threshold min</span>
                <input
                  type="number"
                  value={form.amountThresholdMin}
                  onChange={(event) => updateField('amountThresholdMin', event.target.value)}
                  placeholder="0"
                  style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ddd' }}
                />
              </label>

              <label style={{ display: 'grid', gap: '0.5rem' }}>
                <span style={{ fontWeight: 600 }}>Amount threshold max</span>
                <input
                  type="number"
                  value={form.amountThresholdMax}
                  onChange={(event) => updateField('amountThresholdMax', event.target.value)}
                  placeholder="Optional"
                  style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ddd' }}
                />
              </label>
            </div>

            {(form.type === 'percentage' || form.type === 'hybrid') && (
              <label style={{ display: 'grid', gap: '0.5rem' }}>
                <span style={{ fontWeight: 600 }}>Percentage required</span>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={form.percentageRequired}
                  onChange={(event) => updateField('percentageRequired', event.target.value)}
                  placeholder="50"
                  style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ddd' }}
                />
              </label>
            )}

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) => updateField('isActive', event.target.checked)}
              />
              <span style={{ fontWeight: 600 }}>Active</span>
            </label>
          </div>

          <div style={{ marginTop: '1.5rem', display: 'grid', gap: '1rem' }}>
            {(form.type === 'sequential' || form.type === 'percentage' || form.type === 'hybrid') && (
              <section>
                <h3 style={{ marginBottom: '0.75rem' }}>Ordered approvers</h3>
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  {approvalUsers.map((candidate) => (
                    <label key={candidate._id} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '0.75rem', alignItems: 'center', padding: '0.75rem', border: '1px solid #eee', borderRadius: '0.75rem' }}>
                      <input
                        type="checkbox"
                        checked={selectedApproverIds.includes(candidate._id)}
                        onChange={() => toggleSequentialApprover(candidate._id)}
                      />
                      <span>
                        <strong>{candidate.username}</strong> <span style={{ color: '#666' }}>({candidate.role})</span>
                      </span>
                      {selectedApproverIds.includes(candidate._id) ? (
                        <input
                          type="number"
                          min="1"
                          value={form.approvers.find((approver) => approver.userId === candidate._id)?.sequence || 1}
                          onChange={(event) => updateSequence(candidate._id, event.target.value)}
                          style={{ width: '90px', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #ddd' }}
                        />
                      ) : (
                        <span style={{ color: '#999', fontSize: '0.9rem' }}>Sequence</span>
                      )}
                    </label>
                  ))}
                </div>
              </section>
            )}

            {(form.type === 'specific_approver' || form.type === 'hybrid') && (
              <section>
                <h3 style={{ marginBottom: '0.75rem' }}>Specific approvers</h3>
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  {approvalUsers.map((candidate) => (
                    <label key={candidate._id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', border: '1px solid #eee', borderRadius: '0.75rem' }}>
                      <input
                        type="checkbox"
                        checked={form.specificApprovers.includes(candidate._id)}
                        onChange={() => toggleSpecificApprover(candidate._id)}
                      />
                      <span>
                        <strong>{candidate.username}</strong> <span style={{ color: '#666' }}>({candidate.role})</span>
                      </span>
                    </label>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                padding: '0.8rem 1.2rem',
                backgroundColor: '#111',
                color: '#fff',
                border: 'none',
                borderRadius: '0.75rem',
                fontWeight: 600,
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1
              }}
            >
              {saving ? 'Saving...' : editingRuleId ? 'Update Rule' : 'Create Rule'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              style={{
                padding: '0.8rem 1.2rem',
                backgroundColor: '#f5f5f5',
                color: '#111',
                border: '1px solid #ddd',
                borderRadius: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Reset
            </button>
          </div>
        </form>

        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #e5e5e5' }}>
          <h2 style={{ marginTop: 0 }}>Existing Rules</h2>
          {loading ? (
            <div style={{ background: 'rgba(255,255,255,0.86)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--demo-border)' }}>Loading rules...</div>
          ) : rules.length === 0 ? (
            <div style={{ color: '#666', padding: '0.75rem 0' }}>No rules yet.</div>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {rules.map((rule) => (
                <div key={rule._id} style={{ border: '1px solid #eee', borderRadius: '0.9rem', padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'start' }}>
                    <div>
                      <h3 style={{ margin: '0 0 0.25rem 0' }}>{rule.name}</h3>
                      <div style={{ color: '#666', fontSize: '0.9rem' }}>
                        {TYPE_OPTIONS.find((option) => option.value === rule.type)?.label || rule.type}
                        {rule.amountThreshold ? ` · ${rule.amountThreshold.min ?? 0}${rule.amountThreshold.max !== undefined ? ` - ${rule.amountThreshold.max}` : '+'}` : ''}
                      </div>
                    </div>
                    <span style={{
                      padding: '0.35rem 0.6rem',
                      borderRadius: '999px',
                      backgroundColor: rule.isActive ? '#e8f5e9' : '#f5f5f5',
                      color: rule.isActive ? '#2e7d32' : '#666',
                      fontSize: '0.8rem',
                      fontWeight: 700
                    }}>
                      {rule.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div style={{ marginTop: '0.9rem', color: '#333', fontSize: '0.9rem', display: 'grid', gap: '0.5rem' }}>
                    <div>
                      <strong>Approvers:</strong> {(rule.approvers || []).map((approver) => approver.user?.username || approver.user?.email || 'Unknown').join(', ') || 'None'}
                    </div>
                    {(rule.specificApprovers || []).length > 0 && (
                      <div>
                        <strong>Specific:</strong> {(rule.specificApprovers || []).map((approver) => approver.username || approver.email || 'Unknown').join(', ')}
                      </div>
                    )}
                    {rule.percentageRequired !== undefined && rule.percentageRequired !== null && (
                      <div>
                        <strong>Threshold:</strong> {rule.percentageRequired}%
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                    <button
                      type="button"
                      onClick={() => startEdit(rule)}
                      style={{
                        padding: '0.6rem 0.9rem',
                        borderRadius: '0.6rem',
                        border: '1px solid #ddd',
                        backgroundColor: '#fff',
                        cursor: 'pointer',
                        fontWeight: 600
                      }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(rule._id)}
                      disabled={saving}
                      style={{
                        padding: '0.6rem 0.9rem',
                        borderRadius: '0.6rem',
                        border: '1px solid #f5c2c7',
                        backgroundColor: '#fff5f5',
                        color: '#b42318',
                        cursor: saving ? 'not-allowed' : 'pointer',
                        fontWeight: 600
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApprovalRules;