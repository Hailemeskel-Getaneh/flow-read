import { AudioTrack, PlaybackRate } from '../types';

describe('TypeScript Type definitions', () => {
  it('should allow valid playback rate values', () => {
    const rate: PlaybackRate = 1.25;
    expect(rate).toBe(1.25);
  });

  it('should validate AudioTrack schema', () => {
    const track: AudioTrack = {
      id: 'test-1',
      uri: 'file:///test.mp3',
      title: 'Test Audio',
      durationMs: 60000,
    };
    expect(track.durationMs).toBe(60000);
  });
});
