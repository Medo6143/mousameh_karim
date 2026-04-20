import { NextResponse } from "next/server";

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const { text, emotion } = await req.json();

    if (!emotion) {
      return NextResponse.json(
        { error: "Emotion is required" },
        { status: 400 }
      );
    }

    // Using the user-provided OpenRouter API Key
    const apiKey = process.env.VITE_OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY || "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";

    const emotionMap: Record<string, string> = {
      upset: "زعلان / عتاب بلطف",
      reconcile: "عايز يصالح / يفتح صفحة جديدة",
      miss: "وحشني / مفتقده",
      grateful: "ممتن / بيشكر",
      saraha: "رسالة صراحة / فضفضة",
    };

    let prompt = "";
    if (text) {
      prompt = `You are a respectful Egyptian mediator.
The sender selected the emotion: ${emotionMap[emotion] || emotion}
The raw message is: "${text}"

Rewrite this message into natural Egyptian Arabic (عامية مصرية). 
Make it kind, constructive, respectful, and non-toxic. Do not change the fundamental meaning.
Respond ONLY with the rewritten Arabic text.`;
    } else {
      prompt = `You are a creative Egyptian mediator.
Generate exactly 3 different, natural Egyptian Arabic (عامية مصرية) messages for someone feeling: ${emotionMap[emotion] || emotion}.
The messages should be ready to send to another person. They should vary from very short to medium length.
Format the output EXACTLY as a JSON array of strings, with no markdown formatting, no code blocks, and no extra text. 
Example format:
["Message 1", "Message 2", "Message 3"]`;
    }

    const openRouterRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openrouter/auto",
        messages: [
          { role: "system", "content": "You are an Egyptian AI mediator assistant." },
          { role: "user", "content": prompt }
        ]
      })
    });

    if (!openRouterRes.ok) {
      const errorText = await openRouterRes.text();
      console.error("OpenRouter API Error:", errorText);
      throw new Error(`OpenRouter Error: ${openRouterRes.status}`);
    }

    const data = await openRouterRes.json();
    const content = data.choices?.[0]?.message?.content?.trim() || "";

    if (text) {
      return NextResponse.json({ rewrite: content || "تعذر إعادة الصياغة" });
    } else {
      let suggestions = [];
      try {
        // Attempt to parse the JSON array
        // Remove potential markdown code blocks if the AI disobeyed
        const cleanedContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
        suggestions = JSON.parse(cleanedContent);
      } catch (err) {
        // Fallback: split by newlines if JSON parsing fails
        suggestions = content.split('\n').filter((s: string) => s.trim().length > 0).map((s: string) => s.replace(/^\d+\.\s*/, '').replace(/"/g, '').trim()).slice(0, 3);
      }
      return NextResponse.json({ suggestions });
    }
  } catch (error) {
    console.error("AI API Error:", error);
    return NextResponse.json(
      { error: "Failed to rewrite message" },
      { status: 500 }
    );
  }
}
