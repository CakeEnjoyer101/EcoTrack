import asyncHandler from 'express-async-handler';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import * as model from '../model/model.js';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const uploadsDir = path.resolve(dirname, '../../public/uploads');

const getImageExtension = (mimeType) => {
  if (mimeType === 'image/png') {
    return 'png';
  }
  if (mimeType === 'image/webp') {
    return 'webp';
  }
  return 'jpg';
};

const persistCameraImage = async (cameraImageData) => {
  if (!cameraImageData || typeof cameraImageData !== 'string') {
    return null;
  }

  if (!cameraImageData.startsWith('data:image/')) {
    return cameraImageData;
  }

  const match = cameraImageData.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) {
    return cameraImageData;
  }

  const mimeType = match[1];
  const base64Data = match[2];
  const extension = getImageExtension(mimeType);
  const fileName = `${Date.now()}-${randomUUID()}.${extension}`;
  const filePath = path.join(uploadsDir, fileName);

  try {
    await fs.mkdir(uploadsDir, { recursive: true });
    await fs.writeFile(filePath, Buffer.from(base64Data, 'base64'));
    return `/uploads/${fileName}`;
  } catch {
    return cameraImageData;
  }
};

const removeStoredCameraImage = async (cameraImageData) => {
  if (!cameraImageData || typeof cameraImageData !== 'string') {
    return;
  }

  if (!cameraImageData.startsWith('/uploads/')) {
    return;
  }

  const filePath = path.join(uploadsDir, path.basename(cameraImageData));
  await fs.unlink(filePath).catch(() => undefined);
};

const parseNullableNumber = (value) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
};

const validateMoodSensorPayload = (payload) => {
  const noiseLevel = parseNullableNumber(payload.noise_level_db);
  const lightLevel = parseNullableNumber(payload.light_level_lux);

  if (Number.isNaN(noiseLevel) || (noiseLevel !== null && noiseLevel < 0)) {
    return { valid: false, message: 'noise_level_db must be a number >= 0' };
  }

  if (Number.isNaN(lightLevel) || (lightLevel !== null && lightLevel < 0)) {
    return { valid: false, message: 'light_level_lux must be a number >= 0' };
  }

  if (
    payload.camera_image_data_url !== undefined
    && payload.camera_image_data_url !== null
    && typeof payload.camera_image_data_url !== 'string'
  ) {
    return { valid: false, message: 'camera_image_data_url must be a string' };
  }

  return {
    valid: true,
    sanitizedPayload: {
      ...payload,
      noise_level_db: noiseLevel,
      light_level_lux: lightLevel,
      camera_image_data_url: payload.camera_image_data_url || null,
    },
  };
};

export const getAllMoodEntries = asyncHandler(async (req, res) => {
  const entries = await model.getAllMoodEntries();
  res.status(200).json(entries);
});

export const createMoodEntry = asyncHandler(async (req, res) => {
  const validation = validateMoodSensorPayload(req.body);
  if (!validation.valid) {
    res.status(400).json({ message: validation.message });
    return;
  }

  const payload = {
    ...validation.sanitizedPayload,
    camera_image_data_url: await persistCameraImage(
      validation.sanitizedPayload.camera_image_data_url,
    ),
  };

  const newEntry = await model.createMoodEntry(payload);
  res.status(201).json(newEntry);
});

export const updateMoodEntry = asyncHandler(async (req, res) => {
  const validation = validateMoodSensorPayload(req.body);
  if (!validation.valid) {
    res.status(400).json({ message: validation.message });
    return;
  }

  const existingEntry = await model.getMoodEntryById(req.params.id);
  if (!existingEntry) {
    res.status(404).json({ message: 'Mood entry not found' });
    return;
  }

  const payload = {
    ...validation.sanitizedPayload,
    camera_image_data_url: await persistCameraImage(
      validation.sanitizedPayload.camera_image_data_url,
    ),
  };

  const updatedEntry = await model.updateMoodEntry(req.params.id, payload);
  if (!updatedEntry) {
    res.status(404).json({ message: 'Mood entry not found' });
    return;
  }

  if (existingEntry.camera_image_data_url !== updatedEntry.camera_image_data_url) {
    await removeStoredCameraImage(existingEntry.camera_image_data_url);
  }

  res.status(200).json(updatedEntry);
});

export const deleteMoodEntry = asyncHandler(async (req, res) => {
  const deletedEntry = await model.deleteMoodEntry(req.params.id);
  if (!deletedEntry) {
    res.status(404).json({ message: 'Mood entry not found' });
    return;
  }

  await removeStoredCameraImage(deletedEntry.camera_image_data_url);
  res.status(200).json(deletedEntry);
});

export const getAllSensorReadings = asyncHandler(async (req, res) => {
  const readings = await model.getAllSensorReadings();
  res.status(200).json(readings);
});

export const createSensorReading = asyncHandler(async (req, res) => {
  const allowedSensorTypes = ['camera', 'microphone', 'light'];
  if (!allowedSensorTypes.includes(req.body.sensor_type)) {
    res.status(400).json({ message: 'Unsupported sensor type' });
    return;
  }

  const newReading = await model.createSensorReading(req.body);
  res.status(201).json(newReading);
});

export const getHealth = asyncHandler(async (req, res) => {
  const dbStatus = await model.getDatabaseStatus();
  res.status(200).json({
    status: 'OK',
    message: 'EcoTrack Backend laeuft!',
    database: 'connected',
    time: dbStatus.time,
  });
});
