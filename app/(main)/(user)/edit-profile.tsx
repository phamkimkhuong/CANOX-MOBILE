import EditProfileScreen from '@/components/profile/edit/EditProfileScreen';
import { useNavigationUnlockOnFocus } from '@/hooks/useNavigationUnlockOnFocus';

export default function EditProfileWrapper() {
    // Unlock navigation when screen gains focus
    useNavigationUnlockOnFocus();

    return <EditProfileScreen />;
}

