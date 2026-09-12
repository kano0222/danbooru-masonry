import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AutocompleteItem, BooruAdapter } from '../adapters/types';
import { createState, type AppState } from '../core/state';
import { closeAutocomplete, openAutocomplete, scheduleAutocomplete } from './autocomplete';

let state: AppState;
let container: { innerHTML: string; classList: { add: ReturnType<typeof vi.fn>; remove: ReturnType<typeof vi.fn>; contains: () => boolean }; setAttribute: ReturnType<typeof vi.fn> };
let resolveRequest: (items: AutocompleteItem[]) => void;

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal('location', { search: '' });
  vi.stubGlobal('GM_getValue', (_key: string, fallback: unknown) => fallback);
  vi.stubGlobal('window', { clearTimeout, setTimeout });
  container = {
    innerHTML: '',
    classList: { add: vi.fn(), remove: vi.fn(), contains: () => false },
    setAttribute: vi.fn(),
  };
  vi.stubGlobal('document', { getElementById: () => container });
  state = createState({
    getAutocomplete: vi.fn(() => new Promise<AutocompleteItem[]>((resolve) => { resolveRequest = resolve; })),
  } as unknown as BooruAdapter);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('autocomplete request lifecycle', () => {
  it('ignores an old response while the next input is still debouncing', async () => {
    openAutocomplete(state, 'old');
    scheduleAutocomplete(state, 'new');
    resolveRequest([{ value: 'old_tag', count: '', category: 'meta' }]);
    await Promise.resolve();
    expect(container.innerHTML).toBe('');
    expect(container.classList.add).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(200);
    expect(state.adapter.getAutocomplete).toHaveBeenLastCalledWith('new');
    resolveRequest([{ value: 'new_tag', count: '', category: 'meta' }]);
    await Promise.resolve();
    expect(container.innerHTML).toContain('new_tag');
    expect(container.classList.add).toHaveBeenCalledWith('dmh-open');
  });

  it('does not reopen after dismissal when a request resolves late', async () => {
    openAutocomplete(state, 'old');
    closeAutocomplete(state);
    resolveRequest([{ value: 'old_tag', count: '', category: 'meta' }]);
    await Promise.resolve();
    expect(container.classList.add).not.toHaveBeenCalled();
    expect(container.classList.remove).toHaveBeenCalledWith('dmh-open');
  });

  it('cancels a pending debounce when suggestions close', async () => {
    scheduleAutocomplete(state, 'new');
    closeAutocomplete(state);
    await vi.runAllTimersAsync();
    expect(state.adapter.getAutocomplete).not.toHaveBeenCalled();
  });
});
