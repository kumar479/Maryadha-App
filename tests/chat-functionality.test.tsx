import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ChatBottomSheet from '../components/factory/ChatBottomSheet';
import GroupChat from '../components/messages/GroupChat';
import { supabase } from '../lib/supabase';

// Mock expo-image-picker
jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
  MediaTypeOptions: {
    Images: 'Images',
  },
  requestMediaLibraryPermissionsAsync: jest.fn(),
}));

// Mock supabase
jest.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    storage: {
      from: jest.fn(),
    },
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: 'test-chat-id' },
            error: null,
          }),
          order: jest.fn().mockReturnValue({
            data: [],
            error: null,
          }),
        }),
        order: jest.fn().mockReturnValue({
          data: [],
          error: null,
        }),
      }),
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: 'test-message-id', text: 'test message' },
            error: null,
          }),
        }),
      }),
    }),
    channel: jest.fn().mockReturnValue({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn().mockReturnValue({
        unsubscribe: jest.fn(),
      }),
    }),
  },
}));

// Mock fetch
global.fetch = jest.fn();

describe('ChatBottomSheet', () => {
  const mockProps = {
    isVisible: true,
    onClose: jest.fn(),
    chatId: 'test-chat-id',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock successful auth
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: {
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
        },
      },
      error: null,
    });

    // Mock successful storage operations
    (supabase.storage.from as jest.Mock).mockReturnValue({
      upload: jest.fn().mockResolvedValue({
        data: { path: 'test-path' },
        error: null,
      }),
      getPublicUrl: jest.fn().mockReturnValue({
        data: { publicUrl: 'https://test.com/image.jpg' },
      }),
    });

    // Mock successful fetch
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({}),
    });

    // Mock successful image picker
    const ImagePicker = require('expo-image-picker');
    ImagePicker.launchImageLibraryAsync.mockResolvedValue({
      canceled: false,
      assets: [
        {
          uri: 'file://test.jpg',
          type: 'image/jpeg',
          name: 'test.jpg',
        },
      ],
    });
    ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
      status: 'granted',
    });
  });

  it('renders correctly', () => {
    const { getByTestId } = render(<ChatBottomSheet {...mockProps} />);
    expect(getByTestId('chat-input')).toBeTruthy();
  });

  it('sends a message successfully with proper typing', async () => {
    const { getByTestId } = render(
      <ChatBottomSheet {...mockProps} />
    );

    const input = getByTestId('chat-input');
    fireEvent.changeText(input, 'Hello, world!');

    const sendButton = getByTestId('send-button');
    fireEvent.press(sendButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/functions/v1/sync-messages'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': expect.stringContaining('Bearer'),
            'Accept': 'application/json',
          },
          body: expect.stringMatching(/"chat_id":.+"text":"Hello, world!"/)
        })
      );
    });
  });

  it('handles file attachments with proper error handling', async () => {
    const { getByTestId } = render(<ChatBottomSheet {...mockProps} />);

    const attachButton = getByTestId('attach-button');
    fireEvent.press(attachButton);

    await waitFor(() => {
      // Check that image picker was called
      const ImagePicker = require('expo-image-picker');
      expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalledWith({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
      });
    });
  });

  it('displays error messages with improved error handling', async () => {
    // Mock a failed API call
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    const { getByTestId, findByText } = render(
      <ChatBottomSheet {...mockProps} />
    );

    const input = getByTestId('chat-input');
    fireEvent.changeText(input, 'Hello, world!');

    const sendButton = getByTestId('send-button');
    fireEvent.press(sendButton);

    const errorMessage = await findByText('API Error');
    expect(errorMessage).toBeTruthy();
  });

  it('handles authentication errors gracefully', async () => {
    // Mock auth failure
    (supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
      data: { user: null },
      error: new Error('Not authenticated'),
    });

    const { getByTestId, findByText } = render(
      <ChatBottomSheet {...mockProps} />
    );

    const input = getByTestId('chat-input');
    fireEvent.changeText(input, 'Hello, world!');

    const sendButton = getByTestId('send-button');
    fireEvent.press(sendButton);

    const errorMessage = await findByText('Not authenticated');
    expect(errorMessage).toBeTruthy();
  });

  it('handles HTTP error responses properly', async () => {
    // Mock HTTP error response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: jest.fn().mockResolvedValue({ error: 'Bad Request' }),
    });

    const { getByTestId, findByText } = render(
      <ChatBottomSheet {...mockProps} />
    );

    const input = getByTestId('chat-input');
    fireEvent.changeText(input, 'Hello, world!');

    const sendButton = getByTestId('send-button');
    fireEvent.press(sendButton);

    const errorMessage = await findByText('Bad Request');
    expect(errorMessage).toBeTruthy();
  });

  it('clears error state on successful message send', async () => {
    const { getByTestId, queryByText } = render(
      <ChatBottomSheet {...mockProps} />
    );

    // First, trigger an error
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    const input = getByTestId('chat-input');
    fireEvent.changeText(input, 'Error message');
    const sendButton = getByTestId('send-button');
    fireEvent.press(sendButton);

    await waitFor(() => {
      expect(queryByText('API Error')).toBeTruthy();
    });

    // Then, send a successful message
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({}),
    });

    fireEvent.changeText(input, 'Success message');
    fireEvent.press(sendButton);

    await waitFor(() => {
      expect(queryByText('API Error')).toBeNull();
    });
  });
});

