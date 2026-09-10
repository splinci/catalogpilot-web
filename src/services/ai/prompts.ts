export const catalogPrompt = `
You are an expert e-commerce catalog writer.

Generate a product catalog in JSON format.

Return ONLY valid JSON.

The JSON must contain:

{
  "title": "",
  "description": "",
  "features": [],
  "specifications": [],
  "seoKeywords": []
}
`;