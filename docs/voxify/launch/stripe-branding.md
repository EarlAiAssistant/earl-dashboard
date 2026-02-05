# Stripe Branding Setup for Voxify

Update your Stripe dashboard to show Voxify branding on checkout and invoices.

## 1. Business Settings

**Stripe Dashboard → Settings → Business settings → Public details**

- **Business name:** Voxify
- **Support email:** support@getvoxify.com
- **Support phone:** (optional)
- **Support URL:** https://getvoxify.com/contact

## 2. Branding

**Stripe Dashboard → Settings → Branding**

### Colors
- **Brand color:** `#14b8a6` (Teal-500)
- **Accent color:** `#0d9488` (Teal-600)

### Logo
- Upload the Voxify logo (square format works best)
- Location: `/public/logo/voxify-v-icon.png`
- Recommended size: 512x512px or larger

### Icon
- Use the V icon for favicon/small displays
- Same file works: `voxify-v-icon.png`

## 3. Customer Portal

**Stripe Dashboard → Settings → Billing → Customer portal**

### Branding
- Enable custom branding
- Upload logo
- Set colors to match

### Features to enable:
- ✅ View invoices
- ✅ Update payment methods
- ✅ Cancel subscriptions
- ✅ Switch plans (if you want self-service upgrades)

### Links
- **Terms of Service:** https://getvoxify.com/terms
- **Privacy Policy:** https://getvoxify.com/privacy

## 4. Checkout

**Stripe Dashboard → Settings → Checkout**

- Enable custom branding
- Upload logo
- The checkout will automatically use your brand colors

## 5. Invoices & Receipts

**Stripe Dashboard → Settings → Billing → Invoice template**

- **Memo/Footer:** "Thank you for using Voxify!"
- Upload logo for invoice header
- Set business address if applicable

## 6. Email Receipts

**Stripe Dashboard → Settings → Emails**

- Enable receipt emails
- They'll automatically include your branding

---

## Quick Checklist

- [ ] Update business name to "Voxify"
- [ ] Set support email to support@getvoxify.com
- [ ] Upload logo in Branding settings
- [ ] Set brand color to #14b8a6
- [ ] Configure Customer Portal
- [ ] Add Terms/Privacy links
- [ ] Customize invoice template

---

*Takes about 10 minutes to complete all settings.*
