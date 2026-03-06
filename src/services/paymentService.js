import { db, auth } from '../config/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  Timestamp,
  runTransaction,
  increment,
} from 'firebase/firestore';
import axios from 'axios';

class PaymentService {
  constructor() {
    this.stripePublicKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
    this.stripeSecretKey = process.env.REACT_APP_STRIPE_SECRET_KEY;
    this.paypalClientId = process.env.REACT_APP_PAYPAL_CLIENT_ID;
    this.paypalSecret = process.env.REACT_APP_PAYPAL_SECRET;
    this.razorpayKeyId = process.env.REACT_APP_RAZORPAY_KEY_ID;
    this.razorpayKeySecret = process.env.REACT_APP_RAZORPAY_KEY_SECRET;

    this.baseURL = process.env.REACT_APP_API_URL || 'https://api.yourdomain.com';
    this.webhookSecret = process.env.REACT_APP_PAYMENT_WEBHOOK_SECRET;
  }

  // ==================== STRIPE INTEGRATION ====================

  async createStripePaymentIntent(amount, currency = 'usd', metadata = {}) {
    try {
      const response = await axios.post(
        `${this.baseURL}/api/payments/stripe/create-intent`,
        {
          amount: Math.round(amount * 100), // Convert to cents
          currency,
          metadata: {
            ...metadata,
            userId: auth.currentUser?.uid,
            timestamp: new Date().toISOString(),
          },
        },
        {
          headers: {
            Authorization: `Bearer ${await auth.currentUser?.getIdToken()}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Save payment intent to database
      await this.logPaymentIntent({
        paymentIntentId: response.data.id,
        amount,
        currency,
        status: 'created',
        metadata,
      });

      return {
        success: true,
        clientSecret: response.data.client_secret,
        paymentIntentId: response.data.id,
      };
    } catch (error) {
      console.error('Error creating Stripe payment intent:', error);
      return this.handlePaymentError(error);
    }
  }

  async confirmStripePayment(paymentIntentId) {
    try {
      const response = await axios.post(
        `${this.baseURL}/api/payments/stripe/confirm`,
        { paymentIntentId },
        {
          headers: {
            Authorization: `Bearer ${await auth.currentUser?.getIdToken()}`,
          },
        }
      );

      if (response.data.status === 'succeeded') {
        await this.processSuccessfulPayment({
          provider: 'stripe',
          transactionId: paymentIntentId,
          amount: response.data.amount / 100,
          currency: response.data.currency,
          metadata: response.data.metadata,
        });
      }

      return response.data;
    } catch (error) {
      console.error('Error confirming Stripe payment:', error);
      throw error;
    }
  }

  async createStripeSubscription(priceId, customerId = null) {
    try {
      const response = await axios.post(
        `${this.baseURL}/api/payments/stripe/create-subscription`,
        {
          priceId,
          customerId,
          userId: auth.currentUser?.uid,
          email: auth.currentUser?.email,
        },
        {
          headers: {
            Authorization: `Bearer ${await auth.currentUser?.getIdToken()}`,
          },
        }
      );

      // Save subscription to database
      await this.saveSubscription({
        subscriptionId: response.data.id,
        provider: 'stripe',
        priceId,
        status: 'active',
        currentPeriodStart: new Date(response.data.current_period_start * 1000),
        currentPeriodEnd: new Date(response.data.current_period_end * 1000),
      });

      return response.data;
    } catch (error) {
      console.error('Error creating Stripe subscription:', error);
      throw error;
    }
  }

  async cancelStripeSubscription(subscriptionId) {
    try {
      const response = await axios.post(
        `${this.baseURL}/api/payments/stripe/cancel-subscription`,
        { subscriptionId },
        {
          headers: {
            Authorization: `Bearer ${await auth.currentUser?.getIdToken()}`,
          },
        }
      );

      // Update subscription status in database
      await this.updateSubscriptionStatus(subscriptionId, 'cancelled');

      return response.data;
    } catch (error) {
      console.error('Error cancelling Stripe subscription:', error);
      throw error;
    }
  }

  // ==================== PAYPAL INTEGRATION ====================

  async createPayPalOrder(amount, currency = 'USD', metadata = {}) {
    try {
      const response = await axios.post(
        `${this.baseURL}/api/payments/paypal/create-order`,
        {
          amount,
          currency,
          metadata: {
            ...metadata,
            userId: auth.currentUser?.uid,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${await auth.currentUser?.getIdToken()}`,
          },
        }
      );

      // Save order to database
      await this.logPaymentIntent({
        paymentIntentId: response.data.id,
        amount,
        currency,
        provider: 'paypal',
        status: 'created',
        metadata,
      });

      return {
        success: true,
        orderId: response.data.id,
        approvalUrl: response.data.links.find((l) => l.rel === 'approve').href,
      };
    } catch (error) {
      console.error('Error creating PayPal order:', error);
      return this.handlePaymentError(error);
    }
  }

