import { ChatListScreen } from '@/components/chat/ChatListScreen';
import { useNavigationUnlockOnFocus } from '@/hooks/useNavigationUnlockOnFocus';
import React from 'react';

export default function ChatStackScreen() {
    // Unlock navigation when screen gains focus
    useNavigationUnlockOnFocus();

    return <ChatListScreen isTab={false} />;

}
