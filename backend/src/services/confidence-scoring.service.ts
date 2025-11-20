interface FieldMetadata {
  name: string;
  type: string;
  label?: string;
  description?: string;
  length?: number;
  required?: boolean;
  picklistValues?: string[];
  referenceTo?: string[];
}

interface ConfidenceFactors {
  nameSimilarity: number;
  typeCompatibility: number;
  labelSimilarity: number;
  descriptionSimilarity: number;
  requiredFieldMatch: number;
  picklistCompatibility: number;
  relationshipMatch: number;
}

interface ConfidenceResult {
  score: number;
  level: 'high' | 'medium' | 'low';
  factors: ConfidenceFactors;
  warnings: string[];
  recommendations: string[];
}

export class ConfidenceScoringService {
  // Threshold constants
  static readonly HIGH_CONFIDENCE = 85;
  static readonly MEDIUM_CONFIDENCE = 60;
  
  // Weight factors for scoring
  private readonly weights = {
    nameSimilarity: 0.30,
    typeCompatibility: 0.25,
    labelSimilarity: 0.15,
    descriptionSimilarity: 0.10,
    requiredFieldMatch: 0.10,
    picklistCompatibility: 0.05,
    relationshipMatch: 0.05
  };

  /**
   * Calculate comprehensive confidence score for a field mapping
   */
  calculateConfidence(
    sourceField: FieldMetadata,
    targetField: FieldMetadata,
    context?: { aiSuggestion?: boolean; userValidated?: boolean }
  ): ConfidenceResult {
    const factors: ConfidenceFactors = {
      nameSimilarity: this.calculateNameSimilarity(sourceField.name, targetField.name),
      typeCompatibility: this.calculateTypeCompatibility(sourceField.type, targetField.type),
      labelSimilarity: this.calculateStringSimilarity(sourceField.label || '', targetField.label || ''),
      descriptionSimilarity: this.calculateStringSimilarity(
        sourceField.description || '',
        targetField.description || ''
      ),
      requiredFieldMatch: this.calculateRequiredFieldMatch(sourceField, targetField),
      picklistCompatibility: this.calculatePicklistCompatibility(sourceField, targetField),
      relationshipMatch: this.calculateRelationshipMatch(sourceField, targetField)
    };

    // Calculate weighted score
    let score = 0;
    score += factors.nameSimilarity * this.weights.nameSimilarity * 100;
    score += factors.typeCompatibility * this.weights.typeCompatibility * 100;
    score += factors.labelSimilarity * this.weights.labelSimilarity * 100;
    score += factors.descriptionSimilarity * this.weights.descriptionSimilarity * 100;
    score += factors.requiredFieldMatch * this.weights.requiredFieldMatch * 100;
    score += factors.picklistCompatibility * this.weights.picklistCompatibility * 100;
    score += factors.relationshipMatch * this.weights.relationshipMatch * 100;

    // Boost for AI suggestions or user validation
    if (context?.aiSuggestion) score = Math.min(score + 5, 100);
    if (context?.userValidated) score = 100;

    const level = this.getConfidenceLevel(score);
    const warnings = this.generateWarnings(sourceField, targetField, factors);
    const recommendations = this.generateRecommendations(sourceField, targetField, factors);

    return {
      score: Math.round(score * 10) / 10,
      level,
      factors,
      warnings,
      recommendations
    };
  }

  /**
   * Calculate name similarity using multiple algorithms
   */
  private calculateNameSimilarity(name1: string, name2: string): number {
    const n1 = this.normalizeFieldName(name1);
    const n2 = this.normalizeFieldName(name2);

    // Exact match
    if (n1 === n2) return 1.0;

    // One contains the other
    if (n1.includes(n2) || n2.includes(n1)) return 0.85;

    // Levenshtein distance
    const levenshtein = this.levenshteinDistance(n1, n2);
    const maxLength = Math.max(n1.length, n2.length);
    const levenshteinSimilarity = 1 - (levenshtein / maxLength);

    // Jaccard similarity (word tokens)
    const words1 = new Set(n1.split(/[_\s]+/));
    const words2 = new Set(n2.split(/[_\s]+/));
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    const jaccardSimilarity = intersection.size / union.size;

    // Return weighted average
    return (levenshteinSimilarity * 0.6) + (jaccardSimilarity * 0.4);
  }

  /**
   * Calculate type compatibility score
   */
  private calculateTypeCompatibility(sourceType: string, targetType: string): number {
    const s = sourceType.toLowerCase();
    const t = targetType.toLowerCase();

    // Exact match
    if (s === t) return 1.0;

    // Compatible types mapping
    const compatibilityMap: { [key: string]: string[] } = {
      'string': ['text', 'textarea', 'email', 'phone', 'url', 'picklist'],
      'text': ['string', 'textarea', 'email', 'phone', 'url'],
      'integer': ['number', 'double', 'decimal', 'currency', 'percent'],
      'number': ['integer', 'double', 'decimal', 'currency', 'percent'],
      'double': ['number', 'integer', 'decimal', 'currency', 'percent'],
      'decimal': ['number', 'integer', 'double', 'currency', 'percent'],
      'currency': ['number', 'integer', 'double', 'decimal', 'percent'],
      'boolean': ['checkbox'],
      'checkbox': ['boolean'],
      'date': ['datetime'],
      'datetime': ['date'],
      'reference': ['lookup', 'masterdetail'],
      'lookup': ['reference', 'masterdetail'],
      'masterdetail': ['reference', 'lookup']
    };

    // Check if types are compatible
    if (compatibilityMap[s]?.includes(t) || compatibilityMap[t]?.includes(s)) {
      return 0.75;
    }

    // Both are some form of text
    if ((s.includes('text') || s.includes('string')) && (t.includes('text') || t.includes('string'))) {
      return 0.7;
    }

    // Both are numeric
    if (['integer', 'number', 'double', 'decimal', 'currency', 'percent'].includes(s) &&
        ['integer', 'number', 'double', 'decimal', 'currency', 'percent'].includes(t)) {
      return 0.7;
    }

    // Incompatible types
    return 0.2;
  }