describe('GroupChat', () => {
  const mockProps = {
    orderId: 'test-order-id',
    onError: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('handles message loading with proper type formatting', async () => {
    const mockMessages = [
      {
        id: '1',
        chat_id: 'chat1',
        sender_id: 'user1',
        text: 'Hello',
        attachments: [],
        created_at: new Date().toISOString(),
        sender: [{ id: 'user1', email: 'user1@example.com' }],
      },
    ];

    (supabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === 'group_chats') {
        return {
          select: () => ({
            eq: () => ({
              order: () => Promise.resolve({ data: [{ id: 'chat1' }], error: null }),
            }),
          }),
        };
      }
      if (table === 'messages') {
        return {
          select: () => ({
            eq: () => ({
              order: () => Promise.resolve({ data: mockMessages, error: null }),
            }),
          }),
        };
      }
      return {};
    });

    const { getByText } = render(<GroupChat {...mockProps} />);

    await waitFor(() => {
      expect(getByText('Hello')).toBeTruthy();
    });
  });

  it('sends a message successfully with proper typing', async () => {
    const { getByTestId } = render(
      <ChatBottomSheet {...mockProps} />
    );

    const input = getByTestId('chat-input');
    fireEvent.changeText(input, 'Hello, world!');

    const sendButton = getByTestId('send-button');
    fireEvent.press(sendButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/functions/v1/sync-messages'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': expect.stringContaining('Bearer'),
            'Accept': 'application/json',
          },
          body: expect.stringMatching(/"chat_id":.+"text":"Hello, world!"/)
        })
      );
    });
  });

  it('handles file attachments with proper error handling', async () => {
    const { getByTestId } = render(<ChatBottomSheet {...mockProps} />);

    const attachButton = getByTestId('attach-button');
    fireEvent.press(attachButton);

    await waitFor(() => {
      // Check that image picker was called
      const ImagePicker = require('expo-image-picker');
      expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalledWith({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
      });
    });
  });

  it('displays error messages with improved error handling', async () => {
    // Mock a failed API call
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    const { getByTestId, findByText } = render(
      <ChatBottomSheet {...mockProps} />
    );

    const input = getByTestId('chat-input');
    fireEvent.changeText(input, 'Hello, world!');

    const sendButton = getByTestId('send-button');
    fireEvent.press(sendButton);

    const errorMessage = await findByText('API Error');
    expect(errorMessage).toBeTruthy();
  });

  it('handles authentication errors gracefully', async () => {
    // Mock auth failure
    (supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
      data: { user: null },
      error: new Error('Not authenticated'),
    });

    const { getByTestId, findByText } = render(
      <ChatBottomSheet {...mockProps} />
    );

    const input = getByTestId('chat-input');
    fireEvent.changeText(input, 'Hello, world!');

    const sendButton = getByTestId('send-button');
    fireEvent.press(sendButton);

    const errorMessage = await findByText('Not authenticated');
    expect(errorMessage).toBeTruthy();
  });

  it('handles HTTP error responses properly', async () => {
    // Mock HTTP error response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: jest.fn().mockResolvedValue({ error: 'Bad Request' }),
    });

    const { getByTestId, findByText } = render(
      <ChatBottomSheet {...mockProps} />
    );

    const input = getByTestId('chat-input');
    fireEvent.changeText(input, 'Hello, world!');

    const sendButton = getByTestId('send-button');
    fireEvent.press(sendButton);

    const errorMessage = await findByText('Bad Request');
    expect(errorMessage).toBeTruthy();
  });

  it('clears error state on successful message send', async () => {
    const { getByTestId, queryByText } = render(
      <ChatBottomSheet {...mockProps} />
    );

    // First, trigger an error
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    const input = getByTestId('chat-input');
    fireEvent.changeText(input, 'Error message');
    const sendButton = getByTestId('send-button');
    fireEvent.press(sendButton);

    await waitFor(() => {
      expect(queryByText('API Error')).toBeTruthy();
    });

    // Then, send a successful message
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({}),
    });

    fireEvent.changeText(input, 'Success message');
    fireEvent.press(sendButton);

    await waitFor(() => {
      expect(queryByText('API Error')).toBeNull();
    });
  });
}); 