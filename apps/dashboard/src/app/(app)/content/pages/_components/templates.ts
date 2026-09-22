/** Ready-made page templates for Bangladeshi online stores. */
export type PageTemplate = { key: string; title: string; slug: string; blurb: string; content: string };

type StoreInfo = { name: string; email?: string | null; phone?: string | null; address?: string | null };

export function pageTemplates(s: StoreInfo): PageTemplate[] {
  const name = s.name || "our store";
  const email = s.email || "support@example.com";
  const phone = s.phone || "01XXXXXXXXX";
  const address = s.address || "Dhaka, Bangladesh";
  const contactLine = `<p>📞 Phone / WhatsApp: <strong>${phone}</strong><br>✉️ Email: <strong>${email}</strong><br>📍 Address: ${address}</p>`;

  return [
    {
      key: "about",
      title: "About us",
      slug: "about-us",
      blurb: "Your story, mission and why customers should trust you",
      content: `<h2>Welcome to ${name}</h2>
<p>${name} is a proudly Bangladeshi online store. We started with a simple goal: to bring quality products to customers all over Bangladesh at fair prices — delivered right to your doorstep.</p>
<h3>What we believe in</h3>
<ul><li><strong>Quality first</strong> — every product is checked before it is shipped.</li><li><strong>Honest pricing</strong> — no hidden charges. The price you see is the price you pay (plus delivery).</li><li><strong>Easy payment</strong> — Cash on Delivery all over Bangladesh, plus bKash, Nagad and cards.</li><li><strong>Fast delivery</strong> — inside Dhaka in 1–2 days, outside Dhaka in 2–5 days.</li></ul>
<h3>Our promise</h3>
<p>If something is not right with your order, just call or message us. Our support team is here to help 7 days a week, 10am – 8pm.</p>
${contactLine}
<p>Thank you for shopping with ${name}! ❤️</p>`,
    },
    {
      key: "contact",
      title: "Contact",
      slug: "contact",
      blurb: "Phone, WhatsApp, email and business hours",
      content: `<h2>We'd love to hear from you</h2>
<p>Have a question about a product, your order or delivery? Reach us any way you like — we usually reply within a few hours.</p>
${contactLine}
<h3>Business hours</h3>
<p>Saturday – Thursday: 10:00am – 8:00pm<br>Friday: 3:00pm – 8:00pm</p>
<h3>Order questions</h3>
<p>Please keep your <strong>order number</strong> ready when you contact us so we can help you faster. You can also message us on our Facebook page.</p>`,
    },
    {
      key: "privacy",
      title: "Privacy policy",
      slug: "privacy-policy",
      blurb: "How you collect and protect customer data",
      content: `<h2>Privacy policy</h2>
<p>This privacy policy explains how ${name} ("we", "us") collects, uses and protects your personal information when you visit or buy from our store.</p>
<h3>Information we collect</h3>
<ul><li>Your name, phone number, email and delivery address when you place an order.</li><li>Order history and payment method (we never store your bKash PIN, card number or OTP).</li><li>Basic device and browsing information (such as pages visited) to improve our store.</li></ul>
<h3>How we use your information</h3>
<ul><li>To process, deliver and confirm your orders — including sharing your name, phone and address with our delivery partners (e.g. Steadfast, Pathao, RedX).</li><li>To contact you about your order by phone, SMS, WhatsApp or email.</li><li>To send offers, only if you agree. You can opt out any time.</li><li>To prevent fraud and fake orders.</li></ul>
<h3>Cookies & analytics</h3>
<p>We use cookies to keep your cart and may use tools like Facebook Pixel and Google Analytics to understand how our store is used.</p>
<h3>Data security</h3>
<p>Online payments are processed by secure, licensed payment gateways. We never sell your personal information to anyone.</p>
<h3>Your rights</h3>
<p>You can ask us to view, correct or delete your personal information at any time by contacting us.</p>
${contactLine}`,
    },
    {
      key: "refund",
      title: "Refund policy",
      slug: "refund-policy",
      blurb: "Returns, exchanges and refunds (bKash/Nagad/bank)",
      content: `<h2>Return & refund policy</h2>
<p>We want you to love what you buy from ${name}. If you are not happy, here is how returns and refunds work.</p>
<h3>Check at delivery</h3>
<p>Please check your product in front of the delivery person. If the product is damaged, wrong or missing items, you may refuse it and pay only the delivery charge, or contact us immediately.</p>
<h3>Return window</h3>
<ul><li>You can request a return or exchange within <strong>3 days</strong> of receiving your order.</li><li>The item must be unused, unwashed and in its original packaging with tags.</li><li>Some items (innerwear, cosmetics, food, customised products and items on clearance sale) cannot be returned for hygiene or safety reasons.</li></ul>
<h3>Refunds</h3>
<ul><li>Once we receive and check the returned product, we'll process your refund within <strong>7 working days</strong>.</li><li>Refunds are sent via bKash, Nagad or bank transfer. Card payments are refunded to the same card.</li><li>Delivery charges are non-refundable unless the product was damaged or incorrect.</li></ul>
<h3>How to request a return</h3>
<p>Call or WhatsApp us with your order number and photos of the product.</p>
${contactLine}`,
    },
    {
      key: "terms",
      title: "Terms of service",
      slug: "terms-of-service",
      blurb: "Rules for using your store and placing orders",
      content: `<h2>Terms of service</h2>
<p>By using this website and placing an order with ${name}, you agree to the following terms.</p>
<h3>Orders</h3>
<ul><li>All orders are subject to availability and confirmation. We may call you to confirm your order before shipping.</li><li>We may cancel orders that look fraudulent, have incorrect information, or cannot be confirmed by phone.</li></ul>
<h3>Prices & payment</h3>
<ul><li>All prices are in Bangladeshi Taka (৳) and include applicable VAT unless stated otherwise.</li><li>We accept Cash on Delivery and online payments (bKash, Nagad, cards via secure gateways). Advance payment may be required for some products or areas.</li><li>Prices and offers may change without notice, but confirmed orders will not be affected.</li></ul>
<h3>Delivery</h3>
<p>Delivery times are estimates and may be delayed by weather, holidays (e.g. Eid) or courier issues. See our shipping policy for details.</p>
<h3>Product information</h3>
<p>We try to show products as accurately as possible. Colours may look slightly different depending on your screen.</p>
<h3>Governing law</h3>
<p>These terms are governed by the laws of the People's Republic of Bangladesh.</p>
${contactLine}`,
    },
    {
      key: "shipping",
      title: "Shipping policy",
      slug: "shipping-policy",
      blurb: "Delivery areas, charges and timelines",
      content: `<h2>Shipping & delivery policy</h2>
<p>${name} delivers to all 64 districts of Bangladesh through trusted courier partners.</p>
<h3>Delivery time</h3>
<ul><li><strong>Inside Dhaka:</strong> 1–2 working days</li><li><strong>Dhaka suburbs</strong> (Savar, Gazipur, Narayanganj, Keraniganj): 2–3 working days</li><li><strong>Outside Dhaka:</strong> 3–5 working days</li></ul>
<h3>Delivery charge</h3>
<ul><li>Inside Dhaka: ৳60</li><li>Outside Dhaka: ৳120</li></ul>
<p>The exact delivery charge is shown at checkout before you place your order.</p>
<h3>Cash on Delivery</h3>
<p>Cash on Delivery is available all over Bangladesh. For some high-value orders or remote areas, we may ask for the delivery charge in advance via bKash or Nagad.</p>
<h3>Order tracking</h3>
<p>After your order is shipped, you'll receive an SMS with your tracking information. You can also call us any time to check your order status.</p>
${contactLine}`,
    },
    {
      key: "faq",
      title: "FAQ",
      slug: "faq",
      blurb: "Answers to the questions customers ask most",
      content: `<h2>Frequently asked questions</h2>
<h3>How do I place an order?</h3>
<p>Add products to your cart, go to checkout, enter your name, phone number and address, and confirm. You can also order by calling or messaging us.</p>
<h3>Do you offer Cash on Delivery?</h3>
<p>Yes! Cash on Delivery is available all over Bangladesh. You can also pay with bKash, Nagad or card.</p>
<h3>How long does delivery take?</h3>
<p>Inside Dhaka 1–2 days, outside Dhaka 3–5 days.</p>
<h3>How much is the delivery charge?</h3>
<p>Inside Dhaka ৳60, outside Dhaka ৳120. The exact charge is shown at checkout.</p>
<h3>Can I return or exchange a product?</h3>
<p>Yes, within 3 days of delivery if the product is unused and in original condition. See our refund policy for details.</p>
<h3>How can I track my order?</h3>
<p>You'll receive an SMS when your order ships. You can also contact us with your order number.</p>
<h3>Still have questions?</h3>
${contactLine}`,
    },
  ];
}
