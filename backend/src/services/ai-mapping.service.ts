// backend/src/services/ai-mapping.service.ts
import { openai } from "../utils/openai";


/**
 * AI-based Mapping Suggestions
 * @param sourceFields - CPQ fields [{ name, label, type }]
 * @param targetFields - Revenue Cloud fields [{ name, label, type }]
 */
export async function suggestMappings(sourceFields: any[], targetFields: any[]) {
  const prompt = `
You are an expert Salesforce CPQ → Revenue Cloud migration assistant.

Given:
- Source fields (from CPQ): ${JSON.stringify(sourceFields, null, 2)}
- Target fields (from Revenue Cloud): ${JSON.stringify(targetFields, null, 2)}

Task:
Suggest the best possible field mappings in this JSON format:

[
  {
    "sourceField": "ProductCode",
    "targetField": "ProductCode__c",
    "confidence": 0.92,
    "reason": "Field name + type + label similarity"
  }
]

Rules:
- Confidence is between 0.0 and 1.0
- Only return valid JSON
- No text outside JSON
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",         // fast + cheap + accurate
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
