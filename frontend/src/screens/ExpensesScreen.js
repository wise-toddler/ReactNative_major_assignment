import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useExpense } from '../context/ExpenseContext';

const CATEGORIES = ['All', 'Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education', 'Other'];
const CATEGORY_COLORS = {
  Food: '#FF6B6B', Transport: '#4ECDC4', Shopping: '#45B7D1', Bills: '#96CEB4',
  Entertainment: '#FFEAA7', Health: '#DDA0DD', Education: '#98D8C8', Other: '#B8B8B8'
};

export default function ExpensesScreen({ navigation, route }) {
  const initialCategory = route.params?.category || 'All';
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const { expenses, loading, fetchExpenses, deleteExpense } = useExpense();

  const filteredExpenses = selectedCategory === 'All'
    ? expenses
    : expenses.filter(e => e.category === selectedCategory);

  const totalFiltered = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  const handleDelete = (id) => {
    Alert.alert('Delete Expense', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        const result = await deleteExpense(id);
        if (!result.success) Alert.alert('Error', result.message);
      }}
    ]);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const renderExpense = ({ item }) => (
    <TouchableOpacity
      style={styles.expenseCard}
      onPress={() => navigation.navigate('AddExpense', { expense: item })}
      onLongPress={() => handleDelete(item._id)}
    >
      <View style={[styles.categoryDot, { backgroundColor: CATEGORY_COLORS[item.category] || '#B8B8B8' }]} />
      <View style={styles.expenseInfo}>
        <Text style={styles.expenseCategory}>{item.category}</Text>
        <Text style={styles.expenseDesc}>{item.description || item.paymentMethod}</Text>
        <Text style={styles.expenseDate}>{formatDate(item.date)}</Text>
      </View>
      <View style={styles.expenseRight}>
        <Text style={styles.expenseAmount}>-₹{item.amount.toFixed(2)}</Text>
        <Text style={styles.paymentMethod}>{item.paymentMethod}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Expenses</Text>
        <Text style={styles.total}>Total: ₹{totalFiltered.toFixed(2)}</Text>
      </View>

      <View style={styles.categoryContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryContent}
        >
          {CATEGORIES.map((item) => (
            <TouchableOpacity
              key={item}
              style={[styles.filterChip, selectedCategory === item && styles.filterChipActive]}
              onPress={() => setSelectedCategory(item)}
            >
              <Text style={[styles.filterText, selectedCategory === item && styles.filterTextActive]}>{item}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredExpenses}
        keyExtractor={(item) => item._id}
        renderItem={renderExpense}
        onRefresh={fetchExpenses}
        refreshing={loading}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No expenses found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#4CAF50', padding: 20, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  total: { fontSize: 16, color: '#E8F5E9', marginTop: 5 },
  categoryContainer: { backgroundColor: '#fff', paddingVertical: 15 },
  categoryContent: { paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, marginRight: 10, borderRadius: 20, backgroundColor: '#f0f0f0' },
  filterChipActive: { backgroundColor: '#4CAF50' },
  filterText: { color: '#666', fontWeight: '500' },
  filterTextActive: { color: '#fff' },
  list: { padding: 15 },
  expenseCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 10 },
  categoryDot: { width: 12, height: 12, borderRadius: 6, marginRight: 15 },
  expenseInfo: { flex: 1 },
  expenseCategory: { fontSize: 16, fontWeight: '600', color: '#333' },
  expenseDesc: { fontSize: 14, color: '#666', marginTop: 2 },
  expenseDate: { fontSize: 12, color: '#999', marginTop: 4 },
  expenseRight: { alignItems: 'flex-end' },
  expenseAmount: { fontSize: 18, fontWeight: 'bold', color: '#FF6B6B' },
  paymentMethod: { fontSize: 12, color: '#999', marginTop: 4 },
  empty: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: '#999', fontSize: 16 }
});
