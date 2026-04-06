import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';

import { logger } from '../utils/logger';
import { paymentService } from '../services/paymentService';

import { useAuth } from './AuthContext';

// Create context
const PaymentContext = createContext();

// Payment status types
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  CANCELLED: 'cancelled',
};

// Payment methods
export const PAYMENT_METHOD_TYPES = {
  // RENAMED to avoid duplicate key
  CREDIT_CARD: 'credit_card',
  DEBIT_CARD: 'debit_card',
  PAYPAL: 'paypal',
  BANK_TRANSFER: 'bank_transfer',
  MOBILE_MONEY: 'mobile_money',
  CRYPTO: 'crypto',
};

// Subscription plans
export const SUBSCRIPTION_PLANS = {
  FREE: 'free',
  BASIC: 'basic',
  PREMIUM: 'premium',
  ENTERPRISE: 'enterprise',
};

// Transaction types
export const TRANSACTION_TYPES = {
  PAYMENT: 'payment',
  REFUND: 'refund',
  WITHDRAWAL: 'withdrawal',
  DEPOSIT: 'deposit',
  SUBSCRIPTION: 'subscription',
};

// Invoice status
export const INVOICE_STATUS = {
  DRAFT: 'draft',
  SENT: 'sent',
  PAID: 'paid',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled',
};

