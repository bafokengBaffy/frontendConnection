import { Card, Button, Form } from 'react-bootstrap';
import { useState } from 'react';

const PitchDeckBuilder = () => {
  const [slides, setSlides] = useState([
    { id: 1, title: 'Problem', content: 'Describe the challenge your business solves.' },
    { id: 2, title: 'Solution', content: 'Explain your product or service clearly.' },
    { id: 3, title: 'Market', content: 'Summarize your audience and growth opportunity.' },
  ]);

  const updateSlide = (id, value) => {
    setSlides((current) =>
      current.map((slide) => (slide.id === id ? { ...slide, content: value } : slide))
    );
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Pitch Deck Builder</h2>
          <p className="text-muted mb-0">Draft the core story for your startup presentation.</p>
        </div>
        <Button variant="primary">Save Draft</Button>
      </div>

      <div className="row g-4">
        {slides.map((slide) => (
          <div className="col-12 col-lg-4" key={slide.id}>
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <Card.Title>{slide.title}</Card.Title>
                <Form.Control
                  as="textarea"
                  rows={6}
                  value={slide.content}
                  onChange={(event) => updateSlide(slide.id, event.target.value)}
                />
              </Card.Body>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PitchDeckBuilder;