  async capturePayPalOrder(orderId) {
    try {
      const response = await axios.post(
        `${this.baseURL}/api/payments/paypal/capture-order`,
        { orderId },
        {
          headers: {
            Authorization: `Bearer ${await auth.currentUser?.getIdToken()}`,
          },
        }
      );

      if (response.data.status === 'COMPLETED') {
        await this.processSuccessfulPayment({
          provider: 'paypal',
          transactionId: response.data.purchase_units[0].payments.captures[0].id,
          amount: parseFloat(response.data.purchase_units[0].amount.value),
          currency: response.data.purchase_units[0].amount.currency_code,
          metadata: response.data.purchase_units[0].custom_id,
        });
      }

      return response.data;
    } catch (error) {
      console.error('Error capturing PayPal order:', error);
      throw error;
    }
  }

  // ==================== RAZORPAY INTEGRATION ====================

  async createRazorpayOrder(amount, currency = 'INR', metadata = {}) {
    try {
      const response = await axios.post(
        `${this.baseURL}/api/payments/razorpay/create-order`,
        {
          amount: Math.round(amount * 100), // Convert to paise
          currency,
          metadata: {
            ...metadata,
            userId: auth.currentUser?.uid,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${await auth.currentUser?.getIdToken()}`,
          },
        }
      );

      return {
        success: true,
        orderId: response.data.id,
        amount: response.data.amount,
        currency: response.data.currency,
      };
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      throw error;
    }
  }

  async verifyRazorpayPayment(orderId, paymentId, signature) {
    try {
      const response = await axios.post(
        `${this.baseURL}/api/payments/razorpay/verify`,
        {
          orderId,
          paymentId,
          signature,
        },
        {
          headers: {
            Authorization: `Bearer ${await auth.currentUser?.getIdToken()}`,
          },
        }
      );

      if (response.data.verified) {
        await this.processSuccessfulPayment({
          provider: 'razorpay',
          transactionId: paymentId,
          amount: response.data.amount / 100,
          currency: response.data.currency,
          metadata: response.data.metadata,
        });
      }

      return response.data;
    } catch (error) {
      console.error('Error verifying Razorpay payment:', error);
      throw error;
    }
  }

  // ==================== WALLET MANAGEMENT ====================

  async createWallet(userId) {
    try {
      const walletRef = doc(db, 'wallets', userId);
      const walletData = {
        userId,
        balance: 0,
        currency: 'USD',
        status: 'active',
        transactions: [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await setDoc(walletRef, walletData);
      return { success: true, data: walletData };
    } catch (error) {
      console.error('Error creating wallet:', error);
      throw error;
    }
  }

  async getWalletBalance(userId) {
    try {
      const walletRef = doc(db, 'wallets', userId);
      const walletDoc = await getDoc(walletRef);

      if (walletDoc.exists()) {
        return {
          success: true,
          balance: walletDoc.data().balance,
          currency: walletDoc.data().currency,
        };
      }

      // Create wallet if it doesn't exist
      await this.createWallet(userId);
      return { success: true, balance: 0, currency: 'USD' };
    } catch (error) {
      console.error('Error getting wallet balance:', error);
      throw error;
    }
  }

  async addToWallet(userId, amount, paymentMethod, metadata = {}) {
    try {
      const walletRef = doc(db, 'wallets', userId);

      const result = await runTransaction(db, async (transaction) => {
        const walletDoc = await transaction.get(walletRef);

        if (!walletDoc.exists()) {
          throw new Error('Wallet not found');
        }

        const newBalance = walletDoc.data().balance + amount;

        transaction.update(walletRef, {
          balance: newBalance,
          updatedAt: Timestamp.now(),
        });

        // Add transaction record
        const transactionRef = doc(collection(db, 'walletTransactions'));
        const transactionData = {
          walletId: userId,
          type: 'credit',
          amount,
          paymentMethod,
          balance: newBalance,
          metadata,
          status: 'completed',
          createdAt: Timestamp.now(),
        };

        transaction.set(transactionRef, transactionData);

        return { newBalance, transactionId: transactionRef.id };
      });

      return { success: true, ...result };
    } catch (error) {
      console.error('Error adding to wallet:', error);
      throw error;
    }
  }

  async withdrawFromWallet(userId, amount, withdrawalMethod, metadata = {}) {
    try {
      const walletRef = doc(db, 'wallets', userId);

      const result = await runTransaction(db, async (transaction) => {
        const walletDoc = await transaction.get(walletRef);

        if (!walletDoc.exists()) {
          throw new Error('Wallet not found');
        }

        const currentBalance = walletDoc.data().balance;
        if (currentBalance < amount) {
          throw new Error('Insufficient balance');
        }

        const newBalance = currentBalance - amount;

        transaction.update(walletRef, {
          balance: newBalance,
          updatedAt: Timestamp.now(),
        });

        // Add transaction record
        const transactionRef = doc(collection(db, 'walletTransactions'));
        const transactionData = {
          walletId: userId,
          type: 'debit',
          amount,
          withdrawalMethod,
          balance: newBalance,
          metadata,
          status: 'pending', // Pending until withdrawal is processed
          createdAt: Timestamp.now(),
        };

        transaction.set(transactionRef, transactionData);

        // Create withdrawal request
        const withdrawalRef = doc(collection(db, 'withdrawalRequests'));
        const withdrawalData = {
          userId,
          amount,
          method: withdrawalMethod,
          status: 'pending',
          metadata,
          transactionId: transactionRef.id,
          createdAt: Timestamp.now(),
        };

        transaction.set(withdrawalRef, withdrawalData);

        return { newBalance, transactionId: transactionRef.id, withdrawalId: withdrawalRef.id };
      });

      return { success: true, ...result };
    } catch (error) {
      console.error('Error withdrawing from wallet:', error);
      throw error;
    }
  }

  async getWalletTransactions(userId, limit = 50, startAfter = null) {
    try {
      let q = query(
        collection(db, 'walletTransactions'),
        where('walletId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limit)
      );

      if (startAfter) {
        q = query(q, startAfter(startAfter));
      }

      const snapshot = await getDocs(q);
      const transactions = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
      }));

      return {
        success: true,
        data: transactions,
        lastDoc: snapshot.docs[snapshot.docs.length - 1],
      };
    } catch (error) {
      console.error('Error getting wallet transactions:', error);
      throw error;
    }
  }

  // ==================== SUBSCRIPTION MANAGEMENT ====================

  async getSubscriptionPlans() {
    try {
      const plansRef = collection(db, 'subscriptionPlans');
      const q = query(plansRef, where('active', '==', true), orderBy('price'));
      const snapshot = await getDocs(q);

      const plans = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return { success: true, data: plans };
    } catch (error) {
      console.error('Error getting subscription plans:', error);
      throw error;
    }
  }

  async getUserSubscription(userId) {
    try {
      const q = query(
        collection(db, 'subscriptions'),
        where('userId', '==', userId),
        where('status', 'in', ['active', 'trialing']),
        limit(1)
      );

      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const subscription = snapshot.docs[0];
        return {
          success: true,
          data: {
            id: subscription.id,
            ...subscription.data(),
          },
        };
      }

      return { success: true, data: null };
    } catch (error) {
      console.error('Error getting user subscription:', error);
      throw error;
    }
  }

  async saveSubscription(subscriptionData) {
    try {
      const subscriptionRef = doc(collection(db, 'subscriptions'));
      const data = {
        ...subscriptionData,
        userId: auth.currentUser?.uid,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await setDoc(subscriptionRef, data);
      return { success: true, id: subscriptionRef.id };
    } catch (error) {
      console.error('Error saving subscription:', error);
      throw error;
    }
  }

  async updateSubscriptionStatus(subscriptionId, status) {
    try {
      const subscriptionRef = doc(db, 'subscriptions', subscriptionId);
      await updateDoc(subscriptionRef, {
        status,
        updatedAt: Timestamp.now(),
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating subscription status:', error);
      throw error;
    }
  }

  // ==================== INVOICE MANAGEMENT ====================

  async generateInvoice(paymentData) {
    try {
      const invoiceRef = doc(collection(db, 'invoices'));
      const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const invoiceData = {
        invoiceNumber,
        userId: auth.currentUser?.uid,
        ...paymentData,
        status: 'paid',
        createdAt: Timestamp.now(),
        dueDate: Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)), // 30 days
      };

      await setDoc(invoiceRef, invoiceData);

      // Generate PDF invoice
      const pdfUrl = await this.generateInvoicePDF(invoiceData);

      return {
        success: true,
        invoiceId: invoiceRef.id,
        invoiceNumber,
        pdfUrl,
      };
    } catch (error) {
      console.error('Error generating invoice:', error);
      throw error;
    }
  }

  async generateInvoicePDF(invoiceData) {
    try {
      const response = await axios.post(`${this.baseURL}/api/invoices/generate-pdf`, invoiceData, {
        headers: {
          Authorization: `Bearer ${await auth.currentUser?.getIdToken()}`,
        },
        responseType: 'blob',
      });

      // Upload to Cloudinary or storage
      const file = new File([response.data], `invoice-${invoiceData.invoiceNumber}.pdf`, {
        type: 'application/pdf',
      });
      const pdfUrl = await this.uploadInvoiceToStorage(file, invoiceData.invoiceNumber);

      return pdfUrl;
    } catch (error) {
      console.error('Error generating invoice PDF:', error);
      throw error;
    }
  }

  async uploadInvoiceToStorage(file, invoiceNumber) {
    // Implementation depends on your storage solution
    // Could use Firebase Storage, Cloudinary, etc.
    return 'https://storage.googleapis.com/your-bucket/invoices/' + invoiceNumber + '.pdf';
  }

  async getUserInvoices(userId, limit = 20) {
    try {
      const q = query(
        collection(db, 'invoices'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limit)
      );

      const snapshot = await getDocs(q);
      const invoices = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
      }));

      return { success: true, data: invoices };
    } catch (error) {
      console.error('Error getting user invoices:', error);
      throw error;
    }
  }

  // ==================== REFUND MANAGEMENT ====================

  async processRefund(transactionId, amount = null, reason = '') {
    try {
      const response = await axios.post(
        `${this.baseURL}/api/payments/process-refund`,
        {
          transactionId,
          amount,
          reason,
          userId: auth.currentUser?.uid,
        },
        {
          headers: {
            Authorization: `Bearer ${await auth.currentUser?.getIdToken()}`,
          },
        }
      );

      // Log refund in database
      await this.logRefund({
        transactionId,
        refundId: response.data.id,
        amount: response.data.amount,
        status: 'processed',
        reason,
      });

      return response.data;
    } catch (error) {
      console.error('Error processing refund:', error);
      throw error;
    }
  }

  // ==================== PAYOUT MANAGEMENT ====================

  async processPayout(userId, amount, payoutMethod, metadata = {}) {
    try {
      // Check wallet balance
      const wallet = await this.getWalletBalance(userId);
      if (wallet.balance < amount) {
        throw new Error('Insufficient balance');
      }

      const response = await axios.post(
        `${this.baseURL}/api/payments/process-payout`,
        {
          userId,
          amount,
          payoutMethod,
          metadata,
        },
        {
          headers: {
            Authorization: `Bearer ${await auth.currentUser?.getIdToken()}`,
          },
        }
      );

      // Deduct from wallet
      await this.withdrawFromWallet(userId, amount, payoutMethod, {
        payoutId: response.data.id,
        ...metadata,
      });

      return response.data;
    } catch (error) {
      console.error('Error processing payout:', error);
      throw error;
    }
  }

  // ==================== WEBHOOK HANDLING ====================

  async handleWebhook(event, signature) {
    try {
      // Verify webhook signature
      if (!this.verifyWebhookSignature(event, signature)) {
        throw new Error('Invalid webhook signature');
      }

      const eventType = event.type;
      const eventData = event.data.object;

      switch (eventType) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSuccess(eventData);
          break;
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailure(eventData);
          break;
        case 'invoice.payment_succeeded':
          await this.handleInvoicePaymentSuccess(eventData);
          break;
        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailure(eventData);
          break;
        case 'customer.subscription.created':
          await this.handleSubscriptionCreated(eventData);
          break;
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(eventData);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(eventData);
          break;
        case 'charge.refunded':
          await this.handleRefundProcessed(eventData);
          break;
        default:
          console.log(`Unhandled event type: ${eventType}`);
      }

      return { success: true, received: true };
    } catch (error) {
      console.error('Error handling webhook:', error);
      throw error;
    }
  }

  verifyWebhookSignature(event, signature) {
    // Implement webhook signature verification based on provider
    return true; // Placeholder
  }

  async handlePaymentSuccess(paymentData) {
    await this.processSuccessfulPayment({
      provider: 'stripe',
      transactionId: paymentData.id,
      amount: paymentData.amount / 100,
      currency: paymentData.currency,
      metadata: paymentData.metadata,
    });
  }

  async handlePaymentFailure(paymentData) {
    await this.logFailedPayment({
      transactionId: paymentData.id,
      error: paymentData.last_payment_error,
      metadata: paymentData.metadata,
    });
  }

  async handleInvoicePaymentSuccess(invoiceData) {
    // Update subscription status, send email, etc.
    console.log('Invoice payment succeeded:', invoiceData);
  }

  async handleInvoicePaymentFailure(invoiceData) {
    // Notify user, attempt retry, etc.
    console.log('Invoice payment failed:', invoiceData);
  }

  async handleSubscriptionCreated(subscriptionData) {
    await this.saveSubscription({
      subscriptionId: subscriptionData.id,
      provider: 'stripe',
      status: subscriptionData.status,
      currentPeriodStart: new Date(subscriptionData.current_period_start * 1000),
      currentPeriodEnd: new Date(subscriptionData.current_period_end * 1000),
      metadata: subscriptionData.metadata,
    });
  }

  async handleSubscriptionUpdated(subscriptionData) {
    await this.updateSubscriptionStatus(subscriptionData.id, subscriptionData.status);
  }

  async handleSubscriptionDeleted(subscriptionData) {
    await this.updateSubscriptionStatus(subscriptionData.id, 'cancelled');
  }

  async handleRefundProcessed(refundData) {
    await this.logRefund({
      transactionId: refundData.payment_intent,
      refundId: refundData.id,
      amount: refundData.amount / 100,
      status: 'completed',
      reason: refundData.reason,
    });
  }

  // ==================== DATABASE OPERATIONS ====================

  async logPaymentIntent(paymentData) {
    try {
      const paymentRef = doc(collection(db, 'paymentIntents'));
      await setDoc(paymentRef, {
        ...paymentData,
        userId: auth.currentUser?.uid,
        createdAt: Timestamp.now(),
      });
      return paymentRef.id;
    } catch (error) {
      console.error('Error logging payment intent:', error);
      throw error;
    }
  }

  async processSuccessfulPayment(paymentData) {
    try {
      // Update payment intent status
      const q = query(
        collection(db, 'paymentIntents'),
        where('paymentIntentId', '==', paymentData.transactionId),
        limit(1)
      );

      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const paymentRef = doc(db, 'paymentIntents', snapshot.docs[0].id);
        await updateDoc(paymentRef, {
          status: 'succeeded',
          completedAt: Timestamp.now(),
        });
      }

      // Add to wallet if applicable
      if (paymentData.metadata?.walletCredit) {
        await this.addToWallet(
          paymentData.metadata.userId,
          paymentData.amount,
          paymentData.provider,
          paymentData
        );
      }

      // Generate invoice
      await this.generateInvoice(paymentData);

      // Send confirmation email
      await this.sendPaymentConfirmation(paymentData);

      return { success: true };
    } catch (error) {
      console.error('Error processing successful payment:', error);
      throw error;
    }
  }

  async logFailedPayment(failureData) {
    try {
      const failureRef = doc(collection(db, 'paymentFailures'));
      await setDoc(failureRef, {
        ...failureData,
        userId: auth.currentUser?.uid,
        createdAt: Timestamp.now(),
      });
      return failureRef.id;
    } catch (error) {
      console.error('Error logging failed payment:', error);
      throw error;
    }
  }

  async logRefund(refundData) {
    try {
      const refundRef = doc(collection(db, 'refunds'));
      await setDoc(refundRef, {
        ...refundData,
        userId: auth.currentUser?.uid,
        processedAt: Timestamp.now(),
      });
      return refundRef.id;
    } catch (error) {
      console.error('Error logging refund:', error);
      throw error;
    }
  }

  // ==================== EMAIL NOTIFICATIONS ====================

  async sendPaymentConfirmation(paymentData) {
    // Implement email sending logic
    console.log('Sending payment confirmation email:', paymentData);
  }

  // ==================== ERROR HANDLING ====================

  handlePaymentError(error) {
    const errorResponse = {
      success: false,
      error: 'Payment processing failed',
      code: error.code || 'unknown_error',
    };

    if (error.response) {
      // Server responded with error
      errorResponse.message = error.response.data.message || error.message;
      errorResponse.statusCode = error.response.status;
    } else if (error.request) {
      // Request made but no response
      errorResponse.message = 'No response from payment server';
      errorResponse.code = 'network_error';
    } else {
      // Something else happened
      errorResponse.message = error.message;
    }

    // Log error to monitoring service
    this.logPaymentError(errorResponse);

    return errorResponse;
  }

  async logPaymentError(errorData) {
    try {
      const errorRef = doc(collection(db, 'paymentErrors'));
      await setDoc(errorRef, {
        ...errorData,
        userId: auth.currentUser?.uid,
        timestamp: Timestamp.now(),
      });
    } catch (logError) {
      console.error('Error logging payment error:', logError);
    }
  }

  // ==================== UTILITY METHODS ====================

  formatAmount(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  }

  calculateTax(amount, taxRate = 0.1) {
    return amount * taxRate;
  }

  calculateTotal(amount, taxRate = 0.1) {
    const tax = this.calculateTax(amount, taxRate);
    return amount + tax;
  }
}

export const paymentService = new PaymentService();
