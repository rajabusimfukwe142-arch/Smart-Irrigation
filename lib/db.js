// lib/db.js
import fs from 'fs';
import path from 'path';

// ==================== HELPERS ====================
const dataDir = path.join(process.cwd(), 'data');

// Hakikisha folder data ipo
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// ==================== READ DATA ====================
export function readData(filename) {
  try {
    const filePath = path.join(dataDir, filename);
    if (!fs.existsSync(filePath)) {
      // Kama faili haipo, unda na data tupu
      fs.writeFileSync(filePath, JSON.stringify([]), 'utf8');
      return [];
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return [];
  }
}

// ==================== WRITE DATA ====================
export function writeData(filename, data) {
  try {
    const filePath = path.join(dataDir, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error(`Error writing ${filename}:`, error);
    return false;
  }
}

// ==================== GET NEXT ID ====================
export function getNextId(data) {
  if (data.length === 0) return 1;
  return Math.max(...data.map(item => item.id)) + 1;
}

// ==================== FIND BY ID ====================
export function findById(data, id) {
  return data.find(item => item.id === id);
}

// ==================== DELETE BY ID ====================
export function deleteById(data, id) {
  return data.filter(item => item.id !== id);
}
