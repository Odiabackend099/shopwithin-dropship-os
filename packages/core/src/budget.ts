export type LeanBudgetAllocation = {
  totalNgn: number;
  domainAndToolsNgn: number;
  aiCreativeNgn: number;
  tiktokTestingNgn: number;
  retargetingBackupNgn: number;
  maxColdTestDailyNgn: number;
  minOrganicPostsBeforePaid: number;
  minCreativesBeforePaid: number;
};

export type CreativeValidationInput = {
  organicPostsPublished: number;
  creativesProduced: number;
  bestOrganicViewCount: number;
  bestOrganicClickThroughRate: number;
  landingPageSessions: number;
  addToCarts: number;
};

export type CreativeValidationDecision = {
  paidTestAllowed: boolean;
  reasons: string[];
};

export const leanNgnBudget: LeanBudgetAllocation = {
  totalNgn: 50000,
  domainAndToolsNgn: 10000,
  aiCreativeNgn: 10000,
  tiktokTestingNgn: 20000,
  retargetingBackupNgn: 10000,
  maxColdTestDailyNgn: 5000,
  minOrganicPostsBeforePaid: 15,
  minCreativesBeforePaid: 20
};

export function validateLeanBudget(allocation: LeanBudgetAllocation = leanNgnBudget): boolean {
  return (
    allocation.domainAndToolsNgn +
      allocation.aiCreativeNgn +
      allocation.tiktokTestingNgn +
      allocation.retargetingBackupNgn ===
    allocation.totalNgn
  );
}

export function evaluateCreativeValidation(input: CreativeValidationInput): CreativeValidationDecision {
  const reasons: string[] = [];
  const addToCartRate = input.landingPageSessions > 0 ? (input.addToCarts / input.landingPageSessions) * 100 : 0;

  if (input.organicPostsPublished < leanNgnBudget.minOrganicPostsBeforePaid) reasons.push("publish_more_organic_posts_before_paid");
  if (input.creativesProduced < leanNgnBudget.minCreativesBeforePaid) reasons.push("produce_20_to_30_creatives_first");
  if (input.bestOrganicClickThroughRate < 1.5 && input.bestOrganicViewCount < 1000) reasons.push("no_click_or_view_signal_yet");
  if (input.landingPageSessions >= 50 && addToCartRate < 3) reasons.push("landing_page_not_converting_clicks");

  return { paidTestAllowed: reasons.length === 0, reasons };
}

export function capColdTestSpend(requestedDailyBudgetNgn: number): number {
  return Math.min(Math.max(0, requestedDailyBudgetNgn), leanNgnBudget.maxColdTestDailyNgn);
}
