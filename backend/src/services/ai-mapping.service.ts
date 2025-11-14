// backend/src/services/ai-mapping.service.ts
import { openai } from "../utils/openai";

/**
 * AI-based Mapping Suggestions
 */
export async function suggestMappings(sourceFields: any[], targetFields: any[]) {
  const prompt = `
You are an expert Salesforce CPQ → Revenue Cloud migration assistant.

Given:
- Source fields (from CPQ): ${JSON.stringify(sourceFields, null, 2)}
- Target fields (from Revenue Cloud): ${JSON.stringify(targetFields, null, 2)}

Task:
Return JSON array of mappings with:
- sourceField
- targetField
- confidence (0.0–1.0)
- reason
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You generate accurate CPQ → Revenue Cloud field mappings with confidence scoring." },
      { role: "user", content: prompt }
    ],
    response_format: { type: "json_object" }
  });

  const content = response.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("OpenAI returned empty content");
  }

  return JSON.parse(content);
}
