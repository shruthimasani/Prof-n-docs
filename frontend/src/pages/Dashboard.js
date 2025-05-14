import { Box, Button, Typography } from '@mui/material';
import StatsCards from '../components/StatsCards';
import FacultyTable from '../components/FacultyTable';

export default function Dashboard() {
  return (
    <Box sx={{ p: 3 }}>
      <StatsCards />
      <Box sx={{ mb: 3 }}>
        <Button variant="contained" sx={{ mr: 2 }}>Add Faculty</Button>
        <Button variant="outlined" sx={{ mr: 2 }}>View All</Button>
        <Button variant="outlined">Generate Report</Button>
      </Box>
      <Typography variant="h6" gutterBottom>Faculty Performance</Typography>
      <FacultyTable />
    </Box>
  );
}