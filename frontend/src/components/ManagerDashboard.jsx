import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import AppHeader from './AppHeader';
import { useToast } from '../context/ToastContext';

const ManagerDashboard = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [pendingExpenses, setPendingExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingExpenseId, setProcessingExpenseId] = useState(null);
  const [approvalNotes, setApprovalNotes] = useState({});
  const [error, setError] = useState('');

  const loadPendingExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/expenses/pending/approvals');
      setPendingExpenses(response.data.data.expenses || []);
    } catch (requestError) {
      console.error('Error loading pending expenses:', requestError);
      const message = requestError.response?.data?.message || 'Error loading pending expenses';
      setError(message);
      addToast({ type: 'error', title: 'Pending approvals failed', message });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  // Intentional mount-time fetch.
  useEffect(() => {
    loadPendingExpenses();
  }, [loadPendingExpenses]);

  const updateNote = (expenseId, value) => {
    setApprovalNotes((prev) => ({
      ...prev,
      [expenseId]: value
    }));
  };

  const handleApproval = async (expenseId, action) => {
    try {
      setProcessingExpenseId(expenseId);
      setError('');

      await api.post(`/approvals/expenses/${expenseId}`, {
        action,
        comment: approvalNotes[expenseId] || ''
      });

      addToast({
        type: 'success',
        title: action === 'approved' ? 'Expense approved' : 'Expense rejected',
        message: 'The approval workflow updated successfully.'
      });

      setApprovalNotes((prev) => ({
        ...prev,
        [expenseId]: ''
      }));
      await loadPendingExpenses();
    } catch (requestError) {
      console.error('Error processing expense:', requestError);
      const message = requestError.response?.data?.message || 'Error processing expense';
      setError(message);
      addToast({ type: 'error', title: 'Approval failed', message });
    } finally {
      setProcessingExpenseId(null);
    }
  };

  const stageColor = (stage, currentStageIndex, index) => {
    if (stage?.completed) {
      return '#4caf50';
    }

    if (currentStageIndex === index) {
      return '#ff9800';
    }

    return '#cfcfcf';
  };

  const renderApprovalSummary = (expense) => {
    const summary = expense.approvalSummary || {};
    const stages = summary.stages || [];
    const currentStage = summary.currentStage || null;
    const currentStageIndex = summary.currentStageIndex ?? 0;
    const stageSummary = summary.stageSummary || null;
    const history = summary.history || [];

    return (
      <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
        <div style={{ display: 'grid', gap: '0.35rem' }}>
          <span style={{ fontSize: '12px', color: '#666', fontWeight: 700, textTransform: 'uppercase' }}>Current step</span>
          <span style={{ fontSize: '14px', fontWeight: 700 }}>
            {currentStage ? currentStage.label : 'Finalized'}
          </span>
        </div>

        <div style={{ display: 'grid', gap: '0.6rem' }}>
          <span style={{ fontSize: '12px', color: '#666', fontWeight: 700, textTransform: 'uppercase' }}>Approval chain</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {stages.map((stage, index) => (
              <div
                key={`${stage.key}-${index}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.45rem 0.7rem',
                  borderRadius: '999px',
                  backgroundColor: `${stageColor(stage, currentStageIndex, index)}20`,
                  color: stageColor(stage, currentStageIndex, index),
                  border: `1px solid ${stageColor(stage, currentStageIndex, index)}33`,
                  fontSize: '0.85rem',
                  fontWeight: 700
                }}
              >
                {stage.label}
              </div>
            ))}
            {stages.length === 0 && <span style={{ color: '#666' }}>No workflow stages</span>}
          </div>
        </div>

        <div style={{ display: 'grid', gap: '0.35rem' }}>
          <span style={{ fontSize: '12px', color: '#666', fontWeight: 700, textTransform: 'uppercase' }}>Pending approvers</span>
          <span style={{ fontSize: '14px' }}>
            {stageSummary?.pendingApprovers?.length
              ? stageSummary.pendingApprovers.map((approver) => approver.username || approver.email || 'Unknown').join(', ')
              : 'None'}
          </span>
        </div>

        <div style={{ display: 'grid', gap: '0.35rem' }}>
          <span style={{ fontSize: '12px', color: '#666', fontWeight: 700, textTransform: 'uppercase' }}>History</span>
          {history.length === 0 ? (
            <span style={{ color: '#666' }}>No approvals yet.</span>
          ) : (
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {history.map((entry, index) => (
                <div key={`${entry.step}-${entry.date}-${index}`} style={{ padding: '0.75rem', border: '1px solid #eee', borderRadius: '0.75rem', backgroundColor: '#fafafa' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                    <strong>{entry.approver?.username || entry.approver?.email || 'Unknown approver'}</strong>
                    <span style={{ color: entry.action === 'approved' ? '#2e7d32' : '#b42318', fontWeight: 700 }}>
                      {entry.action}
                    </span>
                  </div>
                  <div style={{ color: '#666', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                    Step {entry.step + 1} · {new Date(entry.date).toLocaleString()}
                  </div>
                  {entry.comment ? <div style={{ marginTop: '0.4rem' }}>{entry.comment}</div> : null}
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gap: '0.35rem' }}>
          <span style={{ fontSize: '12px', color: '#666', fontWeight: 700, textTransform: 'uppercase' }}>Your note</span>
          <textarea
            value={approvalNotes[expense._id] || ''}
            onChange={(event) => updateNote(expense._id, event.target.value)}
            placeholder="Optional approval comment"
            rows="3"
            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid #ddd', resize: 'vertical' }}
          />
        </div>
      </div>
    );
  };

  return (
    <div style={{ fontFamily: 'Montserrat, sans-serif', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <AppHeader title="Manager Dashboard" subtitle="Approval workflow & team oversight" />

      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'baseline', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0 }}>Pending Approvals</h2>
          <button
            onClick={loadPendingExpenses}
            style={{
              border: '1px solid #ddd',
              backgroundColor: 'white',
              padding: '0.7rem 1rem',
              borderRadius: '0.75rem',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Refresh
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: '0.9rem',
          marginBottom: '1.25rem'
        }}>
          <div style={{ background: 'rgba(255,255,255,0.86)', border: '1px solid var(--demo-border)', borderRadius: '1rem', padding: '1rem 1.1rem' }}>
            <div style={{ color: '#64748b', fontSize: '0.82rem', textTransform: 'uppercase', fontWeight: 700 }}>Pending items</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{pendingExpenses.length}</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.86)', border: '1px solid var(--demo-border)', borderRadius: '1rem', padding: '1rem 1.1rem' }}>
            <div style={{ color: '#64748b', fontSize: '0.82rem', textTransform: 'uppercase', fontWeight: 700 }}>Your role</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, textTransform: 'capitalize' }}>{user?.role}</div>
          </div>
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

        {loading ? (
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '1rem', border: '1px solid #e5e5e5' }}>
            Loading approvals...
          </div>
        ) : pendingExpenses.length === 0 ? (
          <div style={{
            background: 'rgba(255,255,255,0.86)',
            padding: '3rem',
            borderRadius: '1.5rem',
            textAlign: 'center',
            color: '#666',
            border: '1px solid var(--demo-border)'
          }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>No pending approvals right now.</div>
            <div style={{ marginTop: '0.4rem' }}>This is a good moment to switch to the employee flow and create a new expense live.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {pendingExpenses.map((expense) => (
              <div
                key={expense._id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '24px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                  border: '1px solid #e5e5e5'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'start' }}>
                  <div style={{ display: 'grid', gap: '0.35rem' }}>
                    <div style={{ fontSize: '12px', color: '#666', fontWeight: 700, textTransform: 'uppercase' }}>Employee</div>
                    <div style={{ fontSize: '15px', fontWeight: 700 }}>{expense.employee.username}</div>
                  </div>
                  <div style={{ display: 'grid', gap: '0.35rem' }}>
                    <div style={{ fontSize: '12px', color: '#666', fontWeight: 700, textTransform: 'uppercase' }}>Amount</div>
                    <div style={{ fontSize: '15px', fontWeight: 700 }}>{expense.currency} {expense.amount.toFixed(2)}</div>
                  </div>
                  <div style={{ display: 'grid', gap: '0.35rem' }}>
                    <div style={{ fontSize: '12px', color: '#666', fontWeight: 700, textTransform: 'uppercase' }}>Date</div>
                    <div style={{ fontSize: '15px', fontWeight: 700 }}>{new Date(expense.date).toLocaleDateString()}</div>
                  </div>
                  <div style={{ display: 'grid', gap: '0.35rem' }}>
                    <div style={{ fontSize: '12px', color: '#666', fontWeight: 700, textTransform: 'uppercase' }}>Rule</div>
                    <div style={{ fontSize: '15px', fontWeight: 700 }}>{expense.approvalSummary?.ruleName || 'Implicit / no rule'}</div>
                  </div>
                </div>

                <div style={{ marginTop: '1rem' }}>
                  <div style={{ fontSize: '12px', color: '#666', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.35rem' }}>Description</div>
                  <div style={{ fontSize: '14px' }}>{expense.description}</div>
                </div>

                {renderApprovalSummary(expense)}

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '1.2rem' }}>
                  <button
                    onClick={() => handleApproval(expense._id, 'approved')}
                    disabled={processingExpenseId === expense._id}
                    style={{
                      padding: '10px 20px',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: processingExpenseId === expense._id ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      fontWeight: 700,
                      backgroundColor: '#111',
                      color: '#fff',
                      opacity: processingExpenseId === expense._id ? 0.7 : 1
                    }}
                  >
                    {processingExpenseId === expense._id ? 'Processing...' : 'Approve'}
                  </button>
                  <button
                    onClick={() => handleApproval(expense._id, 'rejected')}
                    disabled={processingExpenseId === expense._id}
                    style={{
                      padding: '10px 20px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      cursor: processingExpenseId === expense._id ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      fontWeight: 700,
                      backgroundColor: '#fff',
                      color: '#111',
                      opacity: processingExpenseId === expense._id ? 0.7 : 1
                    }}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerDashboard;