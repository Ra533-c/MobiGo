import crypto from "crypto";

export const verifyRazorpaySignature = (
  orderId: string,
  paymentId: string,
  signature: string,
) => {
  const body = `${orderId}|${paymentId}`; //it makes a signature

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!.trim())
    .update(body)
    .digest("hex");

  return expectedSignature === signature;
};
