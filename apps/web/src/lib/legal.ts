export type LegalDoc = { slug: "terms" | "privacy" | "refund"; title: string; summary: string; updated: string; sections: { id: string; title: string; body: string[] }[] };

const CONTACT = "PaiCommerce Technologies Ltd., Level 9, Gulshan Avenue, Dhaka 1212, Bangladesh · legal@paicommerce.com";

export const LEGAL: LegalDoc[] = [
  {
    slug: "terms",
    title: "Terms of Service",
    summary: "The agreement between you and PaiCommerce when you create a store, build themes or use our APIs.",
    updated: "2026-09-01",
    sections: [
      { id: "acceptance", title: "1. Acceptance of terms", body: ["By creating an account, opening a store, submitting a theme or using the PaiCommerce API (together, the \"Services\") you agree to these Terms of Service. If you use the Services on behalf of a business, you confirm you are authorised to bind that business.", "You must be at least 18 years old, or the age of majority where you live, to use the Services."] },
      { id: "account", title: "2. Your account", body: ["You are responsible for the accuracy of your account information, keeping your password secure, and all activity under your account and staff accounts you invite.", "Notify us immediately at security@paicommerce.com if you suspect unauthorised access."] },
      { id: "store", title: "3. Your store and content", body: ["You own the products, images, text and customer data you upload (\"Merchant Content\"). You grant us a limited licence to host, display and process Merchant Content solely to operate the Services.", "You are solely responsible for the goods you sell, their legality under Bangladeshi law and any other applicable law, product descriptions, pricing, taxes (including VAT), delivery and after-sales service to your customers."] },
      { id: "prohibited", title: "4. Acceptable use", body: ["You may not use the Services to sell illegal, counterfeit, stolen or restricted goods; infringe intellectual property; send spam; distribute malware; engage in fraud or money laundering; or interfere with the security or performance of the platform.", "We may suspend or remove stores that violate this section, with notice where reasonably possible."] },
      { id: "payments", title: "5. Payments and gateways", body: ["Payment gateways (bKash, Nagad, SSLCommerz, aamarPay, Stripe, PayPal and others) are provided by third parties under their own terms. PaiCommerce is not a party to transactions between you and your customers and does not hold your customer payments unless expressly stated.", "Cash-on-delivery collections are handled by your courier partner under your agreement with them."] },
      { id: "fees", title: "6. Subscription fees", body: ["Paid plans are billed in advance monthly or yearly in BDT. Fees are non-refundable except as described in our Refund Policy. The Starter plan includes a 2% platform transaction fee on completed orders.", "We may change prices with at least 30 days' notice; changes apply from your next billing period."] },
      { id: "themes", title: "7. Themes and the Theme Store", body: ["Theme purchases grant a non-exclusive, non-transferable licence to use the theme on one store. Theme developers retain ownership of their themes and grant PaiCommerce a licence to distribute them.", "Theme developers receive 70% of net theme revenue, paid monthly above the minimum payout threshold, subject to the Theme Partner Agreement and review guidelines."] },
      { id: "api", title: "8. API and developer terms", body: ["API keys are confidential. Respect rate limits, only access data you are authorised to access, and do not use the API to build a competing platform by scraping.", "We may change or deprecate API versions with at least 90 days' notice for breaking changes."] },
      { id: "availability", title: "9. Availability and support", body: ["We aim for 99.9% monthly uptime (99.99% under Enterprise SLAs). Planned maintenance is announced on our status page. Support is provided by email and chat; response times depend on your plan."] },
      { id: "termination", title: "10. Termination", body: ["You may close your store at any time from Settings. We may suspend or terminate accounts for material breach of these terms or non-payment. After closure you can export your data for 30 days, after which it may be deleted."] },
      { id: "liability", title: "11. Disclaimers and limitation of liability", body: ["The Services are provided \"as is\". To the maximum extent permitted by law, PaiCommerce is not liable for indirect, incidental or consequential damages, lost profits or data, and our total liability is limited to the fees you paid in the 12 months before the claim."] },
      { id: "law", title: "12. Governing law", body: ["These terms are governed by the laws of the People's Republic of Bangladesh. Disputes are subject to the exclusive jurisdiction of the courts of Dhaka.", `Contact: ${CONTACT}`] },
    ],
  },
  {
    slug: "privacy",
    title: "Privacy Policy",
    summary: "What data we collect, why, and the choices merchants and their customers have.",
    updated: "2026-09-01",
    sections: [
      { id: "scope", title: "1. Scope", body: ["This policy covers personal data PaiCommerce processes as a controller (merchant accounts, website visitors, theme developers) and explains our role as a processor for data merchants collect about their customers."] },
      { id: "collect", title: "2. Data we collect", body: ["Account data: name, email, phone, password hash, business details and billing information.", "Usage data: pages visited in the dashboard, device and browser information, IP address and approximate location, used for security and product improvement.", "Store data: products, orders, customers and settings you create. For shoppers this includes names, phone numbers, delivery addresses and order history, processed on the merchant's behalf."] },
      { id: "use", title: "3. How we use data", body: ["To provide and secure the Services, process subscription payments, run fraud checks (including courier delivery success ratios), provide support, send service and — with consent — marketing communications, and comply with legal obligations."] },
      { id: "sharing", title: "4. Sharing", body: ["We share data with sub-processors that help us run the Services (cloud hosting, email/SMS delivery, payment gateways, courier partners you connect, analytics) under data-processing agreements. We never sell personal data.", "When merchants enable integrations such as Meta Conversions API or Google Analytics, event data is sent to those providers under the merchant's instructions."] },
      { id: "retention", title: "5. Retention", body: ["We keep account data while your account is active and for up to 5 years after closure where required for tax and legal purposes. Store data is deleted 30 days after store closure unless the merchant requests earlier deletion."] },
      { id: "security", title: "6. Security", body: ["Data is encrypted in transit (TLS) and at rest. Passwords are hashed with bcrypt, API keys are stored as hashes, access is role-based and audited, and webhooks are HMAC-signed."] },
      { id: "rights", title: "7. Your rights", body: ["You can access, correct, export or delete your data from your dashboard or by emailing privacy@paicommerce.com. Shoppers should contact the merchant they purchased from; we will assist merchants with such requests."] },
      { id: "cookies", title: "8. Cookies", body: ["We use essential cookies for sign-in (pai_session) and active store selection, and optional analytics cookies on this website. Storefront cookies (cart, customer session) are set by the merchant's store."] },
      { id: "contact", title: "9. Contact", body: [`Data protection enquiries: privacy@paicommerce.com · ${CONTACT}`] },
    ],
  },
  {
    slug: "refund",
    title: "Refund Policy",
    summary: "How refunds work for PaiCommerce subscriptions and Theme Store purchases.",
    updated: "2026-09-01",
    sections: [
      { id: "trial", title: "1. Free trial", body: ["Paid plans start with a 14-day free trial. You are not charged until the trial ends, and you can cancel anytime during the trial at no cost."] },
      { id: "subscriptions", title: "2. Subscriptions", body: ["Monthly subscriptions are non-refundable once a billing period has started; cancellation takes effect at the end of the current period.", "Yearly subscriptions can be refunded in full within 14 days of the initial yearly payment. After 14 days, we refund the unused full months minus any discount received for yearly billing."] },
      { id: "themes", title: "3. Theme purchases", body: ["You can preview any theme in the customizer before buying. Theme purchases are refundable within 7 days if the theme has not been published on your live store, or if it has a material defect the developer cannot fix within 14 days."] },
      { id: "fees", title: "4. Transaction and gateway fees", body: ["Platform transaction fees on the Starter plan and fees charged by payment gateways or couriers are not refundable by PaiCommerce."] },
      { id: "how", title: "5. How to request a refund", body: ["Email billing@paicommerce.com from your account email with your store name and invoice number. Approved refunds are returned to the original payment method (bKash, Nagad or card) within 7–10 business days."] },
      { id: "customers", title: "6. Refunds to your customers", body: ["This policy covers payments you make to PaiCommerce. Refunds to your own customers are governed by your store's refund policy, which you can publish from Settings → Policies."] },
    ],
  },
];
