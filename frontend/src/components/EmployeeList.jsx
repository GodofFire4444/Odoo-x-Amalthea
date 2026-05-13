import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const EmployeeList = ({ onUpdate }) => {
  const [employees, setEmployees] = useState([]);
  const [managers, setManagers] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  const [newEmployee, setNewEmployee] = useState({
    username: '',
    email: '',
    password: '',
    role: '',
    manager: '',
    isManagerApprover: false
  });

  const loadEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      setEmployees(response.data.data.users);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error loading employees:', error);
    } finally {
      setLoading(false);
    }
  }, [onUpdate]);

  const loadManagers = useCallback(async () => {
    try {
      const response = await api.get('/users/managers');
      setManagers(response.data.data.managers);
    } catch (error) {
      console.error('Error loading managers:', error);
    }
  }, []);

  // Intentional mount-time fetch; the loaders are memoized for stability.
  useEffect(() => {
    loadEmployees();
    loadManagers();
  }, [loadEmployees, loadManagers]);

  const handleAddClick = () => {
    setIsAdding(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewEmployee(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async () => {
    // Validate all required fields
    if (!newEmployee.username || !newEmployee.email || !newEmployee.password || !newEmployee.role) {
      addToast({ type: 'warning', title: 'Missing fields', message: 'Fill the required employee fields first.' });
      return;
    }

    try {
      await api.post('/users', newEmployee);
      addToast({ type: 'success', title: 'Employee created', message: `${newEmployee.username} is ready for the demo.` });
      
      // Reset form
      setNewEmployee({
        username: '',
        email: '',
        password: '',
        role: '',
        manager: '',
        isManagerApprover: false
      });
      setIsAdding(false);
      loadEmployees();
    } catch (error) {
      console.error('Error creating employee:', error);
      addToast({
        type: 'error',
        title: 'Could not create employee',
        message: error.response?.data?.message || 'Check the form and try again.'
      });
    }
  };

  const handleCancel = () => {
    setNewEmployee({
      username: '',
      email: '',
      password: '',
      role: '',
      manager: '',
      isManagerApprover: false
    });
    setIsAdding(false);
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;

    try {
      await api.delete(`/users/${userId}`);
      addToast({ type: 'success', title: 'Employee deleted', message: 'The user was removed from the company.' });
      loadEmployees();
    } catch (error) {
      console.error('Error deleting employee:', error);
      addToast({ type: 'error', title: 'Delete failed', message: 'Unable to delete this employee right now.' });
    }
  };

  return (
    <div className="employee-container">
      <section className="container">
        <div id="usage">
          <button id="addBtn" className="circle-plus" onClick={handleAddClick}>
            <span style={{ fontSize: '3rem' }}>+ </span> Add Employee
          </button>
        </div>
        
        {loading ? (
          <p style={{ textAlign: 'center', padding: '2rem' }}>Loading employees...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Manager</th>
                <th>Manager Approver</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 && !isAdding && (
                <tr id="emptyRow">
                  <td colSpan="6" style={{ textAlign: 'center', fontStyle: 'italic', color: '#777' }}>
                    No employees present
                  </td>
                </tr>
              )}
              
              {employees.map((employee) => (
                <tr key={employee._id}>
                  <td>{employee.username}</td>
                  <td>{employee.email}</td>
                  <td style={{ textTransform: 'capitalize' }}>{employee.role}</td>
                  <td>{employee.manager?.username || 'None'}</td>
                  <td>{employee.isManagerApprover ? 'Yes' : 'No'}</td>
                  <td>
                    <button
                      onClick={() => handleDelete(employee._id)}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              
              {isAdding && (
                <>
                  <tr className="inputRow">
                    <td>
                      <input 
                        type="text" 
                        name="username"
                        placeholder="Username" 
                        value={newEmployee.username}
                        onChange={handleInputChange}
                        required 
                      />
                    </td>
                    <td>
                      <input 
                        type="email" 
                        name="email"
                        placeholder="Email" 
                        value={newEmployee.email}
                        onChange={handleInputChange}
                        required 
                      />
                    </td>
                    <td>
                      <select 
                        name="role"
                        value={newEmployee.role}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="" disabled>Select Role</option>
                        <option value="employee">Employee</option>
                        <option value="manager">Manager</option>
                      </select>
                    </td>
                    <td>
                      <select 
                        name="manager"
                        value={newEmployee.manager}
                        onChange={handleInputChange}
                      >
                        <option value="">No Manager</option>
                        {managers.map(manager => (
                          <option key={manager._id} value={manager._id}>
                            {manager.username}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <input
                          type="checkbox"
                          name="isManagerApprover"
                          checked={newEmployee.isManagerApprover}
                          onChange={handleInputChange}
                        />
                        <span style={{ fontSize: '0.85rem' }}>Yes</span>
                      </label>
                    </td>
                    <td>
                      <input 
                        type="password" 
                        name="password"
                        placeholder="Password" 
                        value={newEmployee.password}
                        onChange={handleInputChange}
                        required 
                      />
                    </td>
                  </tr>
                  <tr className="actionRow">
                    <td colSpan="6">
                      <button className="saveBtn" onClick={handleSave}>Save</button>
                      <button className="cancelBtn" onClick={handleCancel}>Cancel</button>
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
};

export default EmployeeList;
