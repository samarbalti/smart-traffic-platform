import React from 'react'
import { Box, Typography, List, ListItem, ListItemText, IconButton, Badge, Chip } from '@mui/material'
import { MarkEmailRead as ReadIcon } from '@mui/icons-material'
import { useQuery, useMutation, gql } from '@apollo/client'

const GET_NOTIFICATIONS = gql`
  query GetNotifications {
    myNotifications {
      id
      title
      message
      type
      isRead
      readAt
      createdAt
    }
    unreadCount
  }
`;

const MARK_READ = gql`
  mutation MarkAsRead($input: MarkReadInput!) {
    markAsRead(input: $input) {
      id
      isRead
    }
  }
`;

const MARK_ALL_READ = gql`
  mutation MarkAllAsRead {
    markAllAsRead
  }
`;

export default function Notifications() {
  const { data, refetch } = useQuery(GET_NOTIFICATIONS);
  const [markAsRead] = useMutation(MARK_READ);
  const [markAllAsRead] = useMutation(MARK_ALL_READ);

  const handleMarkRead = async (id) => {
    await markAsRead({ variables: { input: { notificationId: id } } });
    refetch();
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    refetch();
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'INCIDENT': return 'error';
      case 'TRAFFIC_ALERT': return 'warning';
      case 'STATUS_UPDATE': return 'info';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">
          Notifications
          {data?.unreadCount > 0 && (
            <Badge badgeContent={data.unreadCount} color="error" sx={{ ml: 2 }} />
          )}
        </Typography>
        <IconButton onClick={handleMarkAllRead} title="Tout marquer comme lu">
          <ReadIcon />
        </IconButton>
      </Box>

      <List>
        {data?.myNotifications?.map((notif) => (
          <ListItem
            key={notif.id}
            sx={{
              mb: 1,
              bgcolor: notif.isRead ? 'background.paper' : 'action.hover',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider'
            }}
            secondaryAction={
              !notif.isRead && (
                <IconButton edge="end" onClick={() => handleMarkRead(notif.id)}>
                  <ReadIcon />
                </IconButton>
              )
            }
          >
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: notif.isRead ? 'normal' : 'bold' }}>
                    {notif.title}
                  </Typography>
                  <Chip label={notif.type} color={getTypeColor(notif.type)} size="small" />
                </Box>
              }
              secondary={
                <>
                  <Typography variant="body2" color="text.secondary">
                    {notif.message}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(notif.createdAt).toLocaleString('fr-FR')}
                  </Typography>
                </>
              }
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
