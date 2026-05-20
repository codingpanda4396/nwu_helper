export const userRoles = ["STUDENT", "MERCHANT", "ADMIN"] as const;
export const merchantStatuses = ["PENDING", "APPROVED", "REJECTED", "SUSPENDED"] as const;
export const couponStatuses = ["ACTIVE", "PAUSED", "EXPIRED"] as const;
export const userCouponStatuses = ["CLAIMED", "USED", "EXPIRED"] as const;
export const activityTypes = ["DAILY_DEAL", "FEMALE_SELECTED", "GROUP_DEAL", "NIGHT_FOOD", "GENERAL"] as const;
export const activityStatuses = ["DRAFT", "ACTIVE", "PAUSED", "ENDED"] as const;
export const activityPricingModes = ["FREE", "CPC", "CPA", "FIXED"] as const;

export type UserRole = (typeof userRoles)[number];
export type MerchantStatus = (typeof merchantStatuses)[number];
export type CouponStatus = (typeof couponStatuses)[number];
export type UserCouponStatus = (typeof userCouponStatuses)[number];
export type ActivityType = (typeof activityTypes)[number];
export type ActivityStatus = (typeof activityStatuses)[number];
export type ActivityPricingMode = (typeof activityPricingModes)[number];

export type ApiSuccess<T> = {
  success: true;
  data: T;
  message?: string;
};

export type ApiFailure = {
  success: false;
  error: {
    code: string;
    message: string;
  };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;
