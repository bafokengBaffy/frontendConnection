// frontend/src/components/alumni/AlumniNetworkGraph.jsx
import { Box, Typography } from '@mui/material';

import Card from '../common/Card';

const AlumniNetworkGraph = ({ title = 'Network Graph', subtitle, details, actions }) => (
  <Card title={title} subtitle={subtitle} actions={actions}>
    <Box>
      <Typography variant="body2" color="text.secondary">
        {details || 'Configure this component with real data from the alumni service.'}
      </Typography>
    </Box>
  </Card>
);

export default AlumniNetworkGraph;
