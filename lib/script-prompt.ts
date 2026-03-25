/**
 * Shared prompt builder for video script generation.
 * Target: 60-90 second video that covers the COMPLETE article concisely.
 */
export function buildScriptPrompt(
  title: string,
  body: string,
  language: string,
  languageName: string
): string {
  const isEnglish = language === "en";
  const lang = isEnglish ? "English" : languageName;

  const subtitleInstruction = isEnglish
    ? ""
    : `
IMPORTANT — ENGLISH SUBTITLES (MANDATORY for every scene):
- Every single scene MUST have a "subtitle" field containing an English translation.
- The subtitle is a SHORT English summary of the narration (1-2 sentences, max 100 characters total).
- NOT a literal translation — rephrase naturally in simple English.
- Example: if narration is "RBI ने रेपो रेट 6.5% पर बरकरार रखा", subtitle should be "RBI keeps repo rate unchanged at 6.5%"
- DO NOT skip the subtitle field on ANY scene. Every scene must have it.`;

  const subtitleJsonExample = isEnglish
    ? ""
    : `, "subtitle": "English subtitle text for this scene"`;

  return `You are a news video scriptwriter. Convert this article into a 60-90 second video script that covers EVERY key point.

ARTICLE:
${title}

${body}

${
  isEnglish
    ? "Write in English. Conversational tone, like an anchor explaining to a friend."
    : `Write ENTIRELY in ${languageName} (${language} script, not transliteration). Keep English terms where natural (GDP, Sensex, company names). Tone: confident ${languageName} news explainer.`
}
${subtitleInstruction}

VISUALS:
- Each scene MUST include a "visual" field: pick the most relevant animated illustration for that scene's content.
- Available visuals: "rupee" (currency/finance/budget), "market" (stocks/trading/sensex), "bank" (RBI/monetary policy/banking), "growth" (startups/funding/expansion), "tech" (AI/digital/IT), "energy" (EV/solar/green energy), "industry" (manufacturing/production), "trade" (exports/imports/international), "people" (employment/workforce/social), "realestate" (property/infrastructure/construction), "agriculture" (farming/food/rural), "health" (healthcare/pharma), "education" (policy/knowledge/skilling).
- Pick the visual that best matches the CONTENT of each specific scene, not the overall article. Different scenes can have different visuals.

RULES:
- Total video: 60-90 seconds. 6-8 scenes, each 8-12 seconds.
- Cover the COMPLETE article: every key fact, every number, every name, every cause/effect. Miss nothing.
- Narration per scene: 2-3 tight sentences. No filler ("Let's see", "As we know"). Every word carries information.
- Pack multiple facts into each sentence: "RBI held repo rate at 6.5% for the 8th time, citing 5.4% inflation — above its 4% target" = 4 facts in 1 sentence.
- On-screen text ("text"): 5-10 word punchy headline, different angle from narration.
- Be specific: "EMI on ₹50L loan up ₹1,500/month" not "borrowers will be affected".
- Data "value" must use Arabic numerals: "₹2.5 Lakh Crore", "6.5%", not Devanagari digits.
- chartType: "pie" (share/split), "bar3d" (comparison), "radar" (multi-metric), "bar" (ranking), "number" (single stat). Only use data scenes when article has real numbers. items: 3-5 short-named entries.
- Every scene MUST include "visual" field.${isEnglish ? "" : '\n- Every scene MUST include "subtitle" field (English translation, max 100 chars).'}

STRUCTURE:
1. title — Hook with the most impactful fact
2. narration — Full context: who, what, when, why (pack it dense)
3. data — Key number + chart with real data from article
4. narration — Analysis/causes/implications (the "why" behind the news)
5. data — Comparison or breakdown with different chart type
6. narration — Impact on common person OR what's next (be concrete)
7. outro — One-line takeaway

Add a quote scene if the article has a notable quote. Add/remove scenes to fit 60-90 seconds — the constraint is total duration, not scene count.

JSON format:
{
  "title": "Video title in ${lang}",
  "scenes": [
    {"type": "title", "text": "Hook headline", "narration": "2-3 sentence hook"${subtitleJsonExample}, "visual": "market", "duration": 8},
    {"type": "narration", "text": "Context headline", "narration": "2-3 dense sentences covering full context"${subtitleJsonExample}, "visual": "bank", "duration": 12},
    {"type": "data", "text": "Data headline", "narration": "2-3 sentences explaining the number"${subtitleJsonExample}, "visual": "rupee", "data": {"label": "Label", "value": "₹X Crore", "change": "+5%", "chartType": "bar3d", "items": [{"name": "A", "value": 80}, {"name": "B", "value": 60}]}, "duration": 12},
    {"type": "narration", "text": "Why headline", "narration": "2-3 sentences on causes/analysis"${subtitleJsonExample}, "visual": "trade", "duration": 12},
    {"type": "data", "text": "Breakdown headline", "narration": "2-3 sentences on the comparison"${subtitleJsonExample}, "visual": "industry", "data": {"label": "Label", "value": "Y%", "change": "", "chartType": "pie", "items": [{"name": "X", "value": 45}, {"name": "Y", "value": 30}]}, "duration": 12},
    {"type": "narration", "text": "Impact headline", "narration": "2-3 sentences on real-world impact"${subtitleJsonExample}, "visual": "people", "duration": 12},
    {"type": "outro", "text": "Takeaway line", "narration": "1-2 sentence closing"${subtitleJsonExample}, "visual": "growth", "duration": 8}
  ]
}

Return ONLY valid JSON.`;
}
