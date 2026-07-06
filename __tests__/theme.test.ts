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
