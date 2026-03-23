const RESEND_API_KEY = process.env.RESEND_API_KEY;
const ORDERS_FROM_EMAIL = "orders@resilientofficial.com";
const INFO_EMAIL = "info@resilientofficial.com";
const BRAND_NAME = "RESILIENT";
const SENDER_NAME = "Resilient Official";
const SITE_URL = "https://resilientofficial.com";
const LOGO_URL = `${SITE_URL}/images/logo-icon.png`;

export function resendConfigured(): boolean {
  return !!RESEND_API_KEY;
}

async function sendEmail(to: string, subject: string, html: string, fromEmail = ORDERS_FROM_EMAIL): Promise<void> {
  if (!resendConfigured()) {
    console.warn("[Email] Resend not configured — skipping send to", to);
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `${SENDER_NAME} <${fromEmail}>`,
      reply_to: INFO_EMAIL,
      to,
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend error ${res.status}: ${err}`);
  }
}

function baseTemplate(content: string, preheader = ""): string {
  const year = new Date().getFullYear();
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${BRAND_NAME}</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
  <style>
    @media only screen and (max-width: 620px) {
      .email-body { width: 100% !important; }
      .mobile-pad { padding: 24px 16px !important; }
      .mobile-full { width: 100% !important; display: block !important; }
      .mobile-btn { width: 100% !important; text-align: center !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">

  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>` : ""}

  <!-- Outer wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0a0a0a;">
    <tr>
      <td align="center" style="padding:32px 16px 48px;">

        <!-- Email container -->
        <table class="email-body" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;">

          <!-- HEADER -->
          <tr>
            <td style="background-color:#0a0a0a;border-bottom:2px solid #0080ff;padding:32px 40px;" class="mobile-pad">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="vertical-align:middle;">
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="vertical-align:middle;padding-right:14px;">
                          <img src="${LOGO_URL}" alt="${BRAND_NAME}" width="48" height="48" style="display:block;width:48px;height:48px;object-fit:contain;" onerror="this.style.display='none'" />
                        </td>
                        <td style="vertical-align:middle;">
                          <span style="font-size:24px;font-weight:900;letter-spacing:0.35em;text-transform:uppercase;color:#ffffff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${BRAND_NAME}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" style="vertical-align:middle;">
                    <span style="font-size:9px;letter-spacing:0.25em;text-transform:uppercase;color:#0080ff;font-weight:700;">OFFICIAL STORE</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Electric blue accent bar -->
          <tr>
            <td style="background-color:#0080ff;height:3px;font-size:1px;line-height:1px;">&nbsp;</td>
          </tr>

          <!-- CONTENT -->
          <tr>
            <td style="background-color:#111111;padding:40px 40px 32px;" class="mobile-pad">
              ${content}
            </td>
          </tr>

          <!-- CTA FOOTER BAND -->
          <tr>
            <td style="background-color:#0d0d0d;border-top:2px solid #1a1a1a;border-bottom:2px solid #1a1a1a;padding:24px 40px;text-align:center;" class="mobile-pad">
              <a href="${SITE_URL}" style="display:inline-block;padding:14px 36px;background-color:#0080ff;color:#ffffff;text-decoration:none;font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
                SHOP RESILIENT
              </a>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background-color:#0a0a0a;padding:28px 40px;" class="mobile-pad">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <p style="margin:0 0 8px;font-size:18px;font-weight:900;letter-spacing:0.3em;text-transform:uppercase;color:#333;">${BRAND_NAME}</p>
                    <p style="margin:0 0 4px;font-size:10px;color:#444;letter-spacing:0.15em;text-transform:uppercase;">
                      <a href="${SITE_URL}" style="color:#0080ff;text-decoration:none;">${SITE_URL.replace("https://", "")}</a>
                      &nbsp;·&nbsp;
                      <a href="mailto:${INFO_EMAIL}" style="color:#555;text-decoration:none;">${INFO_EMAIL}</a>
                    </p>
                    <p style="margin:8px 0 0;font-size:10px;color:#333;letter-spacing:0.1em;text-transform:uppercase;">
                      © ${year} ${BRAND_NAME}. All rights reserved.
                    </p>
                    <p style="margin:6px 0 0;font-size:9px;color:#2a2a2a;letter-spacing:0.08em;text-transform:uppercase;">
                      You received this email because you placed an order or subscribed to updates.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
}

