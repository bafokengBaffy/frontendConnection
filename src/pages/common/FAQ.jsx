import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  Search,
  HelpCircle,
  Users,
  Briefcase,
  GraduationCap,
  DollarSign,
  Shield,
  MessageCircle,
} from 'lucide-react';
import './CommonPages.css';

const FAQ = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openItems, setOpenItems] = useState({});

  const categories = [
    { id: 'all', label: 'All Questions', icon: HelpCircle },
    { id: 'general', label: 'General', icon: Users },
    { id: 'business', label: 'Business', icon: Briefcase },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'funding', label: 'Funding', icon: DollarSign },
    { id: 'account', label: 'Account', icon: Shield },
    { id: 'support', label: 'Support', icon: MessageCircle },
  ];

  const faqs = [
    {
      id: 1,
      category: 'general',
      question: 'What is Career Connect Lesotho?',
      answer:
        'Career Connect Lesotho is a comprehensive ecosystem designed to empower students and young professionals with tools, AI-driven career guidance, mentorship, and job opportunities.',
    },
    {
      id: 2,
      category: 'general',
      question: 'Who can join the platform?',
      answer:
        'The platform is open to students looking for internships, mentors looking to give back, and companies seeking fresh talent in Lesotho.',
    },
    {
      id: 3,
      category: 'business',
      question: 'How do I create a business profile?',
      answer:
        'After signing up, navigate to your dashboard and click on "Create Business Profile". Follow the step-by-step guide to input your business details, upload documents, and set up your business page.',
    },
    {
      id: 4,
      category: 'business',
      question: 'Can I have multiple business profiles?',
      answer:
        'Yes, you can create and manage multiple business profiles under one account. Each business will have its own dashboard, analytics, and management tools.',
    },
    {
      id: 5,
      category: 'funding',
      question: 'What funding opportunities are available?',
      answer:
        'We offer various funding opportunities including grants, venture capital connections, angel investors, and crowdfunding campaigns. Each opportunity has specific eligibility criteria and application processes.',
    },
    {
      id: 6,
      category: 'funding',
      question: 'How do I apply for funding?',
      answer:
        'Browse available funding opportunities in the Funding section, check eligibility requirements, and submit your application through our streamlined process. You can track your application status in real-time.',
    },
    {
      id: 7,
      category: 'education',
      question: 'What educational resources do you provide?',
      answer:
        'We offer courses, workshops, webinars, and mentorship programs covering business planning, marketing, finance, leadership, and more. Many resources are free for platform members.',
    },
    {
      id: 8,
      category: 'education',
      question: 'Are there certification programs?',
      answer:
        'Yes, we offer certified entrepreneurship programs in partnership with recognized institutions. Completing these programs adds valuable credentials to your profile.',
    },
    {
      id: 9,
      category: 'account',
      question: 'How do I reset my password?',
      answer:
        'Click on "Forgot Password" on the login page, enter your email address, and follow the instructions sent to your inbox to reset your password securely.',
    },
    {
      id: 10,
      category: 'account',
      question: 'Can I delete my account?',
      answer:
        'Yes, you can delete your account from your profile settings. Note that this action is permanent and will remove all your data from our platform.',
    },
    {
      id: 11,
      category: 'support',
      question: 'How do I contact support?',
      answer:
        'You can reach our support team through the Contact page, email us at support@careerconnect.ls, or use the live chat feature available during business hours.',
    },
    {
      id: 12,
      category: 'support',
      question: 'What is your response time?',
      answer:
        'We aim to respond to all inquiries within 24-48 hours. Urgent matters can be flagged in your support ticket for priority handling.',
    },
  ];

  const toggleItem = (id) => {
    setOpenItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch =
      searchQuery === '' ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
            Frequently Asked Questions
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Find answers to common questions about our platform
          </motion.p>
        </div>
      </section>

      {/* Search Section */}
      <section className="faq-search-section">
        <div className="container">
          <motion.div
            className="search-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search for questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="faq-categories-section">
        <div className="container">
          <div className="categories-grid">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <motion.button
                  key={category.id}
                  className={`category-button ${activeCategory === category.id ? 'active' : ''}`}
                  onClick={() => setActiveCategory(category.id)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Icon size={20} />
                  <span>{category.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ List */}
      <section className="faq-list-section">
        <div className="container">
          <motion.div
            className="faq-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq) => (
                <motion.div
                  key={faq.id}
                  className="faq-item"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  layout
                >
                  <button
                    className={`faq-question ${openItems[faq.id] ? 'open' : ''}`}
                    onClick={() => toggleItem(faq.id)}
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      size={20}
                      className={`chevron ${openItems[faq.id] ? 'rotated' : ''}`}
                    />
                  </button>
                  <AnimatePresence>
                    {openItems[faq.id] && (
                      <motion.div
                        className="faq-answer"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <p>{faq.answer}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))
            ) : (
              <motion.div className="no-results" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <HelpCircle size={48} />
                <h3>No questions found</h3>
                <p>Try adjusting your search or category filter</p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Still Need Help */}
      <section className="faq-help-section">
        <div className="container">
          <motion.div
            className="help-card"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2>Still need help?</h2>
            <p>Can't find the answer you're looking for? Our support team is here to help.</p>
            <div className="help-buttons">
              <button
                className="primary-button"
                onClick={() => (window.location.href = '/contact')}
              >
                Contact Support
              </button>
              <button
                className="secondary-button"
                onClick={() => (window.location.href = '/help-center')}
              >
                Visit Help Center
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default FAQ;
