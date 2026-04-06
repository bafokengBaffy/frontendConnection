// frontend/src/components/government/RegionalMap.jsx
import { Box, Typography } from '@mui/material';

import Card from '../common/Card';

const RegionalMap = ({ title = 'Regional Map', subtitle, details, actions }) => (
  <Card title={title} subtitle={subtitle} actions={actions}>
    <Box>
      <Typography variant="body2" color="text.secondary">
        {details || 'Configure this component with real data from the government service.'}
      </Typography>
    </Box>
  </Card>
);

export default RegionalMap;
