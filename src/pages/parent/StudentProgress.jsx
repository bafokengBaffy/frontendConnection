import { Grid, Typography, List, ListItem, ListItemText, Alert } from '@mui/material';

import PageContainer from '../../components/layout/PageContainer';
import Card, { StatsCard } from '../../components/common/Card';
import { useParent } from '../../hooks/useParent';

const StudentProgress = () => {
  const { overview, models, insights, history, loading, error, refresh } = useParent();
  const counts = overview?.collectionCounts || {};
  const countEntries = Object.entries(counts);

  return (
    <PageContainer
      title="Student Progress"
      subtitle="Academic performance and milestones"
      loading={loading}
      actions={[{ label: 'Refresh', onClick: refresh, variant: 'contained' }]}
      breadcrumbs={[
        { label: 'Parent', path: '/parent' },
        { label: 'Student Progress', path: '/parent/student-progress' },
      ]}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2}>
        {countEntries.length > 0 ? (
          countEntries.map(([key, value]) => (
            <Grid key={key} item xs={12} md={4}>
              <StatsCard title={key.replace(/_/g, ' ')} value={value} />
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Card title="No metrics yet" subtitle="Awaiting data ingestion">
              <Typography variant="body2" color="text.secondary">
                Once data is available in Firestore, metrics will appear here.
              </Typography>
            </Card>
          </Grid>
        )}

        <Grid item xs={12} md={6}>
          <Card title="Latest Insights" subtitle="From AI insights collection">
            {insights && insights.length > 0 ? (
              <List dense>
                {insights.slice(0, 6).map((item) => (
                  <ListItem key={item.id} divider>
                    <ListItemText
                      primary={item.title || item.modelId || item.model || 'Insight'}
                      secondary={
                        item.summary || item.description || item.status || 'No description'
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No insights available yet.
              </Typography>
            )}
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card title="Recent History" subtitle="Prediction and training activity">
            {history && history.length > 0 ? (
              <List dense>
                {history.slice(0, 6).map((item) => (
                  <ListItem key={item.id} divider>
                    <ListItemText
                      primary={item.modelId || item.model || 'Model run'}
                      secondary={item.status || 'unknown status'}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No recent history available.
              </Typography>
            )}
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card title="Available Models" subtitle="Role-specific AI catalog">
            {models && models.length > 0 ? (
              <List dense>
                {models.map((model) => (
                  <ListItem key={model.id || model.modelId} divider>
                    <ListItemText
                      primary={model.name || model.id}
                      secondary={
                        model.description || model.task || model.status || 'No description'
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No models registered for this role yet.
              </Typography>
            )}
          </Card>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default StudentProgress;
