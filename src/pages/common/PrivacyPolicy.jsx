import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Database, Mail, Clock } from 'lucide-react';
import './CommonPages.css';

const PrivacyPolicy = () => {
  const lastUpdated = 'March 1, 2026';

  const sections = [
    {
      icon: Shield,
      title: 'Information We Collect',
      content:
        'We collect information you provide directly, including name, email, business details, and communication preferences. We also automatically collect usage data and cookies to improve your experience.',
    },
    {
      icon: Database,
      title: 'How We Use Your Information',
      content:
        'Your information helps us provide and improve our services, communicate with you, personalize your experience, and ensure platform security.',
    },
    {
      icon: Lock,
      title: 'Data Security',
      content:
        'We implement industry-standard security measures to protect your data. This includes encryption, secure servers, and regular security audits.',
    },
    {
      icon: Eye,
      title: 'Information Sharing',
      content:
        'We do not sell your personal information. We may share data with your consent, for legal reasons, or with service providers who assist our operations.',
    },
    {
      icon: Mail,
      title: 'Communication Preferences',
      content:
        'You can control your communication preferences and opt-out of promotional emails at any time through your account settings.',
    },
    {
      icon: Clock,
      title: 'Data Retention',
      content:
        'We retain your information as long as your account is active or as needed to provide services. You can request data deletion at any time.',
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
            Privacy Policy
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Last Updated: {lastUpdated}
          </motion.p>
        </div>
      </section>

      {/* Introduction */}
      <section className="policy-intro">
        <div className="container">
          <motion.div
            className="intro-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Shield className="intro-icon" />
            <h2>Your Privacy Matters</h2>
            <p>
              At Youth Entrepreneur Platform, we take your privacy seriously. This policy describes
              how we collect, use, and protect your personal information. By using our platform, you
              consent to the practices described in this policy.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Policy Sections */}
      <section className="policy-sections">
        <div className="container">
          <div className="sections-grid">
            {sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <motion.div
                  key={index}
                  className="policy-card"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Icon className="card-icon" />
                  <h3>{section.title}</h3>
                  <p>{section.content}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Detailed Policy */}
      <section className="policy-detailed">
        <div className="container">
          <motion.div
            className="detailed-content"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2>Detailed Information</h2>

            <h3>1. Information Collection</h3>
            <p>
              We collect information you provide when creating an account, updating your profile,
              participating in community features, applying for opportunities, or communicating with
              us. This may include your name, email address, phone number, business information,
              educational background, and payment information.
            </p>

            <h3>2. Cookies and Tracking</h3>
            <p>
              We use cookies and similar tracking technologies to track activity on our platform and
              hold certain information. Cookies help us improve our services and provide a better
              user experience. You can instruct your browser to refuse all cookies or to indicate
              when a cookie is being sent.
            </p>

            <h3>3. Third-Party Services</h3>
            <p>
              Our platform may contain links to third-party websites or services. We are not
              responsible for the privacy practices or content of these third parties. We encourage
              you to read their privacy policies before providing any information.
            </p>

            <h3>4. Children's Privacy</h3>
            <p>
              Our platform is intended for users aged 16 and above. We do not knowingly collect
              personal information from children under 16. If you become aware that a child has
              provided us with personal information, please contact us.
            </p>

            <h3>5. International Data Transfers</h3>
            <p>
              Your information may be transferred to and maintained on computers located outside of
              your state, province, country, or other governmental jurisdiction where data
              protection laws may differ. By using our platform, you consent to such transfers.
            </p>

            <h3>6. Your Rights</h3>
            <p>
              You have the right to access, update, or delete your personal information. You can do
              this through your account settings or by contacting us. You also have the right to
              data portability and to withdraw consent at any time.
            </p>

            <h3>7. Changes to This Policy</h3>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes
              by posting the new policy on this page and updating the "Last Updated" date. You are
              advised to review this policy periodically for changes.
            </p>

            <h3>8. Contact Us</h3>
            <p>
              If you have questions about this Privacy Policy, please contact us at
              privacy@youthentrepreneur.com or through our Contact page.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Consent Section */}
      <section className="policy-consent">
        <div className="container">
          <motion.div
            className="consent-card"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2>
              By using our platform, you acknowledge that you have read and understood this Privacy
              Policy.
            </h2>
            <button className="primary-button" onClick={() => window.history.back()}>
              I Understand
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
