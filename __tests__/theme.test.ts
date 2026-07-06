import { Colors, Theme } from '../utils/theme';

describe('Theme module', () => {
  it('should export all required color tokens', () => {
    expect(Colors.background).toBe('#0f0f1a');
    expect(Colors.primary).toBe('#6366f1');
    expect(Colors.text).toBe('#f8fafc');
  });

  it('should have consistent dark theme contrast properties', () => {
    expect(Theme.Colors.surface).toBeDefined();
    expect(Theme.Spacing.md).toBe(12);
  });
});

  it('should correctly convert hex color to rgba with opacity', () => {
    const { rgba } = require('../utils/theme');
    expect(rgba('#ffffff', 0.5)).toBe('rgba(255, 255, 255, 0.5)');
    expect(rgba('#000000', 1)).toBe('rgba(0, 0, 0, 1)');
  });
