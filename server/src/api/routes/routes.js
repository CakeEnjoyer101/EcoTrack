import express from 'express';
import * as ecotrackController from '../../controller/controller.js';

const router = express.Router();
router.get('/health', ecotrackController.getHealth);
router.get('/mood-entries', ecotrackController.getAllMoodEntries);
router.post('/mood-entries', ecotrackController.createMoodEntry);
router.put('/mood-entries/:id', ecotrackController.updateMoodEntry);
router.delete('/mood-entries/:id', ecotrackController.deleteMoodEntry);
router.get('/sensor-readings', ecotrackController.getAllSensorReadings);
router.post('/sensor-readings', ecotrackController.createSensorReading);

export default router;
