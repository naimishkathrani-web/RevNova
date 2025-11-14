// backend/src/routes/__tests__/mapping.test.ts
import request from "supertest";
import { app } from "../../index";

// Mock DB
import db from "../../database/db";
jest.mock("../../database/db");

// Mock OpenAI suggestions directly
jest.mock("../../services/ai-mapping.service", () => ({
  suggestMappings: jest.fn().mockResolvedValue([
    {
      sourceField: "ProductCode",
      targetField: "ProductCode__c",
      confidence: 0.92,
      reason: "Mocked AI"
    }
  ])
}));

// Fake 70 mappings
const testMappings = Array.from({ length: 70 }).map((_, i) => ({
  sourceObject: "Product2",
  sourceField: `Field_${i}`,
  targetObject: "Product__c",
  targetField: `Field__c_${i}`,
  mappingType: "direct",
  transformLogic: null
}));

describe("Mapping API", () => {
  beforeEach(() => {
    // Mock DB responses for mapping validation
    (db.query as jest.Mock).mockResolvedValue({
      rows: testMappings,
      rowCount: 70
    });
  });

  test("POST /mappings saves 70+ mappings", async () => {
    const res = await request(app)
      .post("/api/v1/projects/1/mappings")
      .send({ mappings: testMappings });

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(70);
  });

  test("POST /mappings/suggest returns AI suggestions", async () => {
    const res = await request(app)
      .post("/api/v1/projects/1/mappings/suggest");

    expect(res.status).toBe(200);
    expect(res.body.suggestions.length).toBeGreaterThan(0);
  });

  test("POST /mappings/validate detects unmapped required fields", async () => {
    const res = await request(app)
      .post("/api/v1/projects/1/mappings/validate");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.errors)).toBe(true);
  });
});
