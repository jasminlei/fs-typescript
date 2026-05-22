import { type SubmitEventHandler, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  type SelectChangeEvent,
  TextField,
  Typography,
} from '@mui/material';

import patientService from '../../services/patients';
import HealthRatingBar from '../HealthRatingBar';
import type {
  Diagnosis,
  Entry,
  HealthCheckRating,
  NewEntry,
  NewHealthCheckEntry,
  NewHospitalEntry,
  NewOccupationalHealthcareEntry,
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

  const [entryType, setEntryType] = useState<Entry['type']>('HealthCheck');

  const [entryDate, setEntryDate] = useState('');
  const [entrySpecialist, setEntrySpecialist] = useState('');
  const [entryDescription, setEntryDescription] = useState('');
  const [entryDiagnosisCodes, setEntryDiagnosisCodes] = useState<string[]>([]);

  const [dischargeDate, setDischargeDate] = useState('');
  const [dischargeCriteria, setDischargeCriteria] = useState('');

  const [employerName, setEmployerName] = useState('');
  const [sickLeaveStartDate, setSickLeaveStartDate] = useState('');
  const [sickLeaveEndDate, setSickLeaveEndDate] = useState('');

  const [entryHealthCheckRating, setEntryHealthCheckRating] =
    useState<HealthCheckRating>(0);

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

  const handleDiagnosisCodesChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setEntryDiagnosisCodes(typeof value === 'string' ? value.split(',') : value);
  };

  const addEntry: SubmitEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    if (!id) {
      setEntryError('Missing patient id');
      return;
    }

    setEntryError(null);

    const base = {
      date: entryDate,
      specialist: entrySpecialist,
      description: entryDescription,
      diagnosisCodes: entryDiagnosisCodes.length ? entryDiagnosisCodes : undefined,
    };

    const newEntry: NewEntry = (() => {
      switch (entryType) {
        case 'Hospital':
          return {
            type: 'Hospital',
            ...base,
            discharge: {
              date: dischargeDate,
              criteria: dischargeCriteria,
            },
          } satisfies NewHospitalEntry;

        case 'OccupationalHealthcare':
          return {
            type: 'OccupationalHealthcare',
            ...base,
            employerName,
            sickLeave:
              sickLeaveStartDate.trim() && sickLeaveEndDate.trim()
                ? {
                    startDate: sickLeaveStartDate,
                    endDate: sickLeaveEndDate,
                  }
                : undefined,
          } satisfies NewOccupationalHealthcareEntry;

        case 'HealthCheck':
          return {
            type: 'HealthCheck',
            ...base,
            healthCheckRating: entryHealthCheckRating,
          } satisfies NewHealthCheckEntry;

        default:
          return assertNever(entryType);
      }
    })();

    try {
      const addedEntry = await patientService.addEntry(id, newEntry);
      setPatient((prev) =>
        prev ? { ...prev, entries: prev.entries.concat(addedEntry) } : prev,
      );

      setEntryDate('');
      setEntrySpecialist('');
      setEntryDescription('');
      setEntryDiagnosisCodes([]);

      setDischargeDate('');
      setDischargeCriteria('');
      setEmployerName('');
      setSickLeaveStartDate('');
      setSickLeaveEndDate('');

      setEntryHealthCheckRating(0);
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
        add new entry
      </Typography>
      {entryError ? (
        <Typography color='error'>Error: {entryError}</Typography>
      ) : null}
      <Box
        component='form'
        onSubmit={addEntry}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          maxWidth: 520,
        }}
      >
        <FormControl fullWidth size='small' margin='dense'>
          <InputLabel id='entry-type-label'>type</InputLabel>
          <Select
            labelId='entry-type-label'
            value={entryType}
            label='type'
            onChange={(e) => setEntryType(e.target.value as Entry['type'])}
          >
            <MenuItem value='HealthCheck'>HealthCheck</MenuItem>
            <MenuItem value='Hospital'>Hospital</MenuItem>
            <MenuItem value='OccupationalHealthcare'>
              OccupationalHealthcare
            </MenuItem>
          </Select>
        </FormControl>

        <TextField
          label='date'
          type='date'
          value={entryDate}
          onChange={(e) => setEntryDate(e.target.value)}
          size='small'
          margin='dense'
          fullWidth
          required
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          label='specialist'
          value={entrySpecialist}
          onChange={(e) => setEntrySpecialist(e.target.value)}
          size='small'
          margin='dense'
          fullWidth
          required
        />

        <TextField
          label='description'
          value={entryDescription}
          onChange={(e) => setEntryDescription(e.target.value)}
          size='small'
          margin='dense'
          fullWidth
          required
        />

        <FormControl
          fullWidth
          size='small'
          margin='dense'
          disabled={diagnoses.length === 0}
        >
          <InputLabel id='diagnosis-codes-label'>diagnosis codes</InputLabel>
          <Select
            labelId='diagnosis-codes-label'
            multiple
            value={entryDiagnosisCodes}
            onChange={handleDiagnosisCodesChange}
            input={<OutlinedInput size='small' label='diagnosis codes' />}
            renderValue={(selected) => selected.join(', ')}
          >
            {diagnoses.map((diagnosis) => (
              <MenuItem key={diagnosis.code} value={diagnosis.code}>
                <Checkbox checked={entryDiagnosisCodes.includes(diagnosis.code)} />
                <ListItemText primary={`${diagnosis.code} ${diagnosis.name}`} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {entryType === 'Hospital' ? (
          <>
            <TextField
              label='discharge date'
              type='date'
              value={dischargeDate}
              onChange={(e) => setDischargeDate(e.target.value)}
              size='small'
              margin='dense'
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label='discharge criteria'
              value={dischargeCriteria}
              onChange={(e) => setDischargeCriteria(e.target.value)}
              size='small'
              margin='dense'
              fullWidth
              required
            />
          </>
        ) : null}

        {entryType === 'OccupationalHealthcare' ? (
          <>
            <TextField
              label='employer name'
              value={employerName}
              onChange={(e) => setEmployerName(e.target.value)}
              size='small'
              margin='dense'
              fullWidth
              required
            />
            <TextField
              label='sick leave start date'
              type='date'
              value={sickLeaveStartDate}
              onChange={(e) => setSickLeaveStartDate(e.target.value)}
              size='small'
              margin='dense'
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label='sick leave end date'
              type='date'
              value={sickLeaveEndDate}
              onChange={(e) => setSickLeaveEndDate(e.target.value)}
              size='small'
              margin='dense'
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </>
        ) : null}

        {entryType === 'HealthCheck' ? (
          <FormControl fullWidth size='small' margin='dense'>
            <InputLabel id='health-check-rating-label'>health rating</InputLabel>
            <Select
              labelId='health-check-rating-label'
              value={entryHealthCheckRating}
              label='health rating'
              onChange={(e) =>
                setEntryHealthCheckRating(Number(e.target.value) as HealthCheckRating)
              }
            >
              <MenuItem value={0}>0 (Healthy)</MenuItem>
              <MenuItem value={1}>1 (Low risk)</MenuItem>
              <MenuItem value={2}>2 (High risk)</MenuItem>
              <MenuItem value={3}>3 (Critical risk)</MenuItem>
            </Select>
          </FormControl>
        ) : null}

        <Button type='submit' variant='contained' size='small'>
          add entry
        </Button>
      </Box>

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
