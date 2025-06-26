import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useAuth } from '@/hooks/useAuth';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';

const getSessionMock = jest.fn();
const onAuthStateChangeMock = jest.fn();
(global as any).getSessionMock = getSessionMock;
(global as any).onAuthStateChangeMock = onAuthStateChangeMock;

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: (...args: any[]) =>
        (global as any).getSessionMock(...args),
      onAuthStateChange: (...args: any[]) =>
        (global as any).onAuthStateChangeMock(...args),
    },
  },
}));

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes session from getSession', async () => {
    const session = { user: { id: '1' } } as any;
    getSessionMock.mockResolvedValueOnce({ data: { session } });
    let callback: any;
    onAuthStateChangeMock.mockImplementationOnce((cb) => {
      callback = cb;
      return { data: { subscription: { unsubscribe: jest.fn() } } };
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.initialized).toBe(true));
    expect(result.current.session).toEqual(session);
    expect(callback).toBeDefined();
  });

  it('updates session when auth state changes', async () => {
    getSessionMock.mockResolvedValueOnce({ data: { session: null } });
    let callback: any;
    onAuthStateChangeMock.mockImplementationOnce((cb) => {
      callback = cb;
      return { data: { subscription: { unsubscribe: jest.fn() } } };
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.initialized).toBe(true));
    expect(result.current.session).toBeNull();

    const newSession = { user: { id: '2' } } as any;
    act(() => {
      callback('SIGNED_IN', newSession);
    });

    await waitFor(() => expect(result.current.session).toEqual(newSession));
  });
});

describe('useFrameworkReady', () => {
  it('calls window.frameworkReady when defined', async () => {
    const ready = jest.fn();
    (window as any).frameworkReady = ready;

    renderHook(() => useFrameworkReady());

    await waitFor(() => expect(ready).toHaveBeenCalled());
  });
});

