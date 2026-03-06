import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MessageCircle,
  Mail,
  Phone,
  Clock,
  Ticket,
  LifeBuoy,
  Send,
  CheckCircle,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import './CommonPages.css';

const Support = () => {
  const [ticketForm, setTicketForm] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    priority: 'medium',
    message: '',
    attachments: [],
  });

  const [formStatus, setFormStatus] = useState({
    submitted: false,
    success: false,
    message: '',
  });

  const [loading, setLoading] = useState(false);

  const supportOptions = [
    {
      icon: MessageCircle,
      title: 'Live Chat',
      description: 'Chat with our support team in real-time',
      availability: 'Available 24/7',
      action: 'Start Chat',
      status: 'online',
    },
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Get a response within 24 hours',
      availability: 'support@youthentrepreneur.com',
      action: 'Send Email',
      status: 'available',
    },
    {
      icon: Phone,
      title: 'Phone Support',
      description: 'Speak directly with a support agent',
      availability: 'Mon-Fri, 9am-6pm EST',
      action: 'Call Now',
      status: 'limited',
    },
    {
      icon: Ticket,
      title: 'Ticket System',
      description: 'Track and manage your support requests',
      availability: 'Response within 24h',
      action: 'Create Ticket',
      status: 'available',
    },
  ];

  const categories = [
    'Account Issues',
    'Technical Support',
    'Billing Questions',
    'Business Profile',
    'Funding Applications',
    'Mentorship Program',
    'Feature Requests',
    'Report a Problem',
    'Other',
  ];

  const handleChange = (e) => {
    setTicketForm({
      ...ticketForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setFormStatus({
        submitted: true,
        success: true,
        message: "Support ticket created successfully! We'll get back to you soon.",
      });
      setTicketForm({
        name: '',
        email: '',
        subject: '',
        category: '',
        priority: 'medium',
        message: '',
        attachments: [],
      });
    } catch (error) {
      setFormStatus({
        submitted: true,
        success: false,
        message: 'Failed to create ticket. Please try again.',
      });
    } finally {
      setLoading(false);
      setTimeout(() => {
        setFormStatus({ submitted: false, success: false, message: '' });
      }, 5000);
    }
  };

  const faqs = [
    {
      question: 'What is the average response time?',
      answer:
        'We aim to respond to all inquiries within 24 hours. Live chat provides immediate assistance.',
    },
    {
      question: 'Do you offer priority support?',
      answer: 'Yes, premium members have access to priority support with faster response times.',
    },
    {
      question: 'Can I track my support tickets?',
      answer:
        'Yes, you can track all your support tickets through your dashboard under "Support History".',
    },
  ];

  return (
    <div className="common-page">
      {/* Hero Section */}
      <section className="page-hero">
        <div className="hero-content">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Support Center
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            We're here to help you succeed
          </motion.p>
        </div>
      </section>

      {/* Support Options */}
      <section className="support-options">
        <div className="container">
          <div className="options-grid">
            {supportOptions.map((option, index) => {
              const Icon = option.icon;
              return (
                <motion.div
                  key={index}
                  className="option-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className={`option-status ${option.status}`} />
                  <Icon className="option-icon" />
                  <h3>{option.title}</h3>
                  <p className="option-description">{option.description}</p>
                  <p className="option-availability">{option.availability}</p>
                  <button className="option-button">
                    {option.action} <ChevronRight size={16} />
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Ticket Form */}
      <section className="ticket-section">
        <div className="container">
          <div className="ticket-container">
            <motion.div
              className="ticket-header"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <LifeBuoy className="ticket-icon" />
              <h2>Create a Support Ticket</h2>
              <p>Fill out the form below and we'll get back to you as soon as possible</p>
            </motion.div>

            {formStatus.submitted && (
              <motion.div
                className={`alert ${formStatus.success ? 'alert-success' : 'alert-error'}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {formStatus.success ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                {formStatus.message}
              </motion.div>
            )}

            <motion.form
              onSubmit={handleSubmit}
              className="ticket-form"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={ticketForm.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={ticketForm.email}
                    onChange={handleChange}
                    required
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="category">Category *</label>
                  <select
                    id="category"
                    name="category"
                    value={ticketForm.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat, index) => (
                      <option key={index} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="priority">Priority *</label>
                  <select
                    id="priority"
                    name="priority"
                    value={ticketForm.priority}
                    onChange={handleChange}
                    required
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="subject">Subject *</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={ticketForm.subject}
                  onChange={handleChange}
                  required
                  placeholder="Brief summary of your issue"
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={ticketForm.message}
                  onChange={handleChange}
                  required
                  rows="6"
                  placeholder="Please describe your issue in detail..."
                />
              </div>

              <div className="form-group">
                <label htmlFor="attachments">Attachments (Optional)</label>
                <input
                  type="file"
                  id="attachments"
                  name="attachments"
                  multiple
                  onChange={(e) =>
                    setTicketForm({
                      ...ticketForm,
                      attachments: Array.from(e.target.files),
                    })
                  }
                />
                <small>Upload screenshots or files to help us understand your issue better</small>
              </div>

              <button type="submit" className="submit-button" disabled={loading}>
                {loading ? (
                  'Submitting...'
                ) : (
                  <>
                    Submit Ticket <Send size={18} />
                  </>
                )}
              </button>
            </motion.form>
          </div>
        </div>
      </section>

      {/* Support Info */}
      <section className="support-info">
        <div className="container">
          <div className="info-grid">
            <motion.div
              className="info-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Clock className="info-icon" />
              <h3>Response Times</h3>
              <ul>
                <li>Live Chat: Instant</li>
                <li>Email: Within 24h</li>
                <li>Phone: Immediate during hours</li>
                <li>Tickets: Within 24h</li>
              </ul>
            </motion.div>

            <motion.div
              className="info-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <CheckCircle className="info-icon" />
              <h3>Before Contacting Support</h3>
              <ul>
                <li>Check our FAQ section</li>
                <li>Search the Help Center</li>
                <li>Check your account settings</li>
                <li>Review error messages</li>
              </ul>
            </motion.div>

            <motion.div
              className="info-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <AlertCircle className="info-icon" />
              <h3>Quick Tips</h3>
              <ul>
                <li>Provide clear details</li>
                <li>Include relevant screenshots</li>
                <li>Use appropriate category</li>
                <li>Check spam folder for replies</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Mini Section */}
      <section className="support-faq">
        <div className="container">
          <motion.h2
            className="section-title"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Frequently Asked Questions
          </motion.h2>
          <div className="faq-mini-grid">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                className="faq-mini-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <h3>{faq.question}</h3>
                <p>{faq.answer}</p>
              </motion.div>
            ))}
          </div>
          <div className="faq-link">
            <a href="/faq">
              View all FAQs <ChevronRight size={16} />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Support;
