-- Add email_verified to tenants so self-serve signup verification is durable.
--
-- Backs lib/labs/payroll/auth/tenant.ts (createTenant / markTenantVerified).
-- NULL or 1 = verified (back-compat: existing rows and demo tenants are
-- treated as verified); 0 = unverified (awaiting email confirmation).

ALTER TABLE tenants ADD COLUMN email_verified INTEGER;

-- Existing + demo tenants are considered verified.
UPDATE tenants SET email_verified = 1 WHERE email_verified IS NULL;
