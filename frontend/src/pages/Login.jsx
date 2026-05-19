import React, { useState } from 'react'
import { Box, Paper, TextField, Button, Typography, Alert, CircularProgress } from '@mui/material'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const [email, setEmail] = useState('admin@smarttraffic.tn');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(email, password);
    if (!result.success) {
      setError(result.error || 'Erreur de connexion');
    }
    setLoading(false);
  };

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}
    >
      <Paper elevation={6} sx={{ p: 4, width: 400, borderRadius: 2 }}>
        <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Smart Traffic
        </Typography>
        <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
          Plateforme de gestion du trafic urbain
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Mot de passe"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
          />
          <Button
            fullWidth
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ mt: 3, py: 1.5 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Se connecter'}
          </Button>
        </form>

        <Typography variant="caption" color="text.secondary" align="center" sx={{ mt: 2, display: 'block' }}>
          Defaut: admin@smarttraffic.tn / admin123
        </Typography>
      </Paper>
    </Box>
  );
}
