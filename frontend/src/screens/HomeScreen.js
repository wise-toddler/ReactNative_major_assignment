import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useExpense } from '../context/ExpenseContext';

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education', 'Other'];
const CATEGORY_COLORS = {
  Food: '#FF6B6B', Transport: '#4ECDC4', Shopping: '#45B7D1', Bills: '#96CEB4',
  Entertainment: '#FFEAA7', Health: '#DDA0DD', Education: '#98D8C8', Other: '#B8B8B8'
};

export default function HomeScreen({ navigation }) {
  const { user, logout } = useAuth();
  const { expenses, analytics, loading, fetchExpenses, fetchAnalytics, offlineExpenses } = useExpense();

  const onRefresh = () => {
    fetchExpenses();
    fetchAnalytics();
  };

  const todayExpenses = expenses.filter(e => {
    const today = new Date().toDateString();
    return new Date(e.date).toDateString() === today;
  });

  const todayTotal = todayExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name}!</Text>
          <Text style={styles.date}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {offlineExpenses.length > 0 && (
        <View style={styles.offlineBar}>
          <Text style={styles.offlineText}>{offlineExpenses.length} expense(s) pending sync</Text>
        </View>
      )}

      <View style={styles.summaryCard}>
        <Text style={styles.cardLabel}>This Month</Text>
        <Text style={styles.cardAmount}>₹{analytics?.currentMonth?.total?.toFixed(2) || '0.00'}</Text>
        <Text style={styles.cardSub}>Daily Avg: ₹{analytics?.currentMonth?.dailyAverage || '0.00'}</Text>
      </View>

      <View style={styles.todayCard}>
        <Text style={styles.todayLabel}>Today's Spending</Text>
        <Text style={styles.todayAmount}>₹{todayTotal.toFixed(2)}</Text>
      </View>

      {analytics?.insights?.length > 0 && (
        <View style={styles.insightsCard}>
          <Text style={styles.insightsTitle}>💡 Insights</Text>
          {analytics.insights.map((insight, i) => (
            <Text key={i} style={styles.insightText}>• {insight}</Text>
          ))}
        </View>
      )}

      <Text style={styles.sectionTitle}>Category Breakdown</Text>
      <View style={styles.categoriesGrid}>
        {analytics?.currentMonth?.byCategory?.map((cat) => (
          <TouchableOpacity
            key={cat._id}
            style={[styles.categoryCard, { backgroundColor: CATEGORY_COLORS[cat._id] || '#B8B8B8' }]}
            onPress={() => navigation.navigate('Expenses', { category: cat._id })}
          >
            <Text style={styles.categoryName}>{cat._id}</Text>
            <Text style={styles.categoryAmount}>₹{cat.total.toFixed(0)}</Text>
            <Text style={styles.categoryCount}>{cat.count} items</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Recent Expenses</Text>
      {expenses.slice(0, 5).map((expense) => (
        <View key={expense._id} style={styles.expenseItem}>
          <View style={[styles.expenseDot, { backgroundColor: CATEGORY_COLORS[expense.category] }]} />
          <View style={styles.expenseInfo}>
            <Text style={styles.expenseCategory}>{expense.category}</Text>
            <Text style={styles.expenseDesc}>{expense.description || expense.paymentMethod}</Text>
          </View>
          <Text style={styles.expenseAmount}>-₹{expense.amount.toFixed(2)}</Text>
        </View>
      ))}

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 60, backgroundColor: '#4CAF50' },
  greeting: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  date: { fontSize: 14, color: '#E8F5E9', marginTop: 5 },
  logoutBtn: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: 8 },
  logoutText: { color: '#fff', fontWeight: '600' },
  offlineBar: { backgroundColor: '#FFF3CD', padding: 10, alignItems: 'center' },
  offlineText: { color: '#856404' },
  summaryCard: { backgroundColor: '#4CAF50', margin: 20, marginTop: -20, padding: 25, borderRadius: 15, elevation: 5 },
  cardLabel: { color: '#E8F5E9', fontSize: 14 },
  cardAmount: { color: '#fff', fontSize: 36, fontWeight: 'bold', marginTop: 5 },
  cardSub: { color: '#E8F5E9', fontSize: 14, marginTop: 10 },
  todayCard: { backgroundColor: '#fff', marginHorizontal: 20, padding: 20, borderRadius: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  todayLabel: { fontSize: 16, color: '#666' },
  todayAmount: { fontSize: 24, fontWeight: 'bold', color: '#4CAF50' },
  insightsCard: { backgroundColor: '#E3F2FD', margin: 20, padding: 15, borderRadius: 10 },
  insightsTitle: { fontSize: 16, fontWeight: 'bold', color: '#1976D2', marginBottom: 10 },
  insightText: { color: '#1976D2', marginBottom: 5 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginHorizontal: 20, marginTop: 20, marginBottom: 10 },
  categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 15 },
  categoryCard: { width: '45%', margin: '2.5%', padding: 15, borderRadius: 10 },
  categoryName: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  categoryAmount: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginTop: 5 },
  categoryCount: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 3 },
  expenseItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 20, marginBottom: 10, padding: 15, borderRadius: 10 },
  expenseDot: { width: 10, height: 10, borderRadius: 5, marginRight: 15 },
  expenseInfo: { flex: 1 },
  expenseCategory: { fontSize: 16, fontWeight: '600' },
  expenseDesc: { color: '#666', fontSize: 14, marginTop: 2 },
  expenseAmount: { fontSize: 16, fontWeight: 'bold', color: '#FF6B6B' }
});
