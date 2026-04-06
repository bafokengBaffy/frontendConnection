// frontend/src/components/system/AnomalyAlert.jsx
import { Box, Typography } from '@mui/material';

import Card from '../common/Card';

const AnomalyAlert = ({ title = 'Anomaly Alert', subtitle, details, actions }) => (
  <Card title={title} subtitle={subtitle} actions={actions}>
    <Box>
      <Typography variant="body2" color="text.secondary">
        {details || 'Configure this component with real data from the system service.'}
      </Typography>
    </Box>
  </Card>
);

export default AnomalyAlert;
