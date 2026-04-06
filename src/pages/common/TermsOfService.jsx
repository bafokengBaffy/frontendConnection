/* eslint-disable no-unused-vars */
import { motion } from 'framer-motion';
import { FileText, AlertCircle, CheckCircle, Scale, Users, Globe } from 'lucide-react';
import './CommonPages.css';

const TermsOfService = () => {
  const lastUpdated = 'March 1, 2026';

  const keyPoints = [
    {
      icon: CheckCircle,
      title: 'Eligibility',
      description: 'Users must be 16 years or older to use our platform.',
    },
    {
      icon: Scale,
      title: 'Acceptable Use',
      description: 'You agree to use the platform responsibly and respect other users.',
    },
    {
      icon: Users,
      title: 'Account Responsibility',
      description: 'You are responsible for maintaining the security of your account.',
    },
    {
      icon: Globe,
      title: 'Intellectual Property',
      description: 'Content you post remains yours, but you grant us license to display it.',
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
            Terms of Service
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

      {/* Key Points */}
      <section className="terms-keypoints">
        <div className="container">
          <div className="keypoints-grid">
            {keyPoints.map((point, index) => {
              const Icon = point.icon;
              return (
                <motion.div
                  key={index}
                  className="keypoint-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Icon className="keypoint-icon" />
                  <h3>{point.title}</h3>
                  <p>{point.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Full Terms */}
      <section className="terms-full">
        <div className="container">
          <motion.div
            className="terms-content"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2>1. Agreement to Terms</h2>
            <p>
              By accessing or using the Youth Entrepreneur Platform, you agree to be bound by these
              Terms of Service and all applicable laws and regulations. If you do not agree with any
              part of these terms, you may not use our platform.
            </p>

            <h2>2. Eligibility</h2>
            <p>
              You must be at least 16 years old to use this platform. By using our platform, you
              represent and warrant that you have the right, authority, and capacity to enter into
              this agreement and to abide by all terms and conditions.
            </p>

            <h2>3. Account Registration</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials.
              You agree to notify us immediately of any unauthorized use of your account. We are not
              liable for any loss or damage arising from your failure to protect your account.
            </p>

            <h2>4. User Content</h2>
            <p>
              You retain all rights to content you post on our platform. By posting content, you
              grant us a non-exclusive, worldwide, royalty-free license to use, reproduce, and
              display such content for the purpose of operating and improving our services.
            </p>

            <h2>5. Prohibited Activities</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Violate any laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Post false, misleading, or harmful content</li>
              <li>Harass, abuse, or harm others</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Use the platform for any illegal purpose</li>
            </ul>

            <h2>6. Intellectual Property</h2>
            <p>
              The platform itself, including its design, features, and content owned by us, is
              protected by copyright, trademark, and other laws. You may not copy, modify, or
              distribute our platform's proprietary elements without permission.
            </p>

            <h2>7. Third-Party Links</h2>
            <p>
              Our platform may contain links to third-party websites or services. We do not endorse
              or assume responsibility for any third-party content. Your use of third-party websites
              is at your own risk.
            </p>

            <h2>8. Termination</h2>
            <p>
              We may terminate or suspend your account immediately, without prior notice, for
              conduct that we believe violates these Terms or is harmful to other users, us, or
              third parties.
            </p>

            <h2>9. Disclaimer of Warranties</h2>
            <p>
              The platform is provided "as is" without warranties of any kind. We do not guarantee
              that the platform will be error-free, secure, or available at all times. Your use is
              at your sole risk.
            </p>

            <h2>10. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, we shall not be liable for any indirect,
              incidental, special, consequential, or punitive damages resulting from your use or
              inability to use the platform.
            </p>

            <h2>11. Indemnification</h2>
            <p>
              You agree to indemnify and hold us harmless from any claims, damages, or expenses
              arising from your use of the platform or violation of these Terms.
            </p>

            <h2>12. Governing Law</h2>
            <p>
              These Terms shall be governed by the laws of [Your Jurisdiction] without regard to its
              conflict of law provisions.
            </p>

            <h2>13. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. We will notify users of
              significant changes. Continued use of the platform after changes constitutes
              acceptance of the new terms.
            </p>

            <h2>14. Contact Information</h2>
            <p>
              For questions about these Terms, please contact us at legal@youthentrepreneur.com.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Acceptance */}
      <section className="terms-acceptance">
        <div className="container">
          <motion.div
            className="acceptance-card"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <FileText className="acceptance-icon" />
            <h2>
              By using our platform, you acknowledge that you have read and agree to these Terms of
              Service.
            </h2>
            <button className="primary-button" onClick={() => window.history.back()}>
              I Agree
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default TermsOfService;
