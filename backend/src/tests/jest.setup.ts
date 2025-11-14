// backend/src/tests/jest.setup.ts

// -----------------------------
// 1️⃣ MOCK POSTGRES POOL
// -----------------------------
// Jest runs setup inside src/tests/
// So db.ts is located at: ../database/db
jest.mock("../database/db", () => ({
  query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
}));


// -----------------------------
// 2️⃣ MOCK OPENAI
// -----------------------------
// utils/openai.ts is located at: ../utils/openai
jest.mock("../utils/openai", () => ({
  openai: {
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: JSON.stringify([
                  {
                    sourceField: "ProductCode",
                    targetField: "ProductCode__c",
                    confidence: 0.95,
                    reason: "Mocked AI response",
                  },
                ]),
              },
            },
          ],
        }),
      },
    },
  },
}));
