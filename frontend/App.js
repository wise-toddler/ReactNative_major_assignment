import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ExpenseProvider } from './src/context/ExpenseContext';

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import ExpensesScreen from './src/screens/ExpensesScreen';
import AddExpenseScreen from './src/screens/AddExpenseScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabIcon = ({ label, focused }) => (
  <View style={{ alignItems: 'center' }}>
    <Text style={{ fontSize: 20 }}>
      {label === 'Home' ? '🏠' : label === 'Expenses' ? '💰' : label === 'Add' ? '➕' : '📊'}
    </Text>
    <Text style={{ fontSize: 10, color: focused ? '#4CAF50' : '#999', marginTop: 2 }}>{label}</Text>
  </View>
);

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { height: 70, paddingBottom: 10, paddingTop: 10 },
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="Home" focused={focused} /> }}
      />
      <Tab.Screen
        name="Expenses"
        component={ExpensesScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="Expenses" focused={focused} /> }}
      />
      <Tab.Screen
        name="AddExpense"
        component={AddExpenseScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="Add" focused={focused} /> }}
      />
      <Tab.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="Analytics" focused={focused} /> }}
      />
    </Tab.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#4CAF50' }}>
        <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#fff' }}>PocketExpense+</Text>
        <Text style={{ color: '#E8F5E9', marginTop: 10 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="AddExpense" component={AddExpenseScreen} options={{ presentation: 'modal' }} />
        </>
      ) : (
        <>
          <Stack.Screen name="Auth" component={AuthStack} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ExpenseProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </ExpenseProvider>
    </AuthProvider>
  );
}