// Initial state
const initialState = {
  transactions: [],
  currentTransaction: null,
  subscriptions: [],
  currentSubscription: null,
  invoices: [],
  userPaymentMethods: [], // RENAMED to avoid duplicate key
  wallet: {
    balance: 0,
    currency: 'USD',
    transactions: [],
  },
  analytics: {
    totalSpent: 0,
    totalTransactions: 0,
    averageTransactionValue: 0,
    successfulPayments: 0,
    failedPayments: 0,
    refundedAmount: 0,
  },
  loading: false,
  error: null,
  filters: {
    type: null,
    status: null,
    dateRange: { start: null, end: null },
    minAmount: null,
    maxAmount: null,
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
};

// Context provider component
export const PaymentProvider = ({ children }) => {
  const { user } = useAuth();
  const [state, setState] = useState(initialState);

  // Fetch transactions
  const fetchTransactions = useCallback(
    async (filters = {}) => {
      if (!user) return;

      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response = await paymentService.getTransactions({
          ...state.filters,
          ...filters,
          page: state.pagination.page,
          limit: state.pagination.limit,
        });

        setState((prev) => ({
          ...prev,
          transactions: response.data,
          pagination: response.pagination,
          loading: false,
        }));
      } catch (error) {
        logger.error('Failed to fetch transactions:', error);
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error.message || 'Failed to fetch transactions',
        }));
      }
    },
    [user, state.filters, state.pagination.page, state.pagination.limit]
  );

  // Fetch transaction by ID
  const fetchTransactionById = useCallback(
    async (transactionId) => {
      if (!user) return;

      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const transaction = await paymentService.getTransactionById(transactionId);
        setState((prev) => ({
          ...prev,
          currentTransaction: transaction,
          loading: false,
        }));
        return transaction;
      } catch (error) {
        logger.error('Failed to fetch transaction:', error);
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error.message || 'Failed to fetch transaction',
        }));
      }
    },
    [user]
  );

  // Fetch subscriptions
  const fetchSubscriptions = useCallback(async () => {
    if (!user) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const subscriptions = await paymentService.getSubscriptions();
      const currentSubscription = subscriptions.find((sub) => sub.status === 'active');

      setState((prev) => ({
        ...prev,
        subscriptions,
        currentSubscription,
        loading: false,
      }));
    } catch (error) {
      logger.error('Failed to fetch subscriptions:', error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to fetch subscriptions',
      }));
    }
  }, [user]);

  // Fetch invoices
  const fetchInvoices = useCallback(async () => {
    if (!user) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const invoices = await paymentService.getInvoices();
      setState((prev) => ({
        ...prev,
        invoices,
        loading: false,
      }));
    } catch (error) {
      logger.error('Failed to fetch invoices:', error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to fetch invoices',
      }));
    }
  }, [user]);

  // Fetch payment methods
  const fetchPaymentMethods = useCallback(async () => {
    if (!user) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const paymentMethods = await paymentService.getPaymentMethods();
      setState((prev) => ({
        ...prev,
        userPaymentMethods: paymentMethods, // UPDATED state key
        loading: false,
      }));
    } catch (error) {
      logger.error('Failed to fetch payment methods:', error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to fetch payment methods',
      }));
    }
  }, [user]);

  // Fetch wallet
  const fetchWallet = useCallback(async () => {
    if (!user) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const wallet = await paymentService.getWallet();
      setState((prev) => ({
        ...prev,
        wallet,
        loading: false,
      }));
    } catch (error) {
      logger.error('Failed to fetch wallet:', error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to fetch wallet',
      }));
    }
  }, [user]);

  // Fetch analytics
  const fetchAnalytics = useCallback(async () => {
    if (!user || user.role !== 'admin') return;

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const analytics = await paymentService.getAnalytics();
      setState((prev) => ({
        ...prev,
        analytics,
        loading: false,
      }));
    } catch (error) {
      logger.error('Failed to fetch analytics:', error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to fetch analytics',
      }));
    }
  }, [user]);

  // Process payment
  const processPayment = useCallback(
    async (paymentData) => {
      if (!user) throw new Error('User not authenticated');

      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const result = await paymentService.processPayment(paymentData);

        // Refresh relevant data
        await Promise.all([fetchTransactions(), fetchWallet(), fetchSubscriptions()]);

        setState((prev) => ({ ...prev, loading: false }));
        return result;
      } catch (error) {
        logger.error('Failed to process payment:', error);
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error.message || 'Failed to process payment',
        }));
        throw error;
      }
    },
    [user, fetchTransactions, fetchWallet, fetchSubscriptions]
  );

  // Subscribe to plan
  const subscribe = useCallback(
    async (planId, paymentMethodId) => {
      if (!user) throw new Error('User not authenticated');

      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const subscription = await paymentService.subscribe(planId, paymentMethodId);

        // Refresh subscriptions
        await fetchSubscriptions();

        setState((prev) => ({ ...prev, loading: false }));
        return subscription;
      } catch (error) {
        logger.error('Failed to subscribe:', error);
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error.message || 'Failed to subscribe',
        }));
        throw error;
      }
    },
    [user, fetchSubscriptions]
  );

  // Cancel subscription
  const cancelSubscription = useCallback(
    async (subscriptionId, reason) => {
      if (!user) throw new Error('User not authenticated');

      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        await paymentService.cancelSubscription(subscriptionId, reason);

        // Refresh subscriptions
        await fetchSubscriptions();

        setState((prev) => ({ ...prev, loading: false }));
      } catch (error) {
        logger.error('Failed to cancel subscription:', error);
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error.message || 'Failed to cancel subscription',
        }));
        throw error;
      }
    },
    [user, fetchSubscriptions]
  );

  // Add payment method
  const addPaymentMethod = useCallback(
    async (methodData) => {
      if (!user) throw new Error('User not authenticated');

      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const method = await paymentService.addPaymentMethod(methodData);

        // Refresh payment methods
        await fetchPaymentMethods();

        setState((prev) => ({ ...prev, loading: false }));
        return method;
      } catch (error) {
        logger.error('Failed to add payment method:', error);
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error.message || 'Failed to add payment method',
        }));
        throw error;
      }
    },
    [user, fetchPaymentMethods]
  );

  // Remove payment method
  const removePaymentMethod = useCallback(
    async (methodId) => {
      if (!user) throw new Error('User not authenticated');

      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        await paymentService.removePaymentMethod(methodId);

        // Refresh payment methods
        await fetchPaymentMethods();

        setState((prev) => ({ ...prev, loading: false }));
      } catch (error) {
        logger.error('Failed to remove payment method:', error);
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error.message || 'Failed to remove payment method',
        }));
        throw error;
      }
    },
    [user, fetchPaymentMethods]
  );

  // Set default payment method
  const setDefaultPaymentMethod = useCallback(
    async (methodId) => {
      if (!user) throw new Error('User not authenticated');

      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        await paymentService.setDefaultPaymentMethod(methodId);

        // Refresh payment methods
        await fetchPaymentMethods();

        setState((prev) => ({ ...prev, loading: false }));
      } catch (error) {
        logger.error('Failed to set default payment method:', error);
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error.message || 'Failed to set default payment method',
        }));
        throw error;
      }
    },
    [user, fetchPaymentMethods]
  );

  // Request refund
  const requestRefund = useCallback(
    async (transactionId, reason) => {
      if (!user) throw new Error('User not authenticated');

      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const refund = await paymentService.requestRefund(transactionId, reason);

        // Refresh transactions
        await fetchTransactions();

        setState((prev) => ({ ...prev, loading: false }));
        return refund;
      } catch (error) {
        logger.error('Failed to request refund:', error);
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error.message || 'Failed to request refund',
        }));
        throw error;
      }
    },
    [user, fetchTransactions]
  );

  // Withdraw from wallet
  const withdrawFromWallet = useCallback(
    async (amount, bankDetails) => {
      if (!user) throw new Error('User not authenticated');

      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const withdrawal = await paymentService.withdrawFromWallet(amount, bankDetails);

        // Refresh wallet
        await fetchWallet();

        setState((prev) => ({ ...prev, loading: false }));
        return withdrawal;
      } catch (error) {
        logger.error('Failed to withdraw from wallet:', error);
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error.message || 'Failed to withdraw from wallet',
        }));
        throw error;
      }
    },
    [user, fetchWallet]
  );

  // Update filters
  const updateFilters = useCallback((filters) => {
    setState((prev) => ({
      ...prev,
      filters: { ...prev.filters, ...filters },
      pagination: { ...prev.pagination, page: 1 },
    }));
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setState((prev) => ({
      ...prev,
      filters: initialState.filters,
      pagination: { ...prev.pagination, page: 1 },
    }));
  }, []);

  // Change page
  const changePage = useCallback((page) => {
    setState((prev) => ({
      ...prev,
      pagination: { ...prev.pagination, page },
    }));
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // Get default payment method
  const defaultPaymentMethod = useMemo(() => {
    return state.userPaymentMethods.find((method) => method.isDefault);
  }, [state.userPaymentMethods]);

  // Get active subscription
  const activeSubscription = useMemo(() => {
    return state.subscriptions.find((sub) => sub.status === 'active');
  }, [state.subscriptions]);

  // Calculate total spent
  const totalSpent = useMemo(() => {
    return state.transactions
      .filter((t) => t.status === PAYMENT_STATUS.COMPLETED)
      .reduce((sum, t) => sum + t.amount, 0);
  }, [state.transactions]);

  // Load initial data
  useEffect(() => {
    if (user) {
      fetchTransactions();
      fetchSubscriptions();
      fetchInvoices();
      fetchPaymentMethods();
      fetchWallet();

      if (user.role === 'admin') {
        fetchAnalytics();
      }
    }
  }, [
    user,
    fetchTransactions,
    fetchSubscriptions,
    fetchInvoices,
    fetchPaymentMethods,
    fetchWallet,
    fetchAnalytics,
  ]);

  // Refetch when filters or pagination change
  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user, state.filters, state.pagination.page, fetchTransactions]);

  const value = {
    // State
    transactions: state.transactions,
    currentTransaction: state.currentTransaction,
    subscriptions: state.subscriptions,
    currentSubscription: state.currentSubscription,
    invoices: state.invoices,
    userPaymentMethods: state.userPaymentMethods, // UPDATED export key
    wallet: state.wallet,
    analytics: state.analytics,
    loading: state.loading,
    error: state.error,
    filters: state.filters,
    pagination: state.pagination,

    // Computed
    defaultPaymentMethod,
    activeSubscription,
    totalSpent,

    // Actions
    fetchTransactions,
    fetchTransactionById,
    fetchSubscriptions,
    fetchInvoices,
    fetchPaymentMethods,
    fetchWallet,
    fetchAnalytics,
    processPayment,
    subscribe,
    cancelSubscription,
    addPaymentMethod,
    removePaymentMethod,
    setDefaultPaymentMethod,
    requestRefund,
    withdrawFromWallet,
    updateFilters,
    clearFilters,
    changePage,
    clearError,

    // Constants
    paymentStatus: PAYMENT_STATUS,
    paymentMethodTypes: PAYMENT_METHOD_TYPES, // RENAMED export
    subscriptionPlans: SUBSCRIPTION_PLANS,
    transactionTypes: TRANSACTION_TYPES,
    invoiceStatus: INVOICE_STATUS,
  };

  return <PaymentContext.Provider value={value}>{children}</PaymentContext.Provider>;
};

// Custom hook to use payment context
export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};

// Higher-order component
export const withPayment = (Component) => {
  return function WrappedComponent(props) {
    return (
      <PaymentContext.Consumer>
        {(paymentProps) => <Component {...props} payment={paymentProps} />}
      </PaymentContext.Consumer>
    );
  };
};
