/**
 * Bank Settings Layout - Slot (Pass-through)
 * 
 * Duy trì triết lý tránh Layout Hell của dự án.
 * Header và Stack được quản lý bởi cha.
 */

import { Slot } from 'expo-router';

export default function BankLayout() {
    return <Slot />;
}
