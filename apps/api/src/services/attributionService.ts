import { z } from "zod";

const attributionField = z
  .string()
  .trim()
  .max(64, "归因字段不能超过 64 个字符")
  .transform((value) => value || null)
  .nullish();

export const attributionSchema = z.object({
  source: attributionField,
  channel: attributionField,
  scene: attributionField,
  campaign: attributionField,
  activityId: z.string().trim().max(128).transform((value) => value || null).nullish(),
  shareLinkId: z.string().trim().max(128).transform((value) => value || null).nullish(),
  referrerId: z.string().trim().max(128).transform((value) => value || null).nullish(),
  sessionId: z.string().trim().max(128).transform((value) => value || null).nullish()
});

export type AttributionInput = z.input<typeof attributionSchema>;

export function normalizeAttribution(input: AttributionInput = {}) {
  const parsed = attributionSchema.parse(input);
  return {
    source: parsed.source ?? null,
    channel: parsed.channel ?? null,
    scene: parsed.scene ?? null,
    campaign: parsed.campaign ?? null,
    activityId: parsed.activityId ?? null,
    shareLinkId: parsed.shareLinkId ?? null,
    referrerId: parsed.referrerId ?? null,
    sessionId: parsed.sessionId ?? null
  };
}

export function attributionData(input: AttributionInput = {}) {
  const attribution = normalizeAttribution(input);
  return {
    source: attribution.source,
    channel: attribution.channel,
    scene: attribution.scene,
    campaign: attribution.campaign,
    activityId: attribution.activityId,
    shareLinkId: attribution.shareLinkId,
    referrerId: attribution.referrerId
  };
}

export function unknownAttributionGroup(value: string | null | undefined) {
  return value || "unknown";
}
