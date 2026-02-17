export const DB_NAME = 'mayo_emr.db';

export const SCHEMA = {
    patients: `
    CREATE TABLE IF NOT EXISTS patients (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      date_of_birth TEXT,
      gender TEXT,
      blood_type TEXT,
      height REAL,
      weight REAL,
      allergies TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
  `,
    visits: `
    CREATE TABLE IF NOT EXISTS visits (
      id TEXT PRIMARY KEY NOT NULL,
      patient_id TEXT NOT NULL,
      date TEXT NOT NULL,
      doctor_name TEXT,
      hospital_name TEXT,
      diagnosis TEXT,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (patient_id) REFERENCES patients (id) ON DELETE CASCADE
    );
  `,
    medical_history: `
    CREATE TABLE IF NOT EXISTS medical_history (
      id TEXT PRIMARY KEY NOT NULL,
      patient_id TEXT NOT NULL,
      condition TEXT NOT NULL,
      diagnosis_date TEXT,
      status TEXT, -- active, resolved, chronic
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (patient_id) REFERENCES patients (id) ON DELETE CASCADE
    );
  `,
    prescriptions: `
    CREATE TABLE IF NOT EXISTS prescriptions (
      id TEXT PRIMARY KEY NOT NULL,
      visit_id TEXT,
      patient_id TEXT NOT NULL,
      medication_name TEXT NOT NULL,
      dosage TEXT,
      frequency TEXT,
      start_date TEXT,
      end_date TEXT,
      status TEXT, -- active, completed, discontinued
      instructions TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (patient_id) REFERENCES patients (id) ON DELETE CASCADE,
      FOREIGN KEY (visit_id) REFERENCES visits (id) ON DELETE SET NULL
    );
  `,
    lab_results: `
    CREATE TABLE IF NOT EXISTS lab_results (
      id TEXT PRIMARY KEY NOT NULL,
      visit_id TEXT,
      patient_id TEXT NOT NULL,
      test_name TEXT NOT NULL,
      result_value TEXT,
      reference_range TEXT,
      unit TEXT,
      date TEXT,
      notes TEXT,
      file_path TEXT, -- for images/PDFs
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (patient_id) REFERENCES patients (id) ON DELETE CASCADE,
      FOREIGN KEY (visit_id) REFERENCES visits (id) ON DELETE SET NULL
    );
  `
};
