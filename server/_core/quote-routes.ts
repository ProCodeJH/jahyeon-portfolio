import { Router, Request, Response } from "express";

// SMS sending utility using CoolSMS or similar Korean SMS API
// NOTE: You'll need to configure your SMS provider credentials in .env
// COOLSMS_API_KEY=your_api_key
// COOLSMS_API_SECRET=your_api_secret  
// COOLSMS_SENDER=010XXXXXXXX

interface QuoteRequestBody {
    projectType: string;
    coreFeatures: string;
    timeline: string;
    budgetRange?: string;
    referenceSites?: string;
    name: string;
    email: string;
    phone: string;
    message?: string;
}

// SMS API Integration (CoolSMS example)
async function sendSMS(to: string, message: string): Promise<boolean> {
    const apiKey = process.env.COOLSMS_API_KEY;
    const apiSecret = process.env.COOLSMS_API_SECRET;
    const sender = process.env.COOLSMS_SENDER || "010-5239-8010";

    if (!apiKey || !apiSecret) {
        console.log("SMS credentials not configured, logging message instead:");
        console.log(`SMS to ${to}: ${message}`);
        return true; // Return true for development without actual SMS
    }

    try {
        // CoolSMS API v4
        const timestamp = Date.now().toString();
        const signature = await createHmacSignature(apiSecret, timestamp);

        const response = await fetch("https://api.coolsms.co.kr/messages/v4/send", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `HMAC-SHA256 apiKey=${apiKey}, date=${timestamp}, signature=${signature}`
            },
            body: JSON.stringify({
                message: {
                    to,
                    from: sender,
                    text: message
                }
            })
        });

        if (response.ok) {
            console.log("SMS sent successfully");
            return true;
        } else {
            const error = await response.text();
            console.error("SMS send failed:", error);
            return false;
        }
    } catch (error) {
        console.error("SMS send error:", error);
        return false;
    }
}

// HMAC-SHA256 signature for CoolSMS
async function createHmacSignature(secret: string, timestamp: string): Promise<string> {
    const crypto = await import("crypto");
    return crypto.createHmac("sha256", secret).update(timestamp).digest("hex");
}

export function registerQuoteRoutes(app: Router) {
    app.post("/api/quote-request", async (req: Request, res: Response) => {
        try {
            const body = req.body as QuoteRequestBody;

            // Validate required fields
            if (!body.projectType || !body.coreFeatures || !body.timeline ||
                !body.name || !body.email || !body.phone) {
                res.status(400).json({
                    success: false,
                    message: "필수 항목을 모두 입력해주세요."
                });
                return;
            }

            // Format SMS message
            const smsMessage = `[견적요청]
이름: ${body.name}
연락처: ${body.phone}
유형: ${body.projectType}
일정: ${body.timeline}
예산: ${body.budgetRange || "미정"}
내용: ${body.coreFeatures.substring(0, 50)}...`;

            // Send SMS notification to owner
            const targetPhone = "010-5239-8010";
            const smsSent = await sendSMS(targetPhone, smsMessage);

            // Log the request for backup
            console.log("=== New Quote Request ===");
            console.log("Time:", new Date().toISOString());
            console.log("Name:", body.name);
            console.log("Email:", body.email);
            console.log("Phone:", body.phone);
            console.log("Project Type:", body.projectType);
            console.log("Timeline:", body.timeline);
            console.log("Budget:", body.budgetRange);
            console.log("Features:", body.coreFeatures);
            console.log("Reference:", body.referenceSites);
            console.log("Message:", body.message);
            console.log("SMS Sent:", smsSent);
            console.log("========================");

            // Optionally save to database here
            // await saveQuoteRequest(body);

            res.json({
                success: true,
                message: "견적 요청이 성공적으로 접수되었습니다. 24시간 내에 연락드리겠습니다.",
                smsSent
            });
        } catch (error) {
            console.error("Quote request error:", error);
            res.status(500).json({
                success: false,
                message: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
            });
        }
    });
}
