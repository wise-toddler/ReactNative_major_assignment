import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { expenseService } from '../services/api';
import { useAuth } from './AuthContext';

const ExpenseContext = createContext();

export const useExpense = () => useContext(ExpenseContext);

export const ExpenseProvider = ({ children }) => {
  const { token } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [offlineExpenses, setOfflineExpenses] = useState([]);

  useEffect(() => {
    if (token) {
      fetchExpenses();
      fetchAnalytics();
      syncOfflineExpenses();
    }
  }, [token]);

  // Load offline expenses from storage
  useEffect(() => {
    loadOfflineExpenses();
  }, []);

  const loadOfflineExpenses = async () => {
    try {
      const stored = await AsyncStorage.getItem('offlineExpenses');
      if (stored) {
        setOfflineExpenses(JSON.parse(stored));
      }
    } catch (error) {
      console.log('Error loading offline expenses:', error);
    }
  };

  const saveOfflineExpense = async (expense) => {
    try {
      const updated = [...offlineExpenses, { ...expense, offlineId: Date.now() }];
      setOfflineExpenses(updated);
      await AsyncStorage.setItem('offlineExpenses', JSON.stringify(updated));
    } catch (error) {
      console.log('Error saving offline expense:', error);
    }
  };

  const syncOfflineExpenses = async () => {
    if (offlineExpenses.length > 0 && token) {
      try {
        await expenseService.syncExpenses(offlineExpenses);
        setOfflineExpenses([]);
        await AsyncStorage.removeItem('offlineExpenses');
        fetchExpenses();
      } catch (error) {
        console.log('Error syncing offline expenses:', error);
      }
    }
  };

  const fetchExpenses = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await expenseService.getExpenses();
      setExpenses(data);
    } catch (error) {
      console.log('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    if (!token) return;
    try {
      const data = await expenseService.getAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.log('Error fetching analytics:', error);
    }
  };

  const addExpense = async (expenseData) => {
    try {
      const response = await expenseService.addExpense(expenseData);
      setExpenses([response.expense, ...expenses]);
      fetchAnalytics();
      return { success: true };
    } catch (error) {
      // Save offline if network error
      await saveOfflineExpense(expenseData);
      return { success: true, offline: true };
    }
  };

  const updateExpense = async (id, expenseData) => {
    try {
      const response = await expenseService.updateExpense(id, expenseData);
      setExpenses(expenses.map(e => e._id === id ? response.expense : e));
      fetchAnalytics();
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Update failed' };
    }
  };

  const deleteExpense = async (id) => {
    try {
      await expenseService.deleteExpense(id);
      setExpenses(expenses.filter(e => e._id !== id));
      fetchAnalytics();
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Delete failed' };
    }
  };

  return (
    <ExpenseContext.Provider value={{
      expenses,
      analytics,
      loading,
      offlineExpenses,
      fetchExpenses,
      fetchAnalytics,
      addExpense,
      updateExpense,
      deleteExpense,
      syncOfflineExpenses
    }}>
      {children}
    </ExpenseContext.Provider>
  );
};
