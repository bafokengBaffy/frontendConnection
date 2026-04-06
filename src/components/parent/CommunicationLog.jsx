// frontend/src/components/parent/CommunicationLog.jsx
import { Box, Typography } from '@mui/material';

import Card from '../common/Card';

const CommunicationLog = ({ title = 'Communication Log', subtitle, details, actions }) => (
  <Card title={title} subtitle={subtitle} actions={actions}>
    <Box>
      <Typography variant="body2" color="text.secondary">
        {details || 'Configure this component with real data from the parent service.'}
      </Typography>
    </Box>
  </Card>
);

export default CommunicationLog;
