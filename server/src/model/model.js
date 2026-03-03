import { query } from '../../boilerplate/db/index.js';

const ALLOWED_SENSOR_TYPES = ['camera', 'microphone', 'light'];
let moodSensorColumnsEnsured = false;

const ensureMoodSensorColumns = async () => {
  if (moodSensorColumnsEnsured) {
    return;
  }

  await query(`
    ALTER TABLE mood_entries
      ADD COLUMN IF NOT EXISTS noise_level_db INTEGER,
      ADD COLUMN IF NOT EXISTS light_level_lux INTEGER,
      ADD COLUMN IF NOT EXISTS camera_image_data_url TEXT
  `);

  moodSensorColumnsEnsured = true;
};

export const getAllMoodEntries = async () => {
  await ensureMoodSensorColumns();
  const { rows } = await query(`
    SELECT
      m.id,
      m.mood,
      m.energy_level,
      m.stress_level,
      m.notes,
      m.latitude,
      m.longitude,
      m.weather_conditions,
      m.activity,
      m.timestamp,
      COALESCE(
        m.noise_level_db,
        CASE
          WHEN (mic.data->>'noise_level_db') ~ '^\\d+(\\.\\d+)?$'
            THEN ROUND((mic.data->>'noise_level_db')::numeric)::int
          ELSE NULL
        END
      ) AS noise_level_db,
      COALESCE(
        m.light_level_lux,
        CASE
          WHEN (lgt.data->>'illuminance') ~ '^\\d+(\\.\\d+)?$'
            THEN ROUND((lgt.data->>'illuminance')::numeric)::int
          ELSE NULL
        END
      ) AS light_level_lux,
      COALESCE(
        m.camera_image_data_url,
        cam.data->>'image_data_url',
        cam.data->>'camera_image_data_url',
        cam.data->>'photo_data_url',
        cam.data->>'image'
      ) AS camera_image_data_url
    FROM mood_entries m
    LEFT JOIN LATERAL (
      SELECT data
      FROM sensor_readings
      WHERE sensor_type = 'camera'
        AND data->>'mood_entry_id' = m.id::text
      ORDER BY timestamp DESC
      LIMIT 1
    ) cam ON TRUE
    LEFT JOIN LATERAL (
      SELECT data
      FROM sensor_readings
      WHERE sensor_type = 'microphone'
        AND data->>'mood_entry_id' = m.id::text
      ORDER BY timestamp DESC
      LIMIT 1
    ) mic ON TRUE
    LEFT JOIN LATERAL (
      SELECT data
      FROM sensor_readings
      WHERE sensor_type = 'light'
        AND data->>'mood_entry_id' = m.id::text
      ORDER BY timestamp DESC
      LIMIT 1
    ) lgt ON TRUE
    ORDER BY m.timestamp DESC
  `);
  return rows;
};

export const getMoodEntryById = async (id) => {
  await ensureMoodSensorColumns();
  const { rows } = await query('SELECT * FROM mood_entries WHERE id = $1', [id]);
  return rows[0] || null;
};

export const createMoodEntry = async (moodData) => {
  await ensureMoodSensorColumns();

  const {
    mood,
    energy_level,
    stress_level,
    notes = '',
    latitude = 0,
    longitude = 0,
    weather_conditions = 'sensor_mode',
    activity = 'sensor_capture',
    noise_level_db = null,
    light_level_lux = null,
    camera_image_data_url = null,
  } = moodData;

  const { rows } = await query(
    `INSERT INTO mood_entries
     (mood, energy_level, stress_level, notes, latitude, longitude, weather_conditions, activity, noise_level_db, light_level_lux, camera_image_data_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING *`,
    [
      mood,
      energy_level,
      stress_level,
      notes,
      latitude,
      longitude,
      weather_conditions,
      activity,
      noise_level_db,
      light_level_lux,
      camera_image_data_url,
    ],
  );
  return rows[0];
};

export const updateMoodEntry = async (id, moodData) => {
  await ensureMoodSensorColumns();

  const {
    mood,
    energy_level,
    stress_level,
    notes = '',
    latitude = 0,
    longitude = 0,
    weather_conditions = 'sensor_mode',
    activity = 'sensor_capture',
    noise_level_db = null,
    light_level_lux = null,
    camera_image_data_url = null,
  } = moodData;

  const { rows } = await query(
    `UPDATE mood_entries
     SET mood = $1,
         energy_level = $2,
         stress_level = $3,
         notes = $4,
         latitude = $5,
         longitude = $6,
         weather_conditions = $7,
         activity = $8,
         noise_level_db = $9,
         light_level_lux = $10,
         camera_image_data_url = $11
     WHERE id = $12
     RETURNING *`,
    [
      mood,
      energy_level,
      stress_level,
      notes,
      latitude,
      longitude,
      weather_conditions,
      activity,
      noise_level_db,
      light_level_lux,
      camera_image_data_url,
      id,
    ],
  );
  return rows[0];
};

export const deleteMoodEntry = async (id) => {
  await ensureMoodSensorColumns();

  const { rows } = await query(
    'DELETE FROM mood_entries WHERE id = $1 RETURNING *',
    [id],
  );

  if (rows.length === 0) {
    return null;
  }

  await query(
    "DELETE FROM sensor_readings WHERE data->>'mood_entry_id' = $1",
    [String(id)],
  );

  return rows[0];
};
export const getAllSensorReadings = async () => {
  const { rows } = await query(
    'SELECT * FROM sensor_readings WHERE sensor_type = ANY($1::text[]) ORDER BY timestamp DESC',
    [ALLOWED_SENSOR_TYPES],
  );
  return rows;
};

export const createSensorReading = async (sensorData) => {
  const { sensor_type, data } = sensorData;
  if (!ALLOWED_SENSOR_TYPES.includes(sensor_type)) {
    throw new Error(`Unsupported sensor type: ${sensor_type}`);
  }

  const { rows } = await query(
    'INSERT INTO sensor_readings (sensor_type, data) VALUES ($1, $2) RETURNING *',
    [sensor_type, data],
  );
  return rows[0];
};
export const getDatabaseStatus = async () => {
  const { rows } = await query('SELECT NOW() as time');
  return rows[0];
};
