import { type SubmitEventHandler, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography } from '@mui/material';

import patientService from '../../services/patients';
import HealthRatingBar from '../HealthRatingBar';
import type {
  Diagnosis,
  Entry,
  HealthCheckRating,
  NewHealthCheckEntry,
  Patient,
} from '../../types';

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
  const [entryError, setEntryError] = useState<string | null>(null);

  const [entryDate, setEntryDate] = useState('');
  const [entrySpecialist, setEntrySpecialist] = useState('');
  const [entryDescription, setEntryDescription] = useState('');
  const [entryDiagnosisCodes, setEntryDiagnosisCodes] = useState('');
  const [entryHealthCheckRating, setEntryHealthCheckRating] = useState('0');

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

  const addEntry: SubmitEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    if (!id) {
      setEntryError('Missing patient id');
      return;
    }

    setEntryError(null);

    const diagnosisCodes = entryDiagnosisCodes
      .split(',')
      .map((code) => code.trim())
      .filter(Boolean);

    const newEntry: NewHealthCheckEntry = {
      type: 'HealthCheck',
      date: entryDate,
      specialist: entrySpecialist,
      description: entryDescription,
      diagnosisCodes: diagnosisCodes.length ? diagnosisCodes : undefined,
      healthCheckRating: Number(
        entryHealthCheckRating,
      ) as unknown as HealthCheckRating,
    };

    try {
      const addedEntry = await patientService.addEntry(id, newEntry);
      setPatient((prev) =>
        prev ? { ...prev, entries: prev.entries.concat(addedEntry) } : prev,
      );

      setEntryDate('');
      setEntrySpecialist('');
      setEntryDescription('');
      setEntryDiagnosisCodes('');
      setEntryHealthCheckRating('0');
    } catch (caught: unknown) {
      const message =
        caught instanceof Error ? caught.message : 'Unknown error';
      setEntryError(message);
    }
  };

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
        add new entry (HealthCheck)
      </Typography>
      {entryError ? (
        <Typography color='error'>Error: {entryError}</Typography>
      ) : null}
      <form onSubmit={addEntry}>
        <div>
          date
          <input
            value={entryDate}
            onChange={(e) => setEntryDate(e.target.value)}
          />
        </div>
        <div>
          specialist
          <input
            value={entrySpecialist}
            onChange={(e) => setEntrySpecialist(e.target.value)}
          />
        </div>
        <div>
          description
          <input
            value={entryDescription}
            onChange={(e) => setEntryDescription(e.target.value)}
          />
        </div>
        <div>
          diagnosis codes (comma separated)
          <input
            value={entryDiagnosisCodes}
            onChange={(e) => setEntryDiagnosisCodes(e.target.value)}
          />
        </div>
        <div>
          health check rating (0-3)
          <input
            value={entryHealthCheckRating}
            onChange={(e) => setEntryHealthCheckRating(e.target.value)}
          />
        </div>
        <button type='submit'>add entry</button>
      </form>

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
