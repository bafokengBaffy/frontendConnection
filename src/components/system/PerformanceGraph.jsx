// frontend/src/components/system/PerformanceGraph.jsx
import { Box, Typography } from '@mui/material';

import Card from '../common/Card';

const PerformanceGraph = ({ title = 'Performance Graph', subtitle, details, actions }) => (
  <Card title={title} subtitle={subtitle} actions={actions}>
    <Box>
      <Typography variant="body2" color="text.secondary">
        {details || 'Configure this component with real data from the system service.'}
      </Typography>
    </Box>
  </Card>
);

export default PerformanceGraph;
