import axios from 'axios';

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

interface MappingSuggestion {
  sourceField: string;
  targetField: string;
  confidence: number;
  reasoning: string;
  transformationRequired: boolean;
  suggestedTransform?: string;
}

interface AIConfig {
  provider: 'openai' | 'claude';
  apiKey: string;
  model?: string;
  maxTokens?: number;
}

export class AIMappingService {
  private config: AIConfig;

  constructor(config: AIConfig) {
    this.config = {
      ...config,
      model: config.model || (config.provider === 'openai' ? 'gpt-4' : 'claude-3-sonnet-20240229'),
      maxTokens: config.maxTokens || 2000
    };
  }

  /**
   * Generate AI-powered field mapping suggestions
   */
  async generateMappingSuggestions(
    sourceFields: FieldMetadata[],
    targetFields: FieldMetadata[],
    context?: { sourceSystem: string; targetSystem: string; objectType?: string }
  ): Promise<MappingSuggestion[]> {
    try {
      const prompt = this.buildMappingPrompt(sourceFields, targetFields, context);
      const aiResponse = await this.callAI(prompt);
      return this.parseMappingResponse(aiResponse);
    } catch (error: any) {
      console.error('Error generating mapping suggestions:', error);
      throw new Error(`AI mapping failed: ${error.message}`);
    }
  }

  /**
   * Analyze a single field mapping and provide confidence score
   */
  async analyzeMapping(
    sourceField: FieldMetadata,
    targetField: FieldMetadata,
    context?: any
  ): Promise<{ confidence: number; reasoning: string; warnings: string[] }> {
    try {
      const prompt = `Analyze this field mapping and provide a confidence score (0-100) and reasoning:

Source Field:
- Name: ${sourceField.name}
- Type: ${sourceField.type}
- Label: ${sourceField.label || 'N/A'}
- Description: ${sourceField.description || 'N/A'}

Target Field:
- Name: ${targetField.name}
- Type: ${targetField.type}
- Label: ${targetField.label || 'N/A'}
- Description: ${targetField.description || 'N/A'}

Context: ${JSON.stringify(context || {})}

Respond in JSON format:
{
  "confidence": <number 0-100>,
  "reasoning": "<explanation>",
  "warnings": ["<warning1>", "<warning2>"]
}`;

      const aiResponse = await this.callAI(prompt);
      return JSON.parse(aiResponse);
    } catch (error: any) {
      console.error('Error analyzing mapping:', error);
      return {
        confidence: 0,
        reasoning: `Analysis failed: ${error.message}`,
        warnings: ['AI analysis unavailable']
      };
    }
  }

  /**
   * Suggest transformation rules for incompatible field types
   */
  async suggestTransformation(
    sourceField: FieldMetadata,
    targetField: FieldMetadata
  ): Promise<string | null> {
    try {
      const prompt = `Suggest a transformation rule to convert data from source to target field:

Source: ${sourceField.name} (${sourceField.type})
Target: ${targetField.name} (${targetField.type})

${sourceField.picklistValues ? `Source picklist values: ${sourceField.picklistValues.join(', ')}` : ''}
${targetField.picklistValues ? `Target picklist values: ${targetField.picklistValues.join(', ')}` : ''}

Provide a concise transformation rule as a single line string. If no transformation needed, respond with "NONE".`;

      const aiResponse = await this.callAI(prompt);
      return aiResponse.trim() === 'NONE' ? null : aiResponse.trim();
    } catch (error: any) {
      console.error('Error suggesting transformation:', error);
      return null;
    }
  }

  /**
   * Build the prompt for field mapping
   */
  private buildMappingPrompt(
    sourceFields: FieldMetadata[],
    targetFields: FieldMetadata[],
    context?: any
  ): string {
    return `You are a Salesforce CPQ to RCA migration expert. Analyze these fields and suggest mappings.

Source System: ${context?.sourceSystem || 'CPQ'}
Target System: ${context?.targetSystem || 'RCA'}
${context?.objectType ? `Object Type: ${context.objectType}` : ''}

Source Fields:
${sourceFields.map(f => `- ${f.name} (${f.type}): ${f.label || ''} ${f.description ? '- ' + f.description : ''}`).join('\n')}

Target Fields:
${targetFields.map(f => `- ${f.name} (${f.type}): ${f.label || ''} ${f.description ? '- ' + f.description : ''}`).join('\n')}

Provide mapping suggestions in JSON format:
[
  {
    "sourceField": "<source_field_name>",
    "targetField": "<target_field_name>",
    "confidence": <0-100>,
    "reasoning": "<why this mapping makes sense>",
    "transformationRequired": <true|false>,
    "suggestedTransform": "<transformation rule if needed>"
  }
]

Only suggest mappings with confidence >= 60. Consider:
1. Field name similarity
2. Data type compatibility
3. Business logic (e.g., CPQ Product → RCA Catalog Item)
4. Field descriptions and labels
5. Relationship fields and references`;
  }

  /**
   * Call the AI provider (OpenAI or Claude)
   */
  private async callAI(prompt: string): Promise<string> {
    if (this.config.provider === 'openai') {
      return await this.callOpenAI(prompt);
    } else {
      return await this.callClaude(prompt);
    }
  }

  /**
   * Call OpenAI API
   */
  private async callOpenAI(prompt: string): Promise<string> {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: this.config.model,
          messages: [
            {
              role: 'system',
              content: 'You are a Salesforce migration expert specializing in CPQ to RCA transformations.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: this.config.maxTokens,
          temperature: 0.3
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0].message.content;
    } catch (error: any) {
      throw new Error(`OpenAI API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Call Claude API
   */
  private async callClaude(prompt: string): Promise<string> {
    try {
      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: this.config.model,
          max_tokens: this.config.maxTokens,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          system: 'You are a Salesforce migration expert specializing in CPQ to RCA transformations.'
        },
        {
          headers: {
            'x-api-key': this.config.apiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.content[0].text;
    } catch (error: any) {
      throw new Error(`Claude API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Parse AI response into structured suggestions
   */
  private parseMappingResponse(aiResponse: string): MappingSuggestion[] {
    try {
      // Try to extract JSON from response (AI might include markdown)
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON array found in AI response');
      }

      const suggestions: MappingSuggestion[] = JSON.parse(jsonMatch[0]);

      // Validate and normalize suggestions
      return suggestions.map(s => ({
        sourceField: s.sourceField,
        targetField: s.targetField,
        confidence: Math.min(Math.max(s.confidence, 0), 100),
        reasoning: s.reasoning || 'No reasoning provided',
        transformationRequired: s.transformationRequired || false,
        suggestedTransform: s.suggestedTransform || undefined
      }));
    } catch (error: any) {
      console.error('Error parsing AI response:', error);
      console.error('AI Response:', aiResponse);
      return [];
    }
  }

  /**
   * Get AI configuration for service initialization
   */
  static getConfigFromEnv(): AIConfig | null {
    const provider = (process.env.AI_PROVIDER as 'openai' | 'claude') || 'openai';
    const apiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      console.warn('No AI API key found in environment variables');
      return null;
    }

    return {
      provider,
      apiKey,
      model: process.env.AI_MODEL,
      maxTokens: process.env.AI_MAX_TOKENS ? parseInt(process.env.AI_MAX_TOKENS) : undefined
    };
  }
}

export default AIMappingService;
