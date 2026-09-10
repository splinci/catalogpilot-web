export interface AccessCertificationReview {
  reviewId: string;
  companyId: string;
  reviewerUserId: string;
  totalUsersReviewed: number;
  revokedUsersCount: number;
  certifiedAt: string;
}

const reviews: AccessCertificationReview[] = [];

export function recordAccessCertificationReview(
  companyId: string,
  reviewerUserId: string,
  totalUsersReviewed: number,
  revokedUsersCount: number
): AccessCertificationReview {
  const review: AccessCertificationReview = {
    reviewId: `cert_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    companyId,
    reviewerUserId,
    totalUsersReviewed,
    revokedUsersCount,
    certifiedAt: new Date().toISOString(),
  };

  reviews.unshift(review);
  return review;
}

export function getTenantAccessCertifications(companyId: string): AccessCertificationReview[] {
  return reviews.filter((r) => r.companyId === companyId);
}

export function clearCertificationStore(): void {
  reviews.length = 0;
}
