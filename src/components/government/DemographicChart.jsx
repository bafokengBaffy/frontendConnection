// frontend/src/components/government/DemographicChart.jsx
import { Box, Typography } from '@mui/material';

import Card from '../common/Card';

const DemographicChart = ({ title = 'Demographic Trends', subtitle, details, actions }) => (
  <Card title={title} subtitle={subtitle} actions={actions}>
    <Box>
      <Typography variant="body2" color="text.secondary">
        {details || 'Configure this component with real data from the government service.'}
      </Typography>
    </Box>
  </Card>
);

export default DemographicChart;
