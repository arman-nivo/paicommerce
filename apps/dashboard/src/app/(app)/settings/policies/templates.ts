export type PolicyKey = "refund" | "privacy" | "terms" | "shipping";

export const POLICY_META: { key: PolicyKey; label: string; description: string }[] = [
  { key: "refund", label: "Return & refund", description: "When and how customers can return products and get their money back." },
  { key: "privacy", label: "Privacy", description: "What customer data you collect and how you use it." },
  { key: "terms", label: "Terms of service", description: "The rules for buying from your store." },
  { key: "shipping", label: "Shipping & delivery", description: "Delivery areas, charges and timelines." },
];

type Info = { name: string; email?: string | null; phone?: string | null };

const esc = (v: string) => v.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

function contact(s: Info) {
  const bits = [s.phone && `phone/WhatsApp: <strong>${esc(s.phone)}</strong>`, s.email && `email: <strong>${esc(s.email)}</strong>`].filter(Boolean);
  return bits.length ? bits.join(" or ") : "the contact details on our website";
}

export function policyTemplate(key: PolicyKey, s: Info): string {
  const n = esc(s.name);
  switch (key) {
    case "refund":
      return `<h2>Return &amp; Refund Policy</h2>
<p>At <strong>${n}</strong>, we want you to be happy with every order. If something isn't right, we're here to help.</p>
<h3>Checking your parcel</h3>
<p>Please check your products in front of the delivery person before paying. If the product is damaged, defective or not what you ordered, you may refuse the parcel and pay only the delivery charge.</p>
<h3>Returns</h3>
<ul>
<li>You can request a return within <strong>3 days</strong> of receiving your order.</li>
<li>Items must be unused, unwashed and in the original packaging with all tags attached.</li>
<li>Undergarments, cosmetics, perishable food and customised products cannot be returned for hygiene reasons.</li>
</ul>
<h3>Refunds</h3>
<ul>
<li>After we receive and inspect the returned item, refunds are processed within <strong>7 working days</strong>.</li>
<li>Refunds are sent via bKash, Nagad or bank transfer. Card payments are refunded to the original card.</li>
<li>Delivery charges are non-refundable unless the product was damaged or incorrect.</li>
</ul>
<h3>Exchanges</h3>
<p>Need a different size or colour? We're happy to exchange subject to stock availability. The customer pays the delivery charge for size/colour exchanges.</p>
<h3>How to request a return</h3>
<p>Contact us with your order number via ${contact(s)}.</p>`;
    case "privacy":
      return `<h2>Privacy Policy</h2>
<p>This policy explains how <strong>${n}</strong> collects, uses and protects your personal information when you visit or buy from our store.</p>
<h3>Information we collect</h3>
<ul>
<li>Contact details: name, phone number, email address and delivery address.</li>
<li>Order details: products purchased, payment method and transaction ID (we never store your card or mobile banking PIN).</li>
<li>Technical data: device, browser and pages visited, collected through cookies and analytics tools.</li>
</ul>
<h3>How we use your information</h3>
<ul>
<li>To process, deliver and support your orders — including sharing your name, phone and address with our courier partner.</li>
<li>To send order updates by SMS, email or phone call.</li>
<li>To improve our website and, if you agree, to send you offers. You can opt out at any time.</li>
</ul>
<h3>Sharing</h3>
<p>We do not sell your personal information. We share it only with payment gateways, courier companies and service providers who help us run the store.</p>
<h3>Your rights</h3>
<p>You may ask us to access, correct or delete your personal data by contacting us via ${contact(s)}.</p>`;
    case "terms":
      return `<h2>Terms of Service</h2>
<p>By placing an order with <strong>${n}</strong>, you agree to the following terms.</p>
<h3>Orders</h3>
<ul>
<li>All orders are subject to product availability. We may call you to confirm your order before shipping.</li>
<li>We reserve the right to cancel orders with incorrect information, suspected fraud or repeated refusals of delivery.</li>
</ul>
<h3>Prices &amp; payment</h3>
<ul>
<li>All prices are in Bangladeshi Taka (BDT) and include applicable VAT unless stated otherwise.</li>
<li>We accept Cash on Delivery and the online payment methods shown at checkout. Some orders may require an advance delivery charge.</li>
</ul>
<h3>Product information</h3>
<p>We try to show product colours and details as accurately as possible, but actual colours may vary slightly due to screen settings and photography.</p>
<h3>Liability</h3>
<p>Our liability for any order is limited to the amount paid for that order.</p>
<h3>Contact</h3>
<p>Questions about these terms? Reach us via ${contact(s)}.</p>`;
    case "shipping":
      return `<h2>Shipping &amp; Delivery Policy</h2>
<p><strong>${n}</strong> delivers to all 64 districts of Bangladesh through trusted courier partners.</p>
<h3>Delivery time</h3>
<ul>
<li><strong>Inside Dhaka:</strong> 1–2 working days</li>
<li><strong>Dhaka sub-areas</strong> (Savar, Gazipur, Narayanganj, Keraniganj): 2–3 working days</li>
<li><strong>Outside Dhaka:</strong> 3–5 working days</li>
</ul>
<p>Delivery may take longer during Eid, hartals, natural disasters or other events outside our control.</p>
<h3>Delivery charges</h3>
<p>Delivery charges are calculated at checkout based on your area. Orders are processed within 24 hours of confirmation (excluding Fridays and public holidays).</p>
<h3>Cash on Delivery</h3>
<p>Please keep the exact amount ready. You may check the product in front of the delivery person before payment.</p>
<h3>Tracking</h3>
<p>Once your parcel is handed to the courier, we'll send you a tracking number by SMS. For any delivery issue, contact us via ${contact(s)}.</p>`;
  }
}
