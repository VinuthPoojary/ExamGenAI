/**
 * Gemini Question Generator Service
 * Invokes Gemini 1.5 Flash API to compile custom practice tests
 */

const generateQuestions = async (contextText, subject, difficulty, config) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing. Please add your Gemini API Key as GEMINI_API_KEY=your_key inside BACKEND/.env and restart the server.');
  }

  // Cap context text to avoid overloading context limits
  const contextCleaned = contextText ? contextText.substring(0, 40000) : '';

  const prompt = `
You are an expert academic examiner. Your task is to generate high-fidelity, challenging exam questions based on the following subject domain and source material notes.

Subject: ${subject}
Difficulty Level: ${difficulty}
Source Material Context Notes:
${contextCleaned || 'No reference file provided. Generate general knowledge questions based entirely on the subject area.'}

Generate exactly the following quantities of questions:
- MCQ (Multiple Choice): ${config.mcqCount || 0}
- Short Answer: ${config.shortCount || 0}
- Long Answer: ${config.longCount || 0}
- Scenario-Based (Case Study with sub-questions): ${config.scenarioCount || 0}

Ensure the questions are challenging, conceptually accurate, and target critical learning points in the subject domain.

You must return ONLY a valid JSON object. Do not wrap the JSON in markdown code blocks like \`\`\`json. Output only the JSON.

Expected JSON Structure:
{
  "questions": [
    // FOR MCQ QUESTIONS:
    {
      "type": "mcq",
      "questionText": "Question statement here",
      "options": {
        "A": "Option A text",
        "B": "Option B text",
        "C": "Option C text",
        "D": "Option D text"
      },
      "correctAnswer": "A", // Must be A, B, C, or D
      "explanation": "Detailed explanation why this answer is correct",
      "maxMarks": 2,
      "topic": "Subtopic name"
    },
    // FOR SHORT ANSWER QUESTIONS:
    {
      "type": "short",
      "questionText": "Question statement here",
      "modelAnswer": "Brief reference answer here",
      "maxMarks": 5,
      "topic": "Subtopic name"
    },
    // FOR LONG ANSWER QUESTIONS:
    {
      "type": "long",
      "questionText": "Question statement here",
      "modelAnswer": "Detailed reference answer here",
      "maxMarks": 10,
      "topic": "Subtopic name"
    },
    // FOR SCENARIO QUESTIONS:
    {
      "type": "scenario",
      "questionText": "A detailed context/case-study narrative paragraph setting up the scenario.",
      "topic": "Subtopic name",
      "subQuestions": [
        {
          "type": "mcq",
          "questionText": "Sub-question statement related to the scenario",
          "options": {
            "A": "Option A text",
            "B": "Option B text",
            "C": "Option C text",
            "D": "Option D text"
          },
          "correctAnswer": "B",
          "explanation": "Explanation here",
          "maxMarks": 3
        },
        {
          "type": "short",
          "questionText": "Sub-question statement related to the scenario",
          "modelAnswer": "Brief reference answer here",
          "maxMarks": 5
        }
      ]
    }
  ]
}
`;

  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: prompt
          }
        ]
      }
    ],
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.2
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData.error?.message || `HTTP ${response.status} Error`;
      throw new Error(`Gemini API request failed: ${errorMsg}`);
    }

    const resData = await response.json();
    const generatedText = resData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      throw new Error('Gemini API returned an empty response.');
    }

    // Parse output JSON
    let parsedData;
    try {
      parsedData = JSON.parse(generatedText);
    } catch (e) {
      console.error('Failed to parse Gemini output:', generatedText);
      throw new Error('AI returned an invalid JSON response format. Try generating again.');
    }

    if (!parsedData || !Array.isArray(parsedData.questions)) {
      throw new Error('AI response is missing the required "questions" array field.');
    }

    return parsedData.questions;
  } catch (error) {
    console.error('❌ Gemini Generation Error:', error);
    throw error;
  }
};

module.exports = { generateQuestions };
