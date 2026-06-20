import React from 'react';
import './Home.css';

const stats = [
  { value: '5,400+', label: 'Youth engaged' },
  { value: '1,200+', label: 'Employer partners' },
  { value: '95%', label: 'Success rate' },
  { value: '18,000+', label: 'Skills validated' },
];

const features = [
  {
    icon: '📈',
    title: 'Career matching intelligence',
    description: 'Advanced guidance and opportunity matching for students, powered by real skills and employer demand.',
  },
  {
    icon: '🤝',
    title: 'Mentorship & employer network',
    description: 'Connect with local mentors, companies, and training programs designed for Lesotho youth success.',
  },
  {
    icon: '🧭',
    title: 'Guided pathways',
    description: 'Clear learning pathways, interview preparation, and job-readiness tools that move students forward.',
  },
  {
    icon: '🔒',
    title: 'Secure student profiles',
    description: 'Privacy-first account controls, verified credentials, and carefully managed career data access.',
  },
];

const workflowSteps = [
  {
    title: 'Discover meaningful roles',
    description: 'Students explore jobs and internships curated for their interests, skills, and local economy.',
  },
  {
    title: 'Build personal readiness',
    description: 'Structured learning pathways and coaching tools drive confidence for interviews and professional growth.',
  },
  {
    title: 'Connect with employers',
    description: 'Local companies can review profiles, provide feedback, and invite candidates to relevant opportunities.',
  },
  {
    title: 'Measure success at scale',
    description: 'Institutions track engagement, placement progress, and outcomes through clear analytics dashboards.',
  },
];

const testimonials = [
  {
    quote: 'Career Connect Lesotho streamlined our student placement process and helped learners find work faster.',
    author: 'Mpho',
    role: 'Program Director',
  },
  {
    quote: 'The platform makes it easy to connect with local employers and track real progress for each learner.',
    author: 'Anele',
    role: 'Employer Relations Lead',
  },
  {
    quote: 'Our training programs now have a polished digital experience that feels both modern and trustworthy.',
    author: 'Thabo',
    role: 'Education Coordinator',
  },
];

const partners = ['Lesotho Careers', 'Basotho Employers', 'SkillUp Lesotho', 'Pathway Labs'];

