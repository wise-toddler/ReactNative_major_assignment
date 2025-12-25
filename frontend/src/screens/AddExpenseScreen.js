import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useExpense } from '../context/ExpenseContext';

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education', 'Other'];
const PAYMENT_METHODS = ['Cash', 'Card', 'UPI', 'Net Banking'];

export default function AddExpenseScreen({ navigation, route }) {
  const editExpense = route.params?.expense;
  const [amount, setAmount] = useState(editExpense?.amount?.toString() || '');
  const [category, setCategory] = useState(editExpense?.category || '');
  const [paymentMethod, setPaymentMethod] = useState(editExpense?.paymentMethod || '');
  const [description, setDescription] = useState(editExpense?.description || '');
  const [loading, setLoading] = useState(false);

  const { addExpense, updateExpense } = useExpense();

  const handleSubmit = async () => {
    if (!amount || !category || !paymentMethod) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    setLoading(true);
    const expenseData = {
      amount: parseFloat(amount),
      category,
      paymentMethod,
      description,
      date: new Date()
    };

    let result;
    if (editExpense) {
      result = await updateExpense(editExpense._id, expenseData);
    } else {
      result = await addExpense(expenseData);
    }

    setLoading(false);

    if (result.success) {
      if (result.offline) {
        Alert.alert('Saved Offline', 'Expense will sync when online');
      }
      navigation.goBack();
    } else {
      Alert.alert('Error', result.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{editExpense ? 'Edit Expense' : 'Add Expense'}</Text>

      <Text style={styles.label}>Amount (₹) *</Text>
      <TextInput
        style={styles.input}
        placeholder="0.00"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Category *</Text>
      <View style={styles.optionsGrid}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.option, category === cat && styles.optionSelected]}
            onPress={() => setCategory(cat)}
          >
            <Text style={[styles.optionText, category === cat && styles.optionTextSelected]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Payment Method *</Text>
      <View style={styles.optionsRow}>
        {PAYMENT_METHODS.map((method) => (
          <TouchableOpacity
            key={method}
            style={[styles.option, paymentMethod === method && styles.optionSelected]}
            onPress={() => setPaymentMethod(method)}
          >
            <Text style={[styles.optionText, paymentMethod === method && styles.optionTextSelected]}>{method}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Description (Optional)</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Add a note..."
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Saving...' : (editExpense ? 'Update' : 'Add Expense')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 30, marginTop: 40 },
  label: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 10, marginTop: 15 },
  input: { backgroundColor: '#fff', padding: 15, borderRadius: 10, fontSize: 16 },
  textArea: { height: 100, textAlignVertical: 'top' },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap' },
  option: { backgroundColor: '#fff', padding: 12, borderRadius: 8, margin: 5, borderWidth: 2, borderColor: '#fff' },
  optionSelected: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  optionText: { color: '#333', fontWeight: '500' },
  optionTextSelected: { color: '#fff' },
  button: { backgroundColor: '#4CAF50', padding: 18, borderRadius: 10, alignItems: 'center', marginTop: 30, marginBottom: 50 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
