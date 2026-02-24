import express from 'express';
import * as ecotrackController from '../../controller/controller.js';

const router = express.Router();

// ===== ECOTRACK ROUTES =====

// Health Check
router.get('/health', ecotrackController.getHealth);

// Mood Entries
router.get('/mood-entries', ecotrackController.getAllMoodEntries);
router.post('/mood-entries', ecotrackController.createMoodEntry);
router.put('/mood-entries/:id', ecotrackController.updateMoodEntry);

// Sensor Readings
router.get('/sensor-readings', ecotrackController.getAllSensorReadings);
router.post('/sensor-readings', ecotrackController.createSensorReading);

export default router;
