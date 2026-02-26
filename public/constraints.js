export const BLOCK_SIZES = {
  "1x2": [1, 1, 2],
  "2x4": [2, 1, 4],
  "4x4": [4, 1, 4],
  "seat": [1, 1, 1],
  "engine": [1, 1, 1],
  "wheel": [1, 1, 1],
  "steering": [1, 1, 1]
};

export const BLOCK_COLORS = {
  "1x2": 0x888888,
  "2x4": 0x777777,
  "4x4": 0x666666,
  "seat": 0xff0000,
  "engine": 0x00ff00,
  "wheel": 0x0000ff,
  "steering": 0xffff00
};

export const GRAVITY = -9.81;
export const DRAG_COEFFICIENT = 0.05;
export const MAX_SPEED_PER_ENGINE = 5;
export const WORLD_SIZE = 500;
