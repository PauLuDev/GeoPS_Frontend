import { common } from "./en/common.ts";
import { auth } from "./en/auth.ts";
import { profile } from "./en/profile.ts";
import { customer } from "./en/customer.ts";
import { merchant } from "./en/merchant.ts";
import { campaigns } from "./en/campaigns.ts";
import { redeem } from "./en/redeem.ts";
import { establishments } from "./en/establishments.ts";
import { billing } from "./en/billing.ts";

export const en = {
    ...common,
    ...auth,
    ...profile,
    ...customer,
    ...merchant,
    ...campaigns,
    ...redeem,
    ...establishments,
    ...billing,
} as const;