import { act, renderHook } from '@testing-library/react';
import React, { ReactNode, useContext } from 'react';
import {
  AlertManagerContext,
  AlertManagerProvider,
} from '../contexts/AlertManagerContext';
import useShare from './useShare';

const wrapper = ({ children }: { children: ReactNode }) => (
  <AlertManagerProvider>{children}</AlertManagerProvider>
);
const useBoth = () => ({
  share: useShare(),
  alerts: useContext(AlertManagerContext)!.alerts,
});
const target = {
  title: 'Korvus',
  url: 'https://x/share#c1.abc',
  copied: 'share.copied',
} as const;

describe('useShare', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('uses the share sheet when the device has one', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { share, clipboard: { writeText: vi.fn() } });
    const { result } = renderHook(useBoth, { wrapper });
    await act(() => result.current.share.share(target));
    expect(share).toHaveBeenCalledWith({ title: 'Korvus', url: target.url });
    expect(result.current.alerts).toEqual([]);
  });

  it('does nothing more when the share sheet is closed', async () => {
    const writeText = vi.fn();
    vi.stubGlobal('navigator', {
      share: vi.fn().mockRejectedValue(new DOMException('', 'AbortError')),
      clipboard: { writeText },
    });
    const { result } = renderHook(useBoth, { wrapper });
    await act(() => result.current.share.share(target));
    expect(writeText).not.toHaveBeenCalled();
  });

  it('copies the link and says that anyone with it can see the character', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText } });
    const { result } = renderHook(useBoth, { wrapper });
    await act(() => result.current.share.share(target));
    expect(writeText).toHaveBeenCalledWith(target.url);
    expect(result.current.alerts[0].message).toBe(
      'Link copied — anyone with it can see this character',
    );
  });

  it('falls back to showing the link when the clipboard is blocked', async () => {
    vi.stubGlobal('navigator', {
      clipboard: { writeText: vi.fn().mockRejectedValue(new Error('denied')) },
    });
    const { result } = renderHook(useBoth, { wrapper });
    await act(() => result.current.share.share(target));
    expect(result.current.share.fallbackUrl).toBe(target.url);
    act(() => result.current.share.closeFallback());
    expect(result.current.share.fallbackUrl).toBeUndefined();
  });
});
