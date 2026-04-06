// frontend/src/components/parent/WellbeingIndicator.jsx
import { Box, Typography } from '@mui/material';

import Card from '../common/Card';

const WellbeingIndicator = ({ title = 'Wellbeing Indicator', subtitle, details, actions }) => (
  <Card title={title} subtitle={subtitle} actions={actions}>
    <Box>
      <Typography variant="body2" color="text.secondary">
        {details || 'Configure this component with real data from the parent service.'}
      </Typography>
    </Box>
  </Card>
);

export default WellbeingIndicator;
