import { common } from "./es/common.ts";
import { auth } from "./es/auth.ts";
import { profile } from "./es/profile.ts";
import { customer } from "./es/customer.ts";
import { merchant } from "./es/merchant.ts";
import { campaigns } from "./es/campaigns.ts";
import { redeem } from "./es/redeem.ts";
import { establishments } from "./es/establishments.ts";
import { billing } from "./es/billing.ts";
import { errors } from "./es/errors.ts";

export const es = {
    ...common,
    ...auth,
    ...profile,
    ...customer,
    ...merchant,
    ...campaigns,
    ...redeem,
    ...establishments,
    ...billing,
    errors: {
        ...errors.errors,
        ...campaigns.campaigns.errors,
    },
} as const;