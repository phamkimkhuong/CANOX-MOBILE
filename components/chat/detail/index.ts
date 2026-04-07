/**
 * Chat Detail Components Index
 * Re-exports all chat detail components
 */

// Atoms
export { default as ChatBubble } from './ChatBubble';
export { default as DateSeparator } from './DateSeparator';
export { default as MessageStatus } from './MessageStatus';

// Molecules
export { AttachmentMenu } from './AttachmentMenu';
export { default as ChatInputArea } from './ChatInputArea';
export { default as ContextBar } from './ContextBar';
export { MessageActionSheet } from './MessageActionSheet';
export type { MessageActionSheetRef } from './MessageActionSheet';
export { default as MessageItem } from './MessageItem';
// Screen Header
export { default as ChatDetailHeader } from './ChatDetailHeader';

// Loading
export { default as ChatDetailSkeleton } from './ChatDetailSkeleton';

// Re-export types
export type { BubblePosition } from '@/utils/adapter/chat/messageAdapter';

