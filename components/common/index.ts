/**
 * ==============================================
 * COMMON COMPONENTS - INDEX
 * ==============================================
 * 
 * Export all common/shared components from one place.
 */

// State Management Components
export { StateView } from './StateView';
export type { StateType, StateViewProps } from './StateView';

export { DataGuard, defaultIsEmpty, detectErrorType } from './DataGuard';
export type { DataGuardMeta, DataGuardProps } from './DataGuard';

export { AppCrashFallbackView, AppRenderErrorFallback, AppRouteErrorBoundary, createRouteErrorBoundary } from './AppCrashFallback';

export { SectionCrashBoundary } from './SectionCrashBoundary';
export type { SectionCrashBoundaryProps } from './SectionCrashBoundary';

export { SectionStateCard } from './SectionStateCard';
export type { SectionStateCardProps, SectionStateKind } from './SectionStateCard';

// Update / Version Guard Components
export { ForceUpdateScreen } from './ForceUpdateScreen';
export { SoftUpdateBanner, shouldShowSoftUpdate } from './SoftUpdateBanner';