const Home = () => {
  return (
    <div className="home-page home-landing">
      <section className="hero-banner">
        <div className="hero-glow hero-glow-left" />
        <div className="hero-glow hero-glow-right" />
        <div className="home-hero home-hero-landing">
          <div className="home-hero-row hero-grid">
            <div className="home-copy hero-copy">
              <span className="home-badge hero-eyebrow">Career Connect Lesotho</span>
              <h1 className="home-title hero-title">
                Empowering young talent with modern career pathways, local opportunity networks, and employer-ready skills.
              </h1>
              <p className="home-subtitle hero-subtitle">
                A premium, polished landing experience for students, employers, and career builders — thoughtfully crafted for trust, clarity,
                and fast action.
              </p>
              <div className="home-actions hero-actions">
                <a href="/register" className="home-primary-button btn-primary">
                  Start your journey
                </a>
                <a href="/about" className="home-secondary-button btn-secondary">
                  Learn how it works
                </a>
              </div>
              <div className="home-stat-grid hero-stat-grid">
                {stats.map((stat) => (
                  <div key={stat.label} className="home-stat-card hero-stat-card">
                    <span className="home-stat-value hero-stat-value">{stat.value}</span>
                    <span className="home-stat-label hero-stat-label">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="home-hero-panel hero-visual">
              <div className="home-panel-shell visual-shell">
                <div className="home-panel-top visual-top">
                  <span className="home-dot home-dot-red" />
                  <span className="home-dot home-dot-yellow" />
                  <span className="home-dot home-dot-green" />
                </div>
                <div className="home-panel-content visual-content">
                  <div className="visual-badge">Live growth metrics</div>
                  <h2>Track student pathways, engagement and opportunity connections in one view.</h2>
                  <ul className="home-panel-list visual-list">
                    <li>Professional mentorship and hiring readiness.</li>
                    <li>Automated pathway recommendations.</li>
                    <li>Localized employer match intelligence.</li>
                  </ul>
                </div>
                <div className="visual-image-frame">
                  <img
                    className="visual-image"
                    src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80"
                    alt="Career development and growth dashboard"
                    loading="lazy"
                    decoding="async"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 420px"
                  />
                  <div className="visual-overlay" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="home-section features-section">
        <div className="home-section-heading">
          <span className="home-eyebrow">What sets us apart</span>
          <h2>Designed for modern learners, trusted by institutions, built for impact.</h2>
          <p>
            Move from exploration to employment with rich resources, measurable outcomes, and a refined experience for every stakeholder.
          </p>
        </div>
        <div className="feature-grid">
          {features.map((feature) => (
            <article key={feature.title} className="home-card feature-card">
              <div className="feature-icon" aria-hidden="true">
                {feature.icon}
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section workflow-section">
        <div className="home-section-heading">
          <span className="home-eyebrow">How it works</span>
          <h2>A clear step-by-step experience for students, employers, and administrators.</h2>
          <p>
            Deploy a platform that simplifies career navigation, creates meaningful connections, and equips learners for confident decisions.
          </p>
        </div>

        <div className="workflow-grid">
          {workflowSteps.map((step, index) => (
            <div key={step.title} className="workflow-card home-card">
              <span className="workflow-step">{`0${index + 1}`}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="home-section home-section-muted impact-section">
        <div className="impact-content">
          <div>
            <span className="home-eyebrow">Built for measurable results</span>
            <h2>Instant clarity, stronger outcomes, and a more confident next step.</h2>
            <p>
              Empower institutions to support youth with guided skill development, trackable progress, and fast feedback on every career milestone.
            </p>
          </div>
          <div className="impact-cards">
            <div className="impact-card">
              <strong>24/7 Opportunity matching</strong>
              <p>Automated match discovery keeps every learner engaged with relevant roles, internships, and training.</p>
            </div>
            <div className="impact-card">
              <strong>Local employer collaboration</strong>
              <p>Create deeper connections with businesses, mentorship programs, and hiring initiatives across Lesotho.</p>
            </div>
            <div className="impact-card">
              <strong>Progress visibility</strong>
              <p>Track learner readiness with dashboard analytics, milestone badges, and easy-to-share progress summaries.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="home-section testimonial-section">
        <div className="home-section-heading">
          <span className="home-eyebrow">Trusted by partners</span>
          <h2>Stories from institutions and employers who choose a stronger local career platform.</h2>
        </div>

        <div className="testimonial-grid">
          {testimonials.map((testimonial) => (
            <article key={testimonial.author} className="testimonial-card home-card">
              <p className="testimonial-quote">“{testimonial.quote}”</p>
              <div className="testimonial-author">
                <strong>{testimonial.author}</strong>
                <span>{testimonial.role}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section partner-section">
        <div className="home-section-heading">
          <span className="home-eyebrow">Local collaboration</span>
          <h2>Partnering with employers and training leaders across Lesotho.</h2>
        </div>

        <div className="partner-grid">
          {partners.map((partner) => (
            <div key={partner} className="partner-pill">
              {partner}
            </div>
          ))}
        </div>
      </section>

      <section className="home-section cta-section">
        <div className="home-cta-box">
          <div>
            <span className="home-eyebrow">Launch faster</span>
            <h2>Let your career community thrive with a premium launch-ready platform.</h2>
            <p>
              Engage students, mentors, and employers with a seamless experience that looks exceptional on every screen.
            </p>
          </div>
          <div className="home-actions cta-actions">
            <a href="/register" className="home-primary-button btn-primary">
              Get started now
            </a>
            <a href="/contact" className="home-secondary-button btn-secondary">
              Contact sales
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;