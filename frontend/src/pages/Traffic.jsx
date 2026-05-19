import React from 'react'
import { Box, Typography, Button, Paper, Chip, Grid } from '@mui/material'
import { MapContainer, TileLayer, Polygon, Popup } from 'react-leaflet'
import { useQuery, useMutation, gql } from '@apollo/client'
import { DataGrid } from '@mui/x-data-grid'

const GET_ZONES = gql`
  query GetZones {
    zones {
      id
      name
      description
      coordinates {
        lat
        lng
      }
      centerLat
      centerLng
      density
      vehicleCount
      averageSpeed
    }
    congestedZones {
      id
      name
      vehicleCount
      averageSpeed
    }
  }
`;

const CALCULATE_DENSITIES = gql`
  mutation CalculateAllDensities {
    calculateAllDensities {
      id
      name
      density
      vehicleCount
      averageSpeed
    }
  }
`;

const densityColors = {
  FAIBLE: '#4caf50',
  MOYEN: '#ff9800',
  ELEVE: '#f44336'
};

export default function Traffic() {
  const { data, loading, refetch } = useQuery(GET_ZONES);
  const [calculateDensities] = useMutation(CALCULATE_DENSITIES);

  const handleCalculate = async () => {
    await calculateDensities();
    refetch();
  };

  const columns = [
    { field: 'name', headerName: 'Zone', width: 150 },
    { field: 'density', headerName: 'Densite', width: 120, renderCell: (params) => (
      <Chip label={params.value} color={params.value === 'ELEVE' ? 'error' : params.value === 'MOYEN' ? 'warning' : 'success'} size="small" />
    )},
    { field: 'vehicleCount', headerName: 'Vehicules', width: 100 },
    { field: 'averageSpeed', headerName: 'Vitesse moy', width: 120, renderCell: (params) => `${params.value} km/h` },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Gestion du Trafic</Typography>
        <Button variant="contained" onClick={handleCalculate}>
          Recalculer les densites
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ height: 500 }}>
            <MapContainer center={[36.8065, 10.1815]} zoom={12} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {data?.zones?.map((zone) => (
                zone.coordinates && (
                  <Polygon
                    key={zone.id}
                    positions={zone.coordinates.map(c => [c.lat, c.lng])}
                    pathOptions={{ color: densityColors[zone.density], fillOpacity: 0.3 }}
                  >
                    <Popup>
                      <Typography variant="subtitle2">{zone.name}</Typography>
                      <Typography variant="body2">Densite: {zone.density}</Typography>
                      <Typography variant="body2">Vehicules: {zone.vehicleCount}</Typography>
                    </Popup>
                  </Polygon>
                )
              ))}
            </MapContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, mb: 2, bgcolor: 'error.light', color: 'white' }}>
            <Typography variant="h6">Zones congestionnees</Typography>
            <Typography variant="h3">{data?.congestedZones?.length || 0}</Typography>
          </Paper>
          <DataGrid
            rows={data?.zones || []}
            columns={columns}
            pageSize={5}
            autoHeight
            loading={loading}
            getRowId={(row) => row.id}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
