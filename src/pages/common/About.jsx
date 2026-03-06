import React from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Target,
  Heart,
  Award,
  Rocket,
  Globe,
  ChevronRight,
  Star,
  Shield,
  Zap,
} from 'lucide-react';
import './CommonPages.css';

const About = () => {
  const stats = [
    { value: '10K+', label: 'Active Users', icon: Users },
    { value: '50+', label: 'Countries', icon: Globe },
    { value: '1000+', label: 'Success Stories', icon: Award },
    { value: '95%', label: 'Satisfaction Rate', icon: Star },
  ];

  const values = [
    {
      icon: Target,
      title: 'Mission-Driven',
      description:
        'We are committed to empowering the next generation of entrepreneurs and innovators.',
    },
    {
      icon: Heart,
      title: 'Community First',
      description: 'Building a supportive ecosystem where ideas flourish and connections thrive.',
    },
    {
      icon: Shield,
      title: 'Trust & Safety',
      description: 'Ensuring a secure and reliable platform for all our users and partners.',
    },
    {
      icon: Zap,
      title: 'Innovation',
      description: 'Constantly evolving to provide cutting-edge tools and resources.',
    },
  ];

  const team = [
    {
      name: 'Sarah Johnson',
      role: 'CEO & Founder',
      image:
        'https://images.unsplash.com/photo-1494790108777-647d4638290c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      bio: 'Former startup founder with a passion for youth entrepreneurship.',
    },
    {
      name: 'Michael Chen',
      role: 'CTO',
      image:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      bio: 'Tech visionary with 15+ years in ed-tech and platform development.',
    },
    {
      name: 'Emily Rodriguez',
      role: 'Head of Community',
      image:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      bio: 'Community builder dedicated to fostering meaningful connections.',
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
            About Us
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Empowering the next generation of entrepreneurs and innovators
          </motion.p>
        </div>
      </section>

      {/* Our Story */}
      <section className="story-section">
        <div className="container">
          <div className="story-grid">
            <motion.div
              className="story-content"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2>Our Story</h2>
              <p className="lead">
                Founded in 2020, we set out to bridge the gap between young entrepreneurs and the
                resources they need to succeed.
              </p>
              <p>
                What started as a small idea has grown into a global platform connecting thousands
                of young innovators with mentors, funding opportunities, and educational resources.
                Our journey has been driven by the belief that every young person with a dream
                deserves the chance to turn it into reality.
              </p>
              <p>
                Today, we're proud to support a diverse community of entrepreneurs across 50+
                countries, providing them with the tools, connections, and guidance needed to build
                successful ventures.
              </p>
            </motion.div>
            <motion.div
              className="story-stats"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="stat-card">
                    <Icon className="stat-icon" />
                    <div className="stat-value">{stat.value}</div>
                    <div className="stat-label">{stat.label}</div>
                  </div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="values-section">
        <div className="container">
          <motion.h2
            className="section-title"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Our Core Values
          </motion.h2>
          <div className="values-grid">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={index}
                  className="value-card"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Icon className="value-icon" />
                  <h3>{value.title}</h3>
                  <p>{value.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <div className="container">
          <motion.h2
            className="section-title"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Meet Our Team
          </motion.h2>
          <div className="team-grid">
            {team.map((member, index) => (
              <motion.div
                key={index}
                className="team-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="member-image">
                  <img src={member.image} alt={member.name} />
                </div>
                <h3>{member.name}</h3>
                <p className="member-role">{member.role}</p>
                <p className="member-bio">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <motion.div
            className="cta-content"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2>Ready to Start Your Journey?</h2>
            <p>Join thousands of young entrepreneurs building their future with us.</p>
            <button className="cta-button">
              Get Started Now <ChevronRight size={20} />
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;