/* ─── ORDER CONFIRMATION ─────────────────────────────────────────────── */
export async function sendOrderConfirmationEmail(
  to: string,
  customerName: string,
  orderId: string,
  items: { name: string; size: string; quantity: number; price: number; preorder?: boolean; preorderTimeframe?: string }[],
  total: string,
  shippingAddress?: { street?: string; city?: string; state?: string; zip?: string },
  preorder?: { isPreorder: boolean; timeframe: string }
): Promise<void> {
  const shortId = orderId.slice(0, 8).toUpperCase();
  const firstName = customerName.split(" ")[0];

  const itemRows = items
    .map(
      (i) => `
      <tr>
        <td style="padding:14px 0;border-bottom:1px solid #1e1e1e;font-size:13px;font-weight:700;color:#ffffff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
          ${i.name}
          <br/>
          <span style="font-size:11px;font-weight:400;color:#666;">Size: ${i.size} &nbsp;·&nbsp; Qty: ${i.quantity}</span>
          ${i.preorder ? `<br/><span style="font-size:11px;font-weight:700;color:#f59e0b;">⚠️ PREORDER — Ships in ~${i.preorderTimeframe || "4-6 weeks"}</span>` : ""}
        </td>
        <td style="padding:14px 0;border-bottom:1px solid #1e1e1e;text-align:right;font-size:13px;font-weight:700;color:#0080ff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
          $${(i.price * i.quantity).toFixed(2)}
        </td>
      </tr>`
    )
    .join("");

  const addrLine = shippingAddress
    ? [shippingAddress.street, shippingAddress.city, shippingAddress.state, shippingAddress.zip].filter(Boolean).join(", ")
    : "—";

  const preorderItems = items.filter((i) => i.preorder);
  const hasPreorderItems = preorderItems.length > 0;

  const preorderBlock = hasPreorderItems ? `
    <!-- Preorder Notice -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
      <tr>
        <td style="background-color:#7c3d00;border:2px solid #f59e0b;padding:16px 20px;">
          <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#f59e0b;font-weight:700;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">⚠️ Preorder Notice</p>
          <p style="margin:0;font-size:14px;color:#ffffff;font-weight:700;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
            ${preorderItems.length === 1
              ? `<strong>${preorderItems[0].name}</strong> is a preorder item — estimated ship time: <strong>${preorderItems[0].preorderTimeframe || "4-6 weeks"}</strong>.`
              : `${preorderItems.length} items in your order are preorders: ${preorderItems.map(i => `<strong>${i.name}</strong> (~${i.preorderTimeframe || "4-6 weeks"})`).join(", ")}.`
            }
          </p>
          <p style="margin:8px 0 0;font-size:12px;color:#fcd34d;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
            We'll send you a shipping confirmation email as soon as your order is on its way.
          </p>
        </td>
      </tr>
    </table>` : "";

  const content = `
    <!-- Greeting -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:32px;">
      <tr>
        <td>
          <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.25em;text-transform:uppercase;color:#0080ff;font-weight:700;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Order Confirmed</p>
          <h1 style="margin:0 0 12px;font-size:28px;font-weight:900;letter-spacing:0.05em;text-transform:uppercase;color:#ffffff;line-height:1.2;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
            Thank you, ${firstName}.
          </h1>
          <p style="margin:0;font-size:14px;color:#888;line-height:1.6;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
            Your order is confirmed. ${preorder?.isPreorder ? `This is a <strong style="color:#f59e0b;">preorder</strong> — estimated shipping: ${preorder.timeframe}.` : "We'll send you another email as soon as it ships."}
          </p>
        </td>
      </tr>
    </table>

    ${preorderBlock}

    <!-- Order ID badge -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
      <tr>
        <td style="background-color:#0d1a2e;border:2px solid #0080ff;padding:16px 20px;">
          <span style="font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#0080ff;font-weight:700;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Order ID</span>
          <br/>
          <span style="font-size:20px;font-weight:900;letter-spacing:0.15em;color:#ffffff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">#${shortId}</span>
        </td>
      </tr>
    </table>

    <!-- Items -->
    <p style="margin:0 0 12px;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#555;font-weight:700;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Items Ordered</p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:0;">
      ${itemRows}
      <tr>
        <td style="padding:16px 0 0;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#666;font-weight:700;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
          Total
        </td>
        <td style="padding:16px 0 0;text-align:right;font-size:22px;font-weight:900;color:#0080ff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
          $${Number(total).toFixed(2)}
        </td>
      </tr>
    </table>

    <!-- Divider -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0;">
      <tr><td style="border-top:1px solid #1e1e1e;font-size:1px;height:1px;">&nbsp;</td></tr>
    </table>

    <!-- Shipping Address -->
    <p style="margin:0 0 6px;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#555;font-weight:700;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Shipping To</p>
    <p style="margin:0;font-size:14px;color:#aaa;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${addrLine}</p>
  `;

  await sendEmail(
    to,
    `Order Confirmed — #${shortId} | ${BRAND_NAME}`,
    baseTemplate(content, `Order #${shortId} confirmed. We'll notify you when it ships.`)
  );
}

