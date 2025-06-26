# Chat Functionality Implementation

## Overview

The chat functionality in the Maryadha app has been updated to match the actual database schema, with improved type safety and error handling.

## Database Schema

The messages table structure:
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL,
  sender_id UUID NOT NULL,
  receiver_id UUID,
  text TEXT NOT NULL,
  attachments TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Type Definitions

### Message Interface
```typescript
interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  receiver_id?: string;
  text: string;
  attachments?: string[];
  created_at: string;
}
```

### Database Message Interface
```typescript
interface DatabaseMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  receiver_id?: string;
  text: string;
  attachments?: string[];
  created_at: string;
}
```

### Message Data for Sending
```typescript
interface MessageData {
  chat_id: string;
  sender_id: string;
  text: string;
  attachments?: string[];
}
```

## Components

### ChatBottomSheet

The main chat interface component that handles:
- Message sending with proper typing
- File attachment uploads
- Error handling and display
- Real-time message updates

**Key Features:**
- Proper TypeScript typing for all operations
- Improved error handling with specific error messages
- File attachment support with Supabase storage
- Real-time message synchronization

### GroupChat

The core chat component that manages:
- Message loading and display
- Real-time subscriptions
- Message formatting and type conversion
- Chat initialization

**Key Features:**
- Automatic chat creation if none exists
- Real-time message subscriptions
- Proper message formatting from database responses
- Attachment handling

## Usage Examples

### Basic Chat Implementation

```typescript
import ChatBottomSheet from '../components/factory/ChatBottomSheet';

function MyComponent() {
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);

  return (
    <ChatBottomSheet
      isVisible={isChatVisible}
      onClose={() => setIsChatVisible(false)}
      chatId={chatId}
    />
  );
}
```

### Group Chat Implementation

```typescript
import GroupChat from '../components/messages/GroupChat';

function MyComponent() {
  const handleError = (error: string) => {
    console.error('Chat error:', error);
  };

  return (
    <GroupChat
      orderId="order-123"
      onError={handleError}
    />
  );
}
```

## Error Handling

The chat system includes comprehensive error handling:

### Authentication Errors
- Proper handling of unauthenticated users
- Clear error messages for auth failures

### Network Errors
- HTTP error response handling
- Network timeout handling
- Retry mechanisms for failed requests

### Database Errors
- Proper error propagation from Supabase
- User-friendly error messages
- Graceful degradation on database failures

### File Upload Errors
- Storage quota exceeded handling
- Invalid file type handling
- Upload timeout handling

## Testing

Comprehensive test coverage includes:

### Unit Tests
- Message sending functionality
- File attachment handling
- Error handling scenarios
- Type safety validation

### Integration Tests
- End-to-end message flow
- Real-time subscription testing
- Database interaction testing

## Performance Optimizations

### Message Loading
- Efficient database queries with proper indexing
- Optimized real-time subscriptions

### File Handling
- Image compression before upload
- Lazy loading of attachments
- Efficient storage bucket organization

### Memory Management
- Proper cleanup of subscriptions
- Efficient state management
- Memory leak prevention

## Security Considerations

### Authentication
- Proper user authentication checks
- Session validation for all operations
- Secure token handling

### Data Validation
- Input sanitization for messages
- File type validation
- Size limits for attachments

### Database Security
- Row-level security policies
- Proper access control
- SQL injection prevention

## Troubleshooting

### Common Issues

1. **Messages not sending**
   - Check authentication status
   - Verify chat ID exists
   - Check network connectivity

2. **File upload failures**
   - Verify storage bucket permissions
   - Check file size limits
   - Validate file types

3. **Real-time updates not working**
   - Check subscription status
   - Verify channel configuration
   - Check network connectivity

## Contributing

When contributing to the chat functionality:

1. Follow the established type definitions
2. Add comprehensive tests for new features
3. Update documentation for API changes
4. Ensure backward compatibility
5. Follow the error handling patterns

## Support

For issues or questions about the chat functionality:
1. Check the troubleshooting section
2. Review the test cases for examples
3. Check the TypeScript definitions
4. Consult the Supabase documentation 