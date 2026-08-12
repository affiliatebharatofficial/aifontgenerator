import { createClient } from '@/lib/supabase/server';

export interface AnalyticsEventInput {
  eventName: string;
  userId?: string | null;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Server-side event tracker writing real product activity to analytics_events table
 */
export async function trackAnalyticsEvent(input: AnalyticsEventInput): Promise<void> {
  try {
    const supabase = await createClient();

    let resolvedUserId = input.userId;
    if (!resolvedUserId) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      resolvedUserId = user?.id || null;
    }

    await (supabase.from as unknown as (relation: string) => {
      insert: (data: Record<string, unknown>) => Promise<unknown>;
    })('analytics_events').insert({
      user_id: resolvedUserId,
      event_name: input.eventName,
      entity_type: input.entityType || null,
      entity_id: input.entityId || null,
      metadata: input.metadata || {},
    });
  } catch (err) {
    // Non-blocking logger error handling
    console.warn(`[Analytics] Failed to track event [${input.eventName}]:`, err);
  }
}
