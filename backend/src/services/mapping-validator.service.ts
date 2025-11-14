// backend/src/services/mapping-validator.service.ts

// --------------------------------------------------------------
// TYPE COMPATIBILITY RULES
// --------------------------------------------------------------
const TYPE_COMPATIBILITY: Record<string, string[]> = {
  string: ["string", "text", "textarea", "url", "email"],
  number: ["double", "int", "currency", "percent", "number"],
  boolean: ["boolean", "checkbox"],
  date: ["date", "datetime"]
};

// --------------------------------------------------------------
// Helper: Check if two field types are compatible
// --------------------------------------------------------------
export function isTypeCompatible(sourceType: string, targetType: string): boolean {
  if (!sourceType || !targetType) return true; // skip empty types

  const normalizedSource = sourceType.toLowerCase();
  const normalizedTarget = targetType.toLowerCase();

  // Find which group sourceType belongs to
  for (const group in TYPE_COMPATIBILITY) {
    if (TYPE_COMPATIBILITY[group].includes(normalizedSource)) {
      return TYPE_COMPATIBILITY[group].includes(normalizedTarget);
    }
  }

  // If unknown type, allow but warn
  return true;
}

// --------------------------------------------------------------
// Main Validator: Check mapping compatibility & potential issues
// --------------------------------------------------------------
export function validateMapping(sourceField: any, targetField: any) {
  const warnings: string[] = [];

  if (!sourceField || !targetField) {
    warnings.push("Invalid mapping: missing source or target field.");
    return warnings;
  }

  // 1️⃣ Type mismatch check
  if (!isTypeCompatible(sourceField.type, targetField.type)) {
    warnings.push(`Type mismatch: ${sourceField.type} → ${targetField.type}`);
  }

  // 2️⃣ Required field check
  if (targetField.required && !sourceField.value) {
    warnings.push(`Required field "${targetField.name}" has no source value mapped.`);
  }

  // 3️⃣ Name similarity check (optional but helpful)
  if (
    sourceField.name &&
    targetField.name &&
    sourceField.name.toLowerCase() !== targetField.name.toLowerCase()
  ) {
    // Example: ProductCode vs ItemCode
    // Not an error, but can warn
    // warnings.push(`Possible mismatch: "${sourceField.name}" → "${targetField.name}"`);
  }

  return warnings;
}
