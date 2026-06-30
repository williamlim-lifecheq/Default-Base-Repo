import { MODES } from './modes.js';

export function getLevelConfig(mode, levelNumber) {
  const modeConfig = MODES[mode];
  const requiredWPM = modeConfig.baseWPM + (levelNumber - 1) * modeConfig.wpmJumpPerLevel;
  const tier =
    levelNumber <= 3 ? 'beginner' :
    levelNumber <= 6 ? 'intermediate' :
    'advanced';

  return {
    level: levelNumber,
    mode,
    requiredWPM,
    timerSeconds: modeConfig.timerSeconds,
    tier,
  };
}