/* ─── SHIPPING NOTIFICATION ─────────────────────────────────────────── */
const CARRIER_TRACKING_URLS: Record<string, string> = {
  USPS: "https://tools.usps.com/go/TrackConfirmAction?tLabels=",
  UPS: "https://www.ups.com/track?tracknum=",
  FedEx: "https://www.fedex.com/fedextrack/?trknbr=",
  DHL: "https://www.dhl.com/us-en/home/tracking.html?tracking-id=",
  Other: "",
};

export function buildTrackingUrl(carrier: string, trackingNumber: string): string {
  const base = CARRIER_TRACKING_URLS[carrier] ?? "";
  if (!base) return "";
  return `${base}${encodeURIComponent(trackingNumber)}`;
}

export async function sendShippingEmail(
  to: string,
  customerName: string,
  orderId: string,
  items: { name: string; size: string; quantity: number; price: number }[],
  carrier: string,
  trackingNumber: string
): Promise<void> {
  const shortId = orderId.slice(0, 8).toUpperCase();
  const firstName = customerName.split(" ")[0];
  const trackingUrl = buildTrackingUrl(carrier, trackingNumber);

  const itemRows = items
    .map(
      (i) => `
      <tr>
        <td style="padding:14px 0;border-bottom:1px solid #1e1e1e;font-size:13px;font-weight:700;color:#ffffff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
          ${i.name}
          <br/>
          <span style="font-size:11px;font-weight:400;color:#666;">Size: ${i.size} &nbsp;·&nbsp; Qty: ${i.quantity}</span>
        </td>
        <td style="padding:14px 0;border-bottom:1px solid #1e1e1e;text-align:right;font-size:13px;font-weight:700;color:#0080ff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
          $${(i.price * i.quantity).toFixed(2)}
        </td>
      </tr>`
    )
    .join("");

  const trackingButtonRow = trackingUrl
    ? `
    <!-- Track My Order button -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
      <tr>
        <td align="center">
          <a href="${trackingUrl}" target="_blank"
             style="display:inline-block;background-color:#0080ff;color:#ffffff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:13px;font-weight:900;letter-spacing:0.15em;text-transform:uppercase;text-decoration:none;padding:14px 36px;">
            &#128270; Track My Order
          </a>
        </td>
      </tr>
    </table>`
    : "";

  const content = `
    <!-- Shipped badge -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:32px;">
      <tr>
        <td>
          <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.25em;text-transform:uppercase;color:#0080ff;font-weight:700;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">&#128230; On Its Way</p>
          <h1 style="margin:0 0 12px;font-size:26px;font-weight:900;letter-spacing:0.04em;text-transform:uppercase;color:#ffffff;line-height:1.2;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
            Your Order Has Shipped!
          </h1>
          <p style="margin:0;font-size:14px;color:#888;line-height:1.6;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
            Hey ${firstName}, great news — your package is on its way. Track it below.
          </p>
        </td>
      </tr>
    </table>

    <!-- Order ID -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
      <tr>
        <td style="background-color:#0d1a2e;border:2px solid #0080ff;padding:16px 20px;">
          <span style="font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#0080ff;font-weight:700;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Order ID</span>
          <br/>
          <span style="font-size:18px;font-weight:900;letter-spacing:0.15em;color:#ffffff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">#${shortId}</span>
        </td>
      </tr>
    </table>

    <!-- Carrier + Tracking Number -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
      <tr>
        <td style="background-color:#0d1a0d;border:2px solid #00c853;padding:16px 20px;">
          <span style="font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#00c853;font-weight:700;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
            ${carrier} — Tracking Number
          </span>
          <br/>
          <span style="font-size:20px;font-weight:900;letter-spacing:0.1em;color:#ffffff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${trackingNumber}</span>
        </td>
      </tr>
    </table>

    ${trackingButtonRow}

    <!-- Items -->
    <p style="margin:0 0 12px;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#555;font-weight:700;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Items Shipped</p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
      ${itemRows}
    </table>

    <!-- Divider -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0;">
      <tr><td style="border-top:1px solid #1e1e1e;font-size:1px;height:1px;">&nbsp;</td></tr>
    </table>

    <!-- Support note -->
    <p style="margin:0;font-size:12px;color:#555;line-height:1.7;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
      Questions about your shipment? Reply to this email or contact us at
      <a href="mailto:${INFO_EMAIL}" style="color:#0080ff;text-decoration:none;">${INFO_EMAIL}</a>
    </p>
  `;

  await sendEmail(
    to,
    `Your Order Has Shipped! &#128230; — #${shortId}`,
    baseTemplate(content, `Great news ${firstName} — your order #${shortId} is on its way!`)
  );
}

