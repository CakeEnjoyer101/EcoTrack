import asyncHandler from 'express-async-handler';
import * as model from '../model/model.js';
export const getAllMoodEntries = asyncHandler(async (req, res) => {
  const entries = await model.getAllMoodEntries();
  res.status(200).json(entries);
});

export const createMoodEntry = asyncHandler(async (req, res) => {
  const newEntry = await model.createMoodEntry(req.body);
  res.status(201).json(newEntry);
});

export const updateMoodEntry = asyncHandler(async (req, res) => {
  const updatedEntry = await model.updateMoodEntry(req.params.id, req.body);
  if (!updatedEntry) {
    res.status(404).json({ message: 'Mood entry not found' });
    return;
  }
  res.status(200).json(updatedEntry);
});
export const getAllSensorReadings = asyncHandler(async (req, res) => {
  const readings = await model.getAllSensorReadings();
  res.status(200).json(readings);
});

export const createSensorReading = asyncHandler(async (req, res) => {
  const newReading = await model.createSensorReading(req.body);
  res.status(201).json(newReading);
});
export const getHealth = asyncHandler(async (req, res) => {
  const dbStatus = await model.getDatabaseStatus();
  res.status(200).json({
    status: 'OK',
    message: 'EcoTrack Backend lÃ¤uft!',
    database: 'connected',
    time: dbStatus.time,
  });
});
