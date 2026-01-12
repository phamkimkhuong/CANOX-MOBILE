/**
 * Chat Detail Components Index
 * Re-exports all chat detail components
 */

// Atoms
export { default as ChatBubble } from './ChatBubble';
export { default as DateSeparator } from './DateSeparator';
export { default as MessageStatus } from './MessageStatus';
export { default as SafetyBanner } from './SafetyBanner';

// Molecules
export { AttachmentMenu } from './AttachmentMenu';
export { default as ChatInputArea } from './ChatInputArea';
export { default as ContextBar } from './ContextBar';
export { default as MessageItem } from './MessageItem';
export { default as QuickReplyList } from './QuickReplyList';

// Screen Header
export { default as ChatDetailHeader } from './ChatDetailHeader';

// Loading
export { default as ChatDetailSkeleton } from './ChatDetailSkeleton';

// Re-export types
export type { BubblePosition } from '@/utils/adapter/chat/messageAdapter';

