import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  BookOpen,
  Video,
  MessageCircle,
  FileText,
  Users,
  Award,
  HelpCircle,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import './CommonPages.css';

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    {
      icon: BookOpen,
      title: 'Getting Started',
      description: 'New to the platform? Start here',
      articles: 12,
      color: '#4F46E5',
    },
    {
      icon: Users,
      title: 'Account Management',
      description: 'Manage your profile and settings',
      articles: 8,
      color: '#10B981',
    },
    {
      icon: Award,
      title: 'Business Tools',
      description: 'Create and manage your business',
      articles: 15,
      color: '#F59E0B',
    },
    {
      icon: Video,
      title: 'Video Tutorials',
      description: 'Watch step-by-step guides',
      articles: 10,
      color: '#EF4444',
    },
    {
      icon: FileText,
      title: 'Documentation',
      description: 'Detailed guides and references',
      articles: 20,
      color: '#8B5CF6',
    },
    {
      icon: MessageCircle,
      title: 'Community Forum',
      description: 'Get help from other users',
      articles: 'Active',
      color: '#EC4899',
    },
  ];

  const popularArticles = [
    {
      title: 'How to create your business profile',
      views: '2.5k views',
      link: '#',
    },
    {
      title: 'Applying for funding opportunities',
      views: '1.8k views',
      link: '#',
    },
    {
      title: 'Connecting with mentors',
      views: '1.6k views',
      link: '#',
    },
    {
      title: 'Using the pitch deck builder',
      views: '1.4k views',
      link: '#',
    },
  ];

  const faqs = [
    {
      question: 'How do I reset my password?',
      answer:
        'Click on "Forgot Password" on the login page and follow the instructions sent to your email.',
    },
    {
      question: 'Can I have multiple businesses?',
      answer: 'Yes, you can create and manage multiple business profiles under one account.',
    },
    {
      question: 'How do I contact support?',
      answer:
        'You can reach us through the Contact page, email, or live chat during business hours.',
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
            Help Center
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Find answers, guides, and support resources
          </motion.p>
        </div>
      </section>

      {/* Search */}
      <section className="help-search-section">
        <div className="container">
          <motion.div
            className="search-wrapper"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="search-box">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Search for help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <p className="search-hint">Popular searches: account, business, funding, mentor</p>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="help-categories">
        <div className="container">
          <motion.h2
            className="section-title"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Browse by Category
          </motion.h2>
          <div className="categories-grid">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <motion.a
                  key={index}
                  href="#"
                  className="category-card"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="category-icon" style={{ backgroundColor: `${category.color}20` }}>
                    <Icon style={{ color: category.color }} />
                  </div>
                  <h3>{category.title}</h3>
                  <p>{category.description}</p>
                  <span className="article-count">
                    {typeof category.articles === 'number'
                      ? `${category.articles} articles`
                      : category.articles}
                  </span>
                </motion.a>
              );
            })}
          </div>
        </div>
      </section>

      {/* Popular Articles */}
      <section className="popular-articles">
        <div className="container">
          <div className="articles-grid">
            <motion.div
              className="popular-section"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2>Popular Articles</h2>
              <div className="articles-list">
                {popularArticles.map((article, index) => (
                  <a key={index} href={article.link} className="article-item">
                    <div className="article-info">
                      <h4>{article.title}</h4>
                      <span>{article.views}</span>
                    </div>
                    <ArrowRight size={16} />
                  </a>
                ))}
              </div>
              <a href="#" className="view-all">
                View all articles <ExternalLink size={14} />
              </a>
            </motion.div>

            <motion.div
              className="quick-faqs"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2>Quick FAQs</h2>
              <div className="faqs-list">
                {faqs.map((faq, index) => (
                  <div key={index} className="faq-mini">
                    <h4>
                      <HelpCircle size={16} />
                      {faq.question}
                    </h4>
                    <p>{faq.answer}</p>
                  </div>
                ))}
              </div>
              <a href="/faq" className="view-all">
                View all FAQs <ArrowRight size={14} />
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Still Need Help */}
      <section className="help-cta">
        <div className="container">
          <motion.div
            className="cta-card"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="cta-content">
              <h2>Still need help?</h2>
              <p>Our support team is ready to assist you with any questions or issues.</p>
              <div className="cta-buttons">
                <button
                  className="primary-button"
                  onClick={() => (window.location.href = '/contact')}
                >
                  Contact Support
                </button>
                <button
                  className="secondary-button"
                  onClick={() => (window.location.href = '/support')}
                >
                  Visit Support Center
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HelpCenter;
