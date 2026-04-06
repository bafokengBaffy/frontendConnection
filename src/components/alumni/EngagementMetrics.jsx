// frontend/src/components/alumni/EngagementMetrics.jsx
import { Box, Typography } from '@mui/material';

import Card from '../common/Card';

const EngagementMetrics = ({ title = 'Engagement Metrics', subtitle, details, actions }) => (
  <Card title={title} subtitle={subtitle} actions={actions}>
    <Box>
      <Typography variant="body2" color="text.secondary">
        {details || 'Configure this component with real data from the alumni service.'}
      </Typography>
    </Box>
  </Card>
);

export default EngagementMetrics;
