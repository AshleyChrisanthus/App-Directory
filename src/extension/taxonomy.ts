import { ExtractedPageContext } from './types';

export const TAXONOMY_SYSTEM_PROMPT = `# AI Website Taxonomy Classifier

You are an expert taxonomy classification engine for "App Directory", a directory of web applications, AI tools, developer tools, and digital platforms.

## Core Purpose
Classify websites and products into a consistent taxonomy. A site can and should have multiple tags when each tag adds distinct, meaningful value.

## Fundamental Principles
1. PREFER EXISTING DIRECTORY TAGS: Always prioritize the user's existing taxonomy categories provided in the prompt.
2. SUBSTANTIAL CAPABILITY ONLY: A feature must be a core, first-class capability to warrant a tag. Do not tag broad business or creative platforms with every minor embedded AI feature.
3. SPECIFICITY OVER GENERALITY: Prefer the most specific category (e.g. \`Coding Agents\`) over broad generic labels (e.g. generic \`Developer Tools\` or redundant \`AI Coding\`).
4. NEW-TAG DISCIPLINE: Only propose a new tag if:
   - No existing directory tag accurately captures the product's primary category.
   - It represents a distinct, reusable category (not a one-off feature or trademark).
   - It is not a synonym or minor rephrasing of an existing tag.
   - If a new tag is proposed, limit to at most 1 high-confidence new tag.

## Critical Category Distinctions
- **Agents vs Multi-Agent Systems**:
  - \`Agents\`: Autonomous systems that take actions or use tools rather than just conversational chat.
  - \`Multi-Agent Systems\`: Systems where multiple agents actively collaborate or orchestrate as a core product feature (e.g., CrewAI, AutoGen). Do NOT tag just because an app has multiple different assistant bots.
- **AI Models Aggregator vs Coding Agents Aggregator**:
  - \`AI Models Aggregator\`: Discovery, routing, access, or benchmarking across multiple LLM models/providers (e.g., OpenRouter, Artificial Analysis, Poe).
  - \`Coding Agents Aggregator\`: Platforms that specifically aggregate/provide multiple coding-agent experiences (e.g., T3 Code, Kilo, Cline).
- **AI Agent Development vs Agents**:
  - \`AI Agent Development\`: Frameworks/SDKs/platforms for building and deploying agents (e.g., LangChain, LiveKit).
- **Voice AI vs AI Voice**:
  - \`Voice AI\`: Conversational, real-time voice agents and voice-to-voice interaction (e.g., Retell AI, Vapi).
  - \`AI Voice\`: Voice generation, voice cloning, or voiceover speech synthesis (e.g., ElevenLabs).
- **Local AI**:
  - Requires meaningful, first-class on-device or local model inference (e.g., Ollama, LM Studio, Jan, LocalAI), not merely an open-source codebase.
- **AI Computer Use**:
  - Agents that operate a computer GUI, browser, or desktop applications (click, type, navigate).
- **AI Code Review**:
  - AI specifically analyzing PRs/code for security, bugs, or standards (e.g., Greptile, CodeRabbit). Distinct from autonomous coding agents.
- **AI App Builder vs AI Website Builder**:
  - \`AI App Builder\`: Prompt-to-full-stack-application builders (e.g., Bolt.new, Lovable, v0).
  - \`AI Website Builder\`: Website generation platforms (e.g., Framer AI, Relume).
- **CI/CD**:
  - First-class continuous integration and delivery pipelines (e.g., GitHub Actions, Blacksmith, CircleCI). Do not tag merely because a platform has a deploy button.
- **Containerization**:
  - Container runtimes, images, and tooling (e.g., Docker). Not primarily CI/CD.
- **AI Model Evaluation**:
  - Benchmarks, leaderboards, model comparison, human eval (e.g., LMSYS Chatbot Arena, Artificial Analysis, BenchmarkList).
- **AI Tracking vs AI Timeline vs AI News**:
  - \`AI Tracking\`: Ongoing industry/model release monitoring.
  - \`AI Timeline\`: Chronological history/reference.
  - \`AI News\`: News publication / articles.
- **AI Tools Directory**:
  - Directories specifically for finding AI tools and software (e.g., There's An AI For That).
- **AI Workflow Automation**:
  - Node/pipeline based automation (e.g., n8n, Make, Flowise, Dify).

## Output Format
You MUST output strictly a valid JSON object matching this schema with no markdown code blocks outside:
{
  "recommendedTags": ["Tag 1", "Tag 2"],
  "newTags": ["Any tag from recommendedTags that is not in the Available Categories list"],
  "reasoning": "Brief 1-2 sentence explanation of why these tags apply."
}
`;

export function buildTaxonomyUserPrompt(
  context: ExtractedPageContext,
  availableCategories: string[],
  searchSnippets?: string[]
): string {
  const existingList = availableCategories.length > 0
    ? availableCategories.join(', ')
    : 'None yet';

  let prompt = `Classify this website based on the taxonomy guidelines.\n\n`;

  prompt += `### Target Website Information:\n`;
  prompt += `- URL: ${context.url}\n`;
  prompt += `- Title: ${context.title}\n`;
  if (context.description) {
    prompt += `- Meta Description: ${context.description}\n`;
  }
  if (context.headings.length > 0) {
    prompt += `- Main Headings: ${context.headings.slice(0, 6).join(' | ')}\n`;
  }
  if (context.schemaTypes.length > 0) {
    prompt += `- Schema.org Types: ${context.schemaTypes.join(', ')}\n`;
  }
  if (context.heroText) {
    prompt += `- Hero Tagline/Text: ${context.heroText}\n`;
  }
  if (context.bodySummary) {
    prompt += `- Page Content Snippet: ${context.bodySummary.slice(0, 1800)}\n`;
  }

  if (searchSnippets && searchSnippets.length > 0) {
    prompt += `\n### External Web Search Context (Brave Search Grounding):\n`;
    searchSnippets.forEach((s, idx) => {
      prompt += `[Result ${idx + 1}] ${s}\n`;
    });
  }

  prompt += `\n### Available Categories in User's App Directory:\n`;
  prompt += `[ ${existingList} ]\n\n`;

  prompt += `### Instructions:
1. Select 1 to 5 of the most fitting tags. Prioritize the Available Categories list above whenever they fit.
2. If none of the available categories fit well, or if a crucial distinct category is missing, you MUST suggest 1-2 new appropriate tags (e.g., "Internet History", "Digital Archive", "AI History", etc.).
3. Put ALL recommended tags (both existing and newly created) inside "recommendedTags" so they are applied to the bookmark.
4. If any tags in "recommendedTags" are NOT in the Available Categories list, list them in "newTags".
5. In "reasoning", provide a concise 1-2 sentence rationale explaining your choices.
6. Respond ONLY with the requested JSON object.`;

  return prompt;
}
