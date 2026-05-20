import { describe, expect, it } from "vitest";
import { Prisma } from "@prisma/client";
import { assertCouponClaimable, compareMerchants } from "../src/localLife.js";
import { activePromotionBoost } from "../src/services/rankingService.js";
import { normalizeAttribution, unknownAttributionGroup } from "../src/services/attributionService.js";
import { escapeCsvCell, toCsv } from "../src/services/exportService.js";

const now = new Date("2026-05-19T00:00:00.000Z");

describe("compareMerchants", () => {
  it("sorts by boost, manual order, rating, then newest first", () => {
    const base = { platformBoost: 10, sortOrder: 20, rating: new Prisma.Decimal(4.5), createdAt: new Date("2026-01-01") };
    const boosted = { ...base, platformBoost: 20 };
    const earlierSort = { ...base, sortOrder: 10 };
    const higherRating = { ...base, rating: new Prisma.Decimal(4.9) };
    const newer = { ...base, createdAt: new Date("2026-02-01") };

    expect(compareMerchants(boosted, base)).toBeLessThan(0);
    expect(compareMerchants(earlierSort, base)).toBeLessThan(0);
    expect(compareMerchants(higherRating, base)).toBeLessThan(0);
    expect(compareMerchants(newer, base)).toBeLessThan(0);
  });

  it("adds only active promotion boost while preserving fallback sort order", () => {
    const base = { platformBoost: 10, sortOrder: 20, rating: new Prisma.Decimal(4.5), createdAt: new Date("2026-01-01"), promotions: [] };
    const promoted = {
      ...base,
      platformBoost: 0,
      promotions: [{ boostWeight: 20, isActive: true, startAt: new Date("2026-05-01"), endAt: new Date("2026-06-01") }]
    };
    const expired = {
      ...base,
      platformBoost: 0,
      promotions: [{ boostWeight: 100, isActive: true, startAt: new Date("2026-01-01"), endAt: new Date("2026-02-01") }]
    };

    expect(activePromotionBoost(promoted, now)).toBe(20);
    expect(activePromotionBoost(expired, now)).toBe(0);
    expect(compareMerchants(promoted, base, now)).toBeLessThan(0);
  });
});

describe("assertCouponClaimable", () => {
  it("allows active coupons with stock inside validity window", () => {
    expect(assertCouponClaimable({ status: "ACTIVE", remainingStock: 1, validFrom: new Date("2026-01-01"), validTo: new Date("2026-12-31") }, now).ok).toBe(true);
  });

  it("rejects paused, expired, not started, and sold out coupons", () => {
    expect(assertCouponClaimable({ status: "PAUSED", remainingStock: 1, validFrom: new Date("2026-01-01"), validTo: new Date("2026-12-31") }, now).code).toBe("COUPON_INACTIVE");
    expect(assertCouponClaimable({ status: "ACTIVE", remainingStock: 1, validFrom: new Date("2026-01-01"), validTo: new Date("2026-02-01") }, now).code).toBe("COUPON_EXPIRED");
    expect(assertCouponClaimable({ status: "ACTIVE", remainingStock: 1, validFrom: new Date("2026-06-01"), validTo: new Date("2026-12-31") }, now).code).toBe("COUPON_NOT_STARTED");
    expect(assertCouponClaimable({ status: "ACTIVE", remainingStock: 0, validFrom: new Date("2026-01-01"), validTo: new Date("2026-12-31") }, now).code).toBe("COUPON_SOLD_OUT");
  });
});

describe("attributionService", () => {
  it("normalizes empty attribution fields to null and keeps valid fields", () => {
    expect(normalizeAttribution({ source: " poster_a ", channel: "", scene: "table_qr_01", campaign: undefined })).toEqual({
      source: "poster_a",
      channel: null,
      scene: "table_qr_01",
      campaign: null,
      activityId: null,
      shareLinkId: null,
      referrerId: null,
      sessionId: null
    });
    expect(unknownAttributionGroup(null)).toBe("unknown");
  });

  it("rejects attribution values over 64 characters", () => {
    expect(() => normalizeAttribution({ source: "x".repeat(65) })).toThrow();
  });
});

describe("exportService", () => {
  it("escapes csv cells with commas, quotes, and newlines", () => {
    expect(escapeCsvCell('西大, "一店"\nA')).toBe('"西大, ""一店""\nA"');
  });

  it("uses the expected analytics csv header order", () => {
    const csv = toCsv([{ date: "all", merchant: "店铺", coupon: "券", source: "poster", channel: "offline", exposures: 1, clicks: 1, claims: 1, redemptions: 0, clickRate: 1, redemptionRate: 0 }]);
    expect(csv.split("\n")[0]).toBe("date,merchant,coupon,source,channel,exposures,clicks,claims,redemptions,clickRate,redemptionRate");
  });
});
