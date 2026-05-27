import type { StudentImportRow } from './students.service';

export type ImportField =
  | 'lrn'
  | 'lastName'
  | 'firstName'
  | 'middleName'
  | 'gender'
  | 'birthday'
  | 'guardianName'
  | 'guardianRelationship'
  | 'guardianContact'
  | 'skip';

export const FIELD_LABELS: Record<ImportField, string> = {
  lrn:                  'LRN',
  lastName:             'Last Name',
  firstName:            'First Name',
  middleName:           'Middle Name',
  gender:               'Gender (M/F)',
  birthday:             'Birthday',
  guardianName:         'Guardian Name',
  guardianRelationship: 'Guardian Rel.',
  guardianContact:      'Guardian Contact',
  skip:                 '— Skip —',
};

export const FIELD_SAMPLE: Record<ImportField, string> = {
  lrn:                  '105432100023',
  lastName:             'dela Cruz',
  firstName:            'Juan',
  middleName:           'Reyes',
  gender:               'M',
  birthday:             '2012-03-19',
  guardianName:         'Ana dela Cruz',
  guardianRelationship: 'Mother',
  guardianContact:      '09171234567',
  skip:                 '',
};

export const REQUIRED_FIELDS: ImportField[]     = ['lrn', 'lastName', 'firstName', 'gender'];
export const DEFAULT_COLUMN_ORDER: ImportField[] = ['lrn', 'lastName', 'firstName', 'middleName', 'gender', 'birthday'];
export const ALL_FIELDS: ImportField[]           = [
  'lrn', 'lastName', 'firstName', 'middleName', 'gender', 'birthday',
  'guardianName', 'guardianRelationship', 'guardianContact', 'skip',
];

export function normalizeImportRow(raw: Record<string, string>): StudentImportRow | null {
  const lrn = (raw['LRN'] ?? raw['lrn'] ?? '').toString().replace(/\D/g, '').slice(0, 12);
  if (lrn.length !== 12) return null;
  const gender = (raw['GENDER'] ?? raw['gender'] ?? 'F').toString().toUpperCase();
  return {
    lrn,
    lastName:   raw['LAST_NAME']   ?? raw['lastName']   ?? raw['last_name']   ?? '',
    firstName:  raw['FIRST_NAME']  ?? raw['firstName']  ?? raw['first_name']  ?? '',
    middleName: raw['MIDDLE_NAME'] ?? raw['middleName'] ?? raw['middle_name'] ?? raw['MI'] ?? '',
    gender:     gender === 'M' || gender === 'MALE' ? 'M' : 'F',
    birthday:   raw['BIRTHDAY'] ?? raw['birthday'] ?? undefined,
    guardian:   (raw['GUARDIAN_NAME'] ?? raw['guardianName'])
      ? {
          name:          raw['GUARDIAN_NAME']         ?? raw['guardianName']         ?? '',
          relationship:  raw['GUARDIAN_RELATIONSHIP'] ?? raw['guardianRelationship'] ?? '',
          contactNumber: raw['GUARDIAN_CONTACT']      ?? raw['guardianContact']      ?? '',
        }
      : undefined,
  };
}

export function mapRowByOrder(
  cols: string[],
  order: ImportField[],
): StudentImportRow | { error: string } {
  const pick = (f: ImportField): string => {
    const idx = order.indexOf(f);
    return idx >= 0 ? (cols[idx] ?? '').toString().trim() : '';
  };

  const lrn = pick('lrn').replace(/\D/g, '').slice(0, 12);
  if (lrn.length !== 12) return { error: `invalid LRN "${pick('lrn')}"` };

  const lastName  = pick('lastName');
  const firstName = pick('firstName');
  if (!lastName)  return { error: 'missing last name' };
  if (!firstName) return { error: 'missing first name' };

  const genderRaw = pick('gender').toUpperCase();
  const gender: 'M' | 'F' = genderRaw === 'M' || genderRaw === 'MALE' ? 'M' : 'F';

  const guardianName = pick('guardianName');

  return {
    lrn,
    lastName,
    firstName,
    middleName: pick('middleName') || undefined,
    gender,
    birthday:   pick('birthday') || undefined,
    guardian:   guardianName
      ? { name: guardianName, relationship: pick('guardianRelationship'), contactNumber: pick('guardianContact') }
      : undefined,
  };
}
