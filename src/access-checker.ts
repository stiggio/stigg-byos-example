import { DB } from "./db";

interface AccessDecision {
  hasAccess: boolean;
  reason?: string;
}

export async function checkAccess(customerId: string, featureId: string, requestedUsage?: number): Promise<AccessDecision> {
  const customer = await DB.customers.where({ customer_id: customerId }).first();
  if (!customer) {
    return { hasAccess: false, reason: 'Customer not found' };
  }

  const entitlement = customer.entitlements.find((entitlement) => entitlement.feature.id === featureId);
  if (!entitlement) {
    return { hasAccess: false, reason: 'Customer not entitled to feature' };
  }

  const { featureType, meterType } = entitlement.feature;

  switch (featureType) {
    case 'BOOLEAN':
      return { hasAccess: true };
    case 'NUMBER': {
      if (!meterType || meterType === 'None') {
        return { hasAccess: true };
      }

      if (entitlement.hasUnlimitedUsage) {
        return { hasAccess: true };
      }

      let currentUsage = entitlement.currentUsage;
      if (meterType === 'INCREMENTAL' && new Date(entitlement.nextResetDate).valueOf() < Date.now()) {
        currentUsage = 0; // Reset date has passed, ignore current usage
      }

      if (currentUsage + (requestedUsage || 0) <= (entitlement.usageLimit || 0)) {
        return { hasAccess: true };
      }

      return { hasAccess: false, reason: "Requested usage exceeds the entitlement usage limit" };
    }
    default:
      throw new Error(`Unknown feature type: ${featureType}`);
  }
}