/* ─── CANCELLATION EMAIL ────────────────────────────────────────────── */
export async function sendCancellationEmail(
  to: string,
  customerName: string,
  orderId: string,
  items: { name: string; size: string; quantity: number; price: number }[],
  total: string,
  refundId?: string
): Promise<void> {
  const shortId = orderId.slice(0, 8).toUpperCase();
  const firstName = customerName.split(" ")[0];

  const itemRows = items
    .map(
      (i) => `
      <tr>
        <td style="padding:14px 0;border-bottom:1px solid #1e1e1e;font-size:13px;font-weight:700;color:#ffffff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
          ${i.name}
          <br/>
          <span style="font-size:11px;font-weight:400;color:#666;">Size: ${i.size} &nbsp;·&nbsp; Qty: ${i.quantity}</span>
        </td>
        <td style="padding:14px 0;border-bottom:1px solid #1e1e1e;text-align:right;font-size:13px;font-weight:700;color:#aaa;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
          $${(i.price * i.quantity).toFixed(2)}
        </td>
      </tr>`
    )
    .join("");

  const refundBlock = refundId
    ? `
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
        <tr>
          <td style="background-color:#1a0d0d;border:2px solid #ff4444;padding:16px 20px;">
            <span style="font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#ff4444;font-weight:700;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Refund Reference</span>
            <br/>
            <span style="font-size:13px;font-weight:700;letter-spacing:0.05em;color:#ffffff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${refundId}</span>
          </td>
        </tr>
      </table>`
    : "";

  const content = `
    <!-- Cancelled header -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:32px;">
      <tr>
        <td>
          <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.25em;text-transform:uppercase;color:#ff4444;font-weight:700;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Order Cancelled</p>
          <h1 style="margin:0 0 12px;font-size:26px;font-weight:900;letter-spacing:0.04em;text-transform:uppercase;color:#ffffff;line-height:1.2;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
            We're Sorry, ${firstName}.
          </h1>
          <p style="margin:0;font-size:14px;color:#888;line-height:1.7;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
            Your order has been cancelled. We sincerely apologize for any inconvenience. A
            <strong style="color:#ffffff;">full refund of $${Number(total).toFixed(2)}</strong> has been issued
            and should appear on your original payment method within <strong style="color:#ffffff;">5–7 business days</strong>.
          </p>
        </td>
      </tr>
    </table>

    <!-- Order ID -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
      <tr>
        <td style="background-color:#1a0d0d;border:2px solid #ff4444;padding:16px 20px;">
          <span style="font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#ff4444;font-weight:700;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Order ID</span>
          <br/>
          <span style="font-size:18px;font-weight:900;letter-spacing:0.15em;color:#ffffff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">#${shortId}</span>
        </td>
      </tr>
    </table>

    ${refundBlock}

    <!-- Items cancelled -->
    <p style="margin:0 0 12px;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#555;font-weight:700;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Items Cancelled</p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
      ${itemRows}
    </table>

    <!-- Refund total -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
      <tr>
        <td style="padding:14px 0;border-top:2px solid #333;text-align:right;">
          <span style="font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#555;font-weight:700;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Refund Total &nbsp;</span>
          <span style="font-size:16px;font-weight:900;color:#ff4444;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">$${Number(total).toFixed(2)}</span>
        </td>
      </tr>
    </table>

    <!-- Divider -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0;">
      <tr><td style="border-top:1px solid #1e1e1e;font-size:1px;height:1px;">&nbsp;</td></tr>
    </table>

    <!-- Support note -->
    <p style="margin:0;font-size:12px;color:#555;line-height:1.7;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
      If you have any questions about your refund or cancellation, please don't hesitate to reach out at
      <a href="mailto:${INFO_EMAIL}" style="color:#0080ff;text-decoration:none;">${INFO_EMAIL}</a>.
      We're here to help.
    </p>
  `;

  await sendEmail(
    to,
    `We're Sorry — Your Order Has Been Cancelled — #${shortId}`,
    baseTemplate(content, `Your order #${shortId} has been cancelled. A full refund has been issued.`)
  );
}

