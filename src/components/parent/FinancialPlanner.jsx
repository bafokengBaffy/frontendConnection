// frontend/src/components/parent/FinancialPlanner.jsx
import { Box, Typography } from '@mui/material';

import Card from '../common/Card';

const FinancialPlanner = ({ title = 'Financial Planner', subtitle, details, actions }) => (
  <Card title={title} subtitle={subtitle} actions={actions}>
    <Box>
      <Typography variant="body2" color="text.secondary">
        {details || 'Configure this component with real data from the parent service.'}
      </Typography>
    </Box>
  </Card>
);

export default FinancialPlanner;
