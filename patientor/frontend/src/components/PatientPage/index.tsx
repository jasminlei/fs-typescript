import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography } from '@mui/material';

import patientService from '../../services/patients';
import type { Patient } from '../../types';

const PatientPage = () => {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('Missing patient id');
      setLoading(false);
      return;
    }

    const fetchPatient = async () => {
      try {
        const data = await patientService.getById(id);
        setPatient(data);
      } catch (caught: unknown) {
        const message =
          caught instanceof Error ? caught.message : 'Unknown error';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    void fetchPatient();
  }, [id]);

  if (loading) {
    return <Typography>Loading…</Typography>;
  }

  if (error) {
    return <Typography color='error'>Error: {error}</Typography>;
  }

  if (!patient) {
    return <Typography>No patient data.</Typography>;
  }

  return (
    <Box>
      <Typography variant='h5' sx={{ marginBottom: 1 }}>
        {patient.name}
      </Typography>

      <Typography>ssn: {patient.ssn}</Typography>
      <Typography>date of birth: {patient.dateOfBirth}</Typography>
      <Typography>gender: {patient.gender}</Typography>
      <Typography>occupation: {patient.occupation}</Typography>

      <Typography variant='h6' sx={{ marginTop: 2 }}>
        entries
      </Typography>
      <Typography>{patient.entries.length}</Typography>
    </Box>
  );
};

export default PatientPage;
