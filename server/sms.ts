const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const FROM_NUMBER = process.env.TWILIO_PHONE_NUMBER;

export function twilioConfigured(): boolean {
  return !!(ACCOUNT_SID && AUTH_TOKEN && FROM_NUMBER);
}

function toE164(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  if (phone.startsWith("+")) return phone;
  return `+${digits}`;
}

async function sendSms(to: string, body: string): Promise<void> {
  if (!twilioConfigured()) {
    console.warn("[SMS] Twilio not configured — skipping send to", to);
    return;
  }

  const formattedTo = toE164(to);
  const url = `https://api.twilio.com/2010-04-01/Accounts/${ACCOUNT_SID}/Messages.json`;
  const credentials = Buffer.from(`${ACCOUNT_SID}:${AUTH_TOKEN}`).toString("base64");
  const params = new URLSearchParams({ To: formattedTo, From: FROM_NUMBER!, Body: body });

  console.log(`[SMS] Sending to ${formattedTo} from ${FROM_NUMBER}`);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  const json = await res.json() as any;

  if (!res.ok) {
    console.error(`[SMS] Twilio error ${res.status} to ${formattedTo}:`, JSON.stringify(json));
    throw new Error(`Twilio error ${res.status}: ${json.message || JSON.stringify(json)}`);
  }

  console.log(`[SMS] Sent successfully to ${formattedTo} — SID: ${json.sid}`);
}

export async function sendOrderConfirmationSms(
  to: string,
  customerName: string,
  orderId: string,
  total: string
): Promise<void> {
  const shortId = orderId.slice(0, 8).toUpperCase();
  const message = `RESILIENT: Order confirmed! Hey ${customerName.split(" ")[0]}, your order #${shortId} for $${Number(total).toFixed(2)} is being processed. Thank you for supporting the brand.`;
  await sendSms(to, message);
}

export async function sendWelcomeSms(to: string): Promise<void> {
  const message = `RESILIENT: You're on the list. We'll text you first when the next drop goes live. Stay ready. — resilientofficial.com`;
  await sendSms(to, message);
}

export async function blastSms(
  subscribers: { phone: string }[],
  message: string
): Promise<{ sent: number; failed: number }> {
  if (!twilioConfigured()) {
    console.warn("[SMS] Twilio not configured — blast skipped.");
    return { sent: 0, failed: 0 };
  }

  let sent = 0;
  let failed = 0;

  for (const sub of subscribers) {
    try {
      await sendSms(sub.phone, message);
      sent++;
      await new Promise((r) => setTimeout(r, 80));
    } catch (e) {
      console.error("[SMS] Failed to send to", sub.phone, e);
      failed++;
    }
  }

  return { sent, failed };
}