  /**
   * Calculate string similarity for labels/descriptions
   */
  private calculateStringSimilarity(str1: string, str2: string): number {
    if (!str1 || !str2) return 0;

    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();

    if (s1 === s2) return 1.0;
    if (s1.includes(s2) || s2.includes(s1)) return 0.8;

    const words1 = new Set(s1.split(/\s+/));
    const words2 = new Set(s2.split(/\s+/));
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size;
  }

  /**
   * Calculate required field match score
   */
  private calculateRequiredFieldMatch(source: FieldMetadata, target: FieldMetadata): number {
    // Both required or both optional
    if (source.required === target.required) return 1.0;

    // Source required but target optional (data loss risk)
    if (source.required && !target.required) return 0.5;

    // Source optional but target required (need default values)
    return 0.3;
  }

  /**
   * Calculate picklist compatibility
   */
  private calculatePicklistCompatibility(source: FieldMetadata, target: FieldMetadata): number {
    if (!source.picklistValues || !target.picklistValues) return 0.5;

    const sourceValues = new Set(source.picklistValues.map(v => v.toLowerCase()));
    const targetValues = new Set(target.picklistValues.map(v => v.toLowerCase()));

    const intersection = new Set([...sourceValues].filter(x => targetValues.has(x)));
    const union = new Set([...sourceValues, ...targetValues]);

    return intersection.size / union.size;
  }

  /**
   * Calculate relationship match score
   */
  private calculateRelationshipMatch(source: FieldMetadata, target: FieldMetadata): number {
    if (!source.referenceTo || !target.referenceTo) return 0.5;

    const sourceRefs = new Set(source.referenceTo.map(r => r.toLowerCase()));
    const targetRefs = new Set(target.referenceTo.map(r => r.toLowerCase()));

    const intersection = new Set([...sourceRefs].filter(x => targetRefs.has(x)));

    if (intersection.size > 0) return 1.0;

    return 0.3;
  }

  /**
   * Get confidence level based on score
   */
  private getConfidenceLevel(score: number): 'high' | 'medium' | 'low' {
    if (score >= ConfidenceScoringService.HIGH_CONFIDENCE) return 'high';
    if (score >= ConfidenceScoringService.MEDIUM_CONFIDENCE) return 'medium';
    return 'low';
  }

  /**
   * Generate warnings based on factors
   */
  private generateWarnings(
    source: FieldMetadata,
    target: FieldMetadata,
    factors: ConfidenceFactors
  ): string[] {
    const warnings: string[] = [];

    if (factors.typeCompatibility < 0.5) {
      warnings.push(`Type mismatch: ${source.type} → ${target.type} may require transformation`);
    }

    if (factors.requiredFieldMatch < 0.5) {
      if (source.required && !target.required) {
        warnings.push('Source field is required but target is optional - data may be lost');
      } else {
        warnings.push('Target field is required but source is optional - default value needed');
      }
    }

    if (factors.picklistCompatibility < 0.5 && source.picklistValues && target.picklistValues) {
      warnings.push('Picklist values have low overlap - value mapping required');
    }

    if (source.length && target.length && source.length > target.length) {
      warnings.push(`Source field length (${source.length}) exceeds target (${target.length}) - truncation risk`);
    }

    return warnings;
  }

  /**
   * Generate recommendations based on factors
   */
  private generateRecommendations(
    source: FieldMetadata,
    target: FieldMetadata,
    factors: ConfidenceFactors
  ): string[] {
    const recommendations: string[] = [];

    if (factors.typeCompatibility < 0.7) {
      recommendations.push('Add data transformation rule to handle type conversion');
    }

    if (factors.picklistCompatibility < 0.8 && source.picklistValues && target.picklistValues) {
      recommendations.push('Create picklist value mapping table');
    }

    if (factors.requiredFieldMatch < 1.0 && !source.required && target.required) {
      recommendations.push('Define default value or validation rule');
    }

    if (factors.nameSimilarity < 0.6) {
      recommendations.push('Verify mapping with business stakeholders');
    }

    return recommendations;
  }

  /**
   * Normalize field name for comparison
   */
  private normalizeFieldName(name: string): string {
    return name
      .toLowerCase()
      .replace(/__c$/, '') // Remove Salesforce custom field suffix
      .replace(/_/g, ' ')
      .trim();
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }
}

export default ConfidenceScoringService;
