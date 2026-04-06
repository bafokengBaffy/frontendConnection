// frontend/src/components/parent/ProgressTimeline.jsx
import { Box, Typography } from '@mui/material';

import Card from '../common/Card';

const ProgressTimeline = ({ title = 'Progress Timeline', subtitle, details, actions }) => (
  <Card title={title} subtitle={subtitle} actions={actions}>
    <Box>
      <Typography variant="body2" color="text.secondary">
        {details || 'Configure this component with real data from the parent service.'}
      </Typography>
    </Box>
  </Card>
);

export default ProgressTimeline;
