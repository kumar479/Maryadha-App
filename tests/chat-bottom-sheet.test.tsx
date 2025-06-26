import React from 'react';
import {
  render,
  fireEvent,
  waitFor,
} from '@testing-library/react-native';
import { ScrollView } from 'react-native';

import ChatBottomSheet from '@/components/factory/ChatBottomSheet';
import { supabase } from '@/lib/supabase';

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: { getUser: jest.fn() },
    from: jest.fn(),
  },
}));

const mockedSupabase = supabase as jest.Mocked<typeof supabase>;

const user = {
  id: 'user1',
  email: 'test@example.com',
  app_metadata: { role: 'brand' },
};

function mockSupabase({
  messages = [],
  newMessage,
  selectError = null,
}: {
  messages?: any[];
  newMessage?: any;
  selectError?: any;
}) {
  mockedSupabase.auth.getUser.mockResolvedValue({
    data: { user },
    error: null,
  });

  mockedSupabase.from.mockImplementation((table: string) => {
    if (table === 'users') {
      return {
        select: () => ({
          eq: () => ({
            maybeSingle: () => Promise.resolve({ data: { id: user.id }, error: null }),
          }),
        }),
      } as any;
    }

    if (table === 'group_chats') {
      return {
        select: () => ({
          eq: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: { id: 'chat1' }, error: null }),
            }),
          }),
        }),
      } as any;
    }

    if (table === 'messages') {
      return {
        select: () => ({
          eq: () => ({
            order: () => Promise.resolve({ data: messages, error: selectError }),
          }),
        }),
        insert: () => ({
          select: () => ({
            single: () => Promise.resolve({ data: newMessage, error: null }),
          }),
        }),
      } as any;
    }

    if (table === 'chat_participants') {
      return {
        select: () => ({
          eq: () => ({
            eq: () => Promise.resolve({ data: [{ user_id: 'rep1' }], error: null }),
          }),
        }),
        insert: () => Promise.resolve({ error: null }),
      } as any;
    }

    if (table === 'message_notifications') {
      return {
        insert: () => Promise.resolve({ error: null }),
      } as any;
    }

    return {} as any;
  });
}

describe('ChatBottomSheet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading indicator and then renders messages', async () => {
    const existingMessages = [
      {
        id: '1',
        text: 'Hello',
        created_at: new Date().toISOString(),
        sender_id: user.id,
        users: { email: user.email, raw_app_meta_data: user.app_metadata },
      },
    ];

    mockSupabase({ messages: existingMessages });

    const { getByTestId, queryByTestId, getByText } = render(
      <ChatBottomSheet
        isVisible
        onClose={jest.fn()}
        factoryId="factory1"
        factoryName="Factory"
      />,
    );

    await waitFor(() => expect(getByTestId('loading-indicator')).toBeTruthy());
    await waitFor(() => expect(queryByTestId('loading-indicator')).toBeNull());
    expect(getByText('Hello')).toBeTruthy();
  });

  it('displays an error message when loading fails', async () => {
    mockSupabase({ messages: [], selectError: new Error('load failed') });

    const { getByText } = render(
      <ChatBottomSheet
        isVisible
        onClose={jest.fn()}
        factoryId="factory1"
        factoryName="Factory"
      />,
    );

    await waitFor(() => {
      expect(getByText('Failed to load messages')).toBeTruthy();
    });
  });

  it('calls onClose and hides the sheet', async () => {
    mockSupabase({ messages: [] });

    function Wrapper() {
      const [visible, setVisible] = React.useState(true);
      return (
        <ChatBottomSheet
          isVisible={visible}
          onClose={() => setVisible(false)}
          factoryId="factory1"
          factoryName="Factory"
        />
      );
    }

    const { getByTestId, queryByTestId } = render(<Wrapper />);

    fireEvent.press(getByTestId('close-button'));

    await waitFor(() => {
      expect(queryByTestId('close-button')).toBeNull();
    });
  });

  it('scrolls to bottom after sending a message', async () => {
    jest.useFakeTimers();
    const scrollSpy = jest.spyOn(ScrollView.prototype, 'scrollToEnd').mockImplementation(() => {});

    const existingMessages: any[] = [];
    const newMessage = {
      id: '2',
      text: 'New message',
      created_at: new Date().toISOString(),
      sender_id: user.id,
      users: { email: user.email, raw_app_meta_data: user.app_metadata },
    };

    mockSupabase({ messages: existingMessages, newMessage });

    const { getByPlaceholderText, getByTestId, queryByTestId } = render(
      <ChatBottomSheet
        isVisible
        onClose={jest.fn()}
        factoryId="factory1"
        factoryName="Factory"
      />,
    );

    await waitFor(() => expect(getByTestId('loading-indicator')).toBeTruthy());
    await waitFor(() => expect(queryByTestId('loading-indicator')).toBeNull());

    fireEvent.changeText(
      getByPlaceholderText('Type your message...'),
      'New message',
    );
    fireEvent.press(getByTestId('send-button'));

    jest.advanceTimersByTime(150);
    expect(scrollSpy).toHaveBeenCalled();

    jest.useRealTimers();
  });
});