/* ─── EMAIL BLAST ───────────────────────────────────────────────────── */
export async function blastEmail(
  recipients: { email: string }[],
  subject: string,
  bodyHtml: string
): Promise<{ sent: number; failed: number }> {
  if (!resendConfigured()) {
    console.warn("[Email] Resend not configured — blast skipped.");
    return { sent: 0, failed: 0 };
  }

  const content = `
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="font-size:15px;line-height:1.8;color:#cccccc;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
          ${bodyHtml}
        </td>
      </tr>
    </table>
  `;

  let sent = 0;
  let failed = 0;

  for (const r of recipients) {
    try {
      await sendEmail(r.email, subject, baseTemplate(content), INFO_EMAIL);
      sent++;
      await new Promise((res) => setTimeout(res, 600));
    } catch (e) {
      console.error("[Email] Failed to send to", r.email, e);
      failed++;
    }
  }

  return { sent, failed };
}

/* ─── CONTACT EMAIL ─────────────────────────────────────────────────── */
export async function sendContactEmail(
  to: string,
  subject: string,
  message: string
): Promise<void> {
  const content = `
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="font-size:15px;line-height:1.8;color:#cccccc;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;white-space:pre-wrap;">
          ${message.replace(/\n/g, "<br/>")}
        </td>
      </tr>
    </table>
  `;
  await sendEmail(to, subject, baseTemplate(content), INFO_EMAIL);
}

/* ─── CONTACT CONFIRMATION EMAIL ──────────────────────────────────────── */
export async function sendContactConfirmationEmail(
  to: string,
  name: string
): Promise<void> {
  const content = `
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="padding-bottom:20px;">
          <p style="font-size:15px;line-height:1.8;color:#cccccc;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0;">
            Hi ${name},
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom:20px;">
          <p style="font-size:15px;line-height:1.8;color:#cccccc;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0;">
            We've received your message and appreciate you reaching out. A member of our team will get back to you within <strong style="color:#ffffff;">24–48 hours</strong>.
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom:20px;">
          <p style="font-size:15px;line-height:1.8;color:#cccccc;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0;">
            In the meantime, feel free to browse the latest drops at <a href="https://resilientofficial.com/shop" style="color:#0080FF;text-decoration:none;">resilientofficial.com</a>.
          </p>
        </td>
      </tr>
      <tr>
        <td>
          <p style="font-size:13px;line-height:1.6;color:#666666;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0;">
            — The Resilient Team
          </p>
        </td>
      </tr>
    </table>
  `;
  await sendEmail(to, "We received your message — Resilient Official", baseTemplate(content), INFO_EMAIL);
}
