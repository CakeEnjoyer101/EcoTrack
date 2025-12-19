import { query } from '../../boilerplate/db/index.js';

// Mood Entries
export const getAllMoodEntries = async () => {
  const { rows } = await query('SELECT * FROM mood_entries ORDER BY timestamp DESC');
  return rows;
};

export const createMoodEntry = async (moodData) => {
  const {
    mood,
    energy_level,
    stress_level,
    notes,
    latitude,
    longitude,
    weather_conditions,
    activity,
  } = moodData;

  const { rows } = await query(
    `INSERT INTO mood_entries
     (mood, energy_level, stress_level, notes, latitude, longitude, weather_conditions, activity)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [mood, energy_level, stress_level, notes, latitude, longitude, weather_conditions, activity],
  );
  return rows[0];
};

// Sensor Readings
export const getAllSensorReadings = async () => {
  const { rows } = await query('SELECT * FROM sensor_readings ORDER BY timestamp DESC');
  return rows;
};

export const createSensorReading = async (sensorData) => {
  const { sensor_type, data } = sensorData;

  const { rows } = await query(
    'INSERT INTO sensor_readings (sensor_type, data) VALUES ($1, $2) RETURNING *',
    [sensor_type, data],
  );
  return rows[0];
};

// Health Check
export const getDatabaseStatus = async () => {
  const { rows } = await query('SELECT NOW() as time');
  return rows[0];
};
