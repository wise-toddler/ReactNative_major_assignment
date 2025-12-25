import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useExpense } from '../context/ExpenseContext';

const CATEGORY_COLORS = {
  Food: '#FF6B6B', Transport: '#4ECDC4', Shopping: '#45B7D1', Bills: '#96CEB4',
  Entertainment: '#FFEAA7', Health: '#DDA0DD', Education: '#98D8C8', Other: '#B8B8B8'
};

export default function AnalyticsScreen() {
  const { analytics, loading, fetchAnalytics } = useExpense();

  const currentMonthTotal = analytics?.currentMonth?.total || 0;
  const lastMonthTotal = analytics?.lastMonth?.total || 0;
  const percentChange = lastMonthTotal > 0 ? ((currentMonthTotal - lastMonthTotal) / lastMonthTotal * 100).toFixed(1) : 0;

  const maxCategoryAmount = Math.max(...(analytics?.currentMonth?.byCategory?.map(c => c.total) || [1]));

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchAnalytics} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Analytics</Text>
        <Text style={styles.subtitle}>Your spending insights</Text>
      </View>

      <View style={styles.comparisonCard}>
        <View style={styles.monthCard}>
          <Text style={styles.monthLabel}>This Month</Text>
          <Text style={styles.monthAmount}>₹{currentMonthTotal.toFixed(0)}</Text>
        </View>
        <View style={styles.vsContainer}>
          <Text style={[styles.percentChange, { color: percentChange > 0 ? '#FF6B6B' : '#4CAF50' }]}>
            {percentChange > 0 ? '↑' : '↓'} {Math.abs(percentChange)}%
          </Text>
        </View>
        <View style={styles.monthCard}>
          <Text style={styles.monthLabel}>Last Month</Text>
          <Text style={styles.monthAmount}>₹{lastMonthTotal.toFixed(0)}</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>₹{analytics?.currentMonth?.dailyAverage || '0'}</Text>
          <Text style={styles.statLabel}>Daily Average</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{analytics?.currentMonth?.byCategory?.length || 0}</Text>
          <Text style={styles.statLabel}>Categories Used</Text>
        </View>
      </View>

      {analytics?.insights?.length > 0 && (
        <View style={styles.insightsCard}>
          <Text style={styles.insightsTitle}>💡 Insights</Text>
          {analytics.insights.map((insight, i) => (
            <View key={i} style={styles.insightRow}>
              <Text style={styles.insightBullet}>•</Text>
              <Text style={styles.insightText}>{insight}</Text>
            </View>
          ))}
        </View>
      )}

      <Text style={styles.sectionTitle}>Category Breakdown</Text>
      {analytics?.currentMonth?.byCategory?.map((cat) => (
        <View key={cat._id} style={styles.categoryRow}>
          <View style={[styles.categoryIcon, { backgroundColor: CATEGORY_COLORS[cat._id] || '#B8B8B8' }]}>
            <Text style={styles.categoryInitial}>{cat._id[0]}</Text>
          </View>
          <View style={styles.categoryInfo}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryName}>{cat._id}</Text>
              <Text style={styles.categoryAmount}>₹{cat.total.toFixed(0)}</Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(cat.total / maxCategoryAmount) * 100}%`, backgroundColor: CATEGORY_COLORS[cat._id] || '#B8B8B8' }
                ]}
              />
            </View>
            <Text style={styles.categoryCount}>{cat.count} transactions</Text>
          </View>
        </View>
      ))}

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#4CAF50', padding: 20, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 14, color: '#E8F5E9', marginTop: 5 },
  comparisonCard: { flexDirection: 'row', backgroundColor: '#fff', margin: 20, borderRadius: 15, padding: 20, alignItems: 'center' },
  monthCard: { flex: 1, alignItems: 'center' },
  monthLabel: { fontSize: 14, color: '#666' },
  monthAmount: { fontSize: 24, fontWeight: 'bold', color: '#333', marginTop: 5 },
  vsContainer: { paddingHorizontal: 15 },
  percentChange: { fontSize: 16, fontWeight: 'bold' },
  statsRow: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: '#fff', padding: 20, borderRadius: 12, marginHorizontal: 5, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#4CAF50' },
  statLabel: { fontSize: 14, color: '#666', marginTop: 5 },
  insightsCard: { backgroundColor: '#E3F2FD', margin: 20, padding: 20, borderRadius: 12 },
  insightsTitle: { fontSize: 18, fontWeight: 'bold', color: '#1976D2', marginBottom: 15 },
  insightRow: { flexDirection: 'row', marginBottom: 10 },
  insightBullet: { color: '#1976D2', marginRight: 10, fontSize: 16 },
  insightText: { flex: 1, color: '#1976D2', fontSize: 14, lineHeight: 20 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginHorizontal: 20, marginTop: 10, marginBottom: 15 },
  categoryRow: { flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 20, marginBottom: 10, padding: 15, borderRadius: 12 },
  categoryIcon: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  categoryInitial: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  categoryInfo: { flex: 1 },
  categoryHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  categoryName: { fontSize: 16, fontWeight: '600' },
  categoryAmount: { fontSize: 16, fontWeight: 'bold' },
  progressBar: { height: 8, backgroundColor: '#f0f0f0', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  categoryCount: { fontSize: 12, color: '#999', marginTop: 5 }
});
