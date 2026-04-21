export type SectionFailureKind =
    | 'render-crash'
    | 'primary-remote-error'
    | 'background-refetch-error'
    | 'secondary-remote-error'
    | 'business-state'
    | 'optional-hidden'
    | 'operational-state';

export type SectionFailureUi =
    | 'section-crash-boundary'
    | 'remote-state-boundary'
    | 'section-state-card'
    | 'guidance-card'
    | 'render-null'
    | 'banner-or-overlay';

export interface SectionResilienceDecision {
    kind: SectionFailureKind;
    meaning: string;
    preferredUi: SectionFailureUi;
    avoid: string;
}

export const SECTION_RESILIENCE_DECISION_MATRIX: readonly SectionResilienceDecision[] = [
    {
        kind: 'render-crash',
        meaning: 'A component throws while React is rendering a subtree.',
        preferredUi: 'section-crash-boundary',
        avoid: 'Do not handle render crashes with toast, query state, or inline API errors.',
    },
    {
        kind: 'primary-remote-error',
        meaning: 'The main query for the screen failed before any usable primary data exists.',
        preferredUi: 'remote-state-boundary',
        avoid: 'Do not send expected API failures to a root or route crash fallback.',
    },
    {
        kind: 'background-refetch-error',
        meaning: 'A screen already has stale usable data, but a refresh/refetch failed.',
        preferredUi: 'remote-state-boundary',
        avoid: 'Do not replace usable stale data with a full-screen error.',
    },
    {
        kind: 'secondary-remote-error',
        meaning: 'An optional or secondary dependency failed while primary screen data remains usable.',
        preferredUi: 'section-state-card',
        avoid: 'Do not collapse the whole screen because a secondary section failed.',
    },
    {
        kind: 'business-state',
        meaning: 'The backend or local rules say this is a valid non-error product/business condition.',
        preferredUi: 'guidance-card',
        avoid: 'Do not present valid business conditions as system errors or render crashes.',
    },
    {
        kind: 'optional-hidden',
        meaning: 'A purely optional merchandising/recommendation block cannot be shown.',
        preferredUi: 'render-null',
        avoid: 'Do not add noisy error UI for content the user does not need to complete the task.',
    },
    {
        kind: 'operational-state',
        meaning: 'A cross-cutting service/network/outage state affects a broad app area.',
        preferredUi: 'banner-or-overlay',
        avoid: 'Do not mislabel service outage or offline state as a render crash.',
    },
] as const;

export const shouldRenderSectionStateCard = (kind: SectionFailureKind) =>
    kind === 'secondary-remote-error' || kind === 'background-refetch-error' || kind === 'business-state';

export const shouldHideOptionalSection = (kind: SectionFailureKind) => kind === 'optional-hidden';
