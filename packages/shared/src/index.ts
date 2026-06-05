export const userRoles = ["STUDENT", "ADMIN"] as const;
export const merchantStatuses = ["PENDING", "APPROVED", "REJECTED", "SUSPENDED"] as const;
export const activityStatuses = ["DRAFT", "ACTIVE", "PAUSED", "ENDED"] as const;

export type UserRole = (typeof userRoles)[number];
export type MerchantStatus = (typeof merchantStatuses)[number];
export type ActivityStatus = (typeof activityStatuses)[number];

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

// ── 学业服务 ──

export const teacherStatuses = ["PENDING", "APPROVED", "REJECTED"] as const;
export const reviewStatuses = ["PENDING", "APPROVED", "REJECTED", "HIDDEN"] as const;
export const materialStatuses = ["PENDING", "APPROVED", "REJECTED", "HIDDEN"] as const;

export type TeacherStatus = (typeof teacherStatuses)[number];
export type ReviewStatus = (typeof reviewStatuses)[number];
export type MaterialStatus = (typeof materialStatuses)[number];
