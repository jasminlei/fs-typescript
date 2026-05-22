import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography } from '@mui/material';

import patientService from '../../services/patients';
import HealthRatingBar from '../HealthRatingBar';
import type { Diagnosis, Entry, Patient } from '../../types';

const assertNever = (value: never): never => {
  throw new Error(`Unhandled entry type: ${JSON.stringify(value)}`);
};

interface Props {
  diagnoses: Diagnosis[];
}

const DiagnosisCodes = ({
  codes,
  diagnosisNameByCode,
}: {
  codes: string[];
  diagnosisNameByCode: Record<string, string>;
}) => {
  return (
    <ul>
      {codes.map((code) => (
        <li key={code}>
          {code} {diagnosisNameByCode[code] ?? ''}
        </li>
      ))}
    </ul>
  );
};

const EntryDetails = ({
  entry,
  diagnosisNameByCode,
}: {
  entry: Entry;
  diagnosisNameByCode: Record<string, string>;
}) => {
  switch (entry.type) {
    case 'Hospital':
      return (
        <Box sx={{ border: '1px solid #ccc', padding: 1, marginY: 1 }}>
          <Typography>
            {entry.date} <i>{entry.description}</i>
          </Typography>
          <Typography>discharge: {entry.discharge.date}</Typography>
          <Typography>criteria: {entry.discharge.criteria}</Typography>
          {entry.diagnosisCodes ? (
            <DiagnosisCodes
              codes={entry.diagnosisCodes}
              diagnosisNameByCode={diagnosisNameByCode}
            />
          ) : null}
          <Typography>specialist: {entry.specialist}</Typography>
        </Box>
      );
    case 'OccupationalHealthcare':
      return (
        <Box sx={{ border: '1px solid #ccc', padding: 1, marginY: 1 }}>
          <Typography>
            {entry.date} <i>{entry.description}</i>
          </Typography>
          <Typography>employer: {entry.employerName}</Typography>
          {entry.sickLeave ? (
            <Typography>
              sick leave: {entry.sickLeave.startDate} -{' '}
              {entry.sickLeave.endDate}
            </Typography>
          ) : null}
          {entry.diagnosisCodes ? (
            <DiagnosisCodes
              codes={entry.diagnosisCodes}
              diagnosisNameByCode={diagnosisNameByCode}
            />
          ) : null}
          <Typography>specialist: {entry.specialist}</Typography>
        </Box>
      );
    case 'HealthCheck':
      return (
        <Box sx={{ border: '1px solid #ccc', padding: 1, marginY: 1 }}>
          <Typography>
            {entry.date} <i>{entry.description}</i>
          </Typography>
          <HealthRatingBar rating={entry.healthCheckRating} showText />
          {entry.diagnosisCodes ? (
            <DiagnosisCodes
              codes={entry.diagnosisCodes}
              diagnosisNameByCode={diagnosisNameByCode}
            />
          ) : null}
          <Typography>specialist: {entry.specialist}</Typography>
        </Box>
      );
    default:
      return assertNever(entry);
  }
};

const PatientPage = ({ diagnoses }: Props) => {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const diagnosisNameByCode = useMemo(() => {
    return diagnoses.reduce<Record<string, string>>((acc, diagnosis) => {
      acc[diagnosis.code] = diagnosis.name;
      return acc;
    }, {});
  }, [diagnoses]);

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
      {patient.entries.length === 0 ? (
        <Typography>No entries</Typography>
      ) : (
        patient.entries.map((entry) => (
          <EntryDetails
            key={entry.id}
            entry={entry}
            diagnosisNameByCode={diagnosisNameByCode}
          />
        ))
      )}
    </Box>
  );
};

export default PatientPage;
