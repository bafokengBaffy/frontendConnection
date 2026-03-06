import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Clock,
  MessageSquare,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import './CommonPages.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [formStatus, setFormStatus] = useState({
    submitted: false,
    success: false,
    message: '',
  });

  const [loading, setLoading] = useState(false);

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email Us',
      details: 'support@youthentrepreneur.com',
      subDetails: 'info@youthentrepreneur.com',
      action: 'mailto:support@youthentrepreneur.com',
    },
    {
      icon: Phone,
      title: 'Call Us',
      details: '+1 (555) 123-4567',
      subDetails: 'Mon-Fri, 9am-6pm EST',
      action: 'tel:+15551234567',
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      details: '123 Innovation Drive',
      subDetails: 'San Francisco, CA 94105',
      action: 'https://maps.google.com/?q=123+Innovation+Drive+San+Francisco',
    },
    {
      icon: Clock,
      title: 'Business Hours',
      details: 'Monday - Friday',
      subDetails: '9:00 AM - 6:00 PM EST',
    },
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
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
        message: "Thank you for contacting us! We'll get back to you soon.",
      });
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      setFormStatus({
        submitted: true,
        success: false,
        message: 'Something went wrong. Please try again.',
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
      question: 'How quickly do you respond to inquiries?',
      answer: 'We aim to respond to all inquiries within 24-48 hours during business days.',
    },
    {
      question: 'Can I schedule a demo?',
      answer:
        "Absolutely! Please fill out the contact form and mention you'd like a demo, and we'll arrange it.",
    },
    {
      question: 'Do you offer support for international users?',
      answer:
        'Yes, we support users worldwide with 24/7 email support and flexible scheduling for calls.',
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
            Contact Us
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            We're here to help and answer any questions you might have
          </motion.p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="contact-info-section">
        <div className="container">
          <div className="info-grid">
            {contactInfo.map((item, index) => {
              const Icon = item.icon;
              const Content = (
                <>
                  <Icon className="info-icon" />
                  <h3>{item.title}</h3>
                  <p className="info-detail">{item.details}</p>
                  {item.subDetails && <p className="info-subdetail">{item.subDetails}</p>}
                </>
              );

              return item.action ? (
                <motion.a
                  key={index}
                  href={item.action}
                  className="info-card"
                  target={item.action.startsWith('http') ? '_blank' : undefined}
                  rel={item.action.startsWith('http') ? 'noopener noreferrer' : undefined}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  {Content}
                </motion.a>
              ) : (
                <motion.div
                  key={index}
                  className="info-card"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  {Content}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="contact-form-section">
        <div className="container">
          <div className="form-container">
            <motion.div
              className="form-header"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <MessageSquare className="form-icon" />
              <h2>Send us a message</h2>
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
              className="contact-form"
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
                    value={formData.name}
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
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="subject">Subject *</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  placeholder="What is this regarding?"
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="6"
                  placeholder="Tell us how we can help..."
                />
              </div>

              <button type="submit" className="submit-button" disabled={loading}>
                {loading ? (
                  'Sending...'
                ) : (
                  <>
                    Send Message <Send size={18} />
                  </>
                )}
              </button>
            </motion.form>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="contact-faq-section">
        <div className="container">
          <motion.h2
            className="section-title"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Frequently Asked Questions
          </motion.h2>
          <div className="faq-grid">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                className="faq-item"
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
        </div>
      </section>
    </div>
  );
};

export default Contact;
