import { GoogleGenAI, Type } from "@google/genai";
import { QuizConfig, QuizQuestion, UserAnswer } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateQuiz = async (config: QuizConfig): Promise<QuizQuestion[]> => {
  const prompt = `
    Generate a ${config.type} quiz about "${config.topic}" with exactly ${config.questionCount} questions.
    Difficulty Level: ${config.difficulty}.
    
    Source Material:
    """
    ${config.content.slice(0, 20000)} 
    """
    
    Instructions:
    1. Create unique, challenging questions based on the provided source material or topic.
    2. Ensure "options" array always contains 4 options for MCQ, or 2 for True/False.
    3. The "correctAnswer" must match exactly one of the strings in "options".
    4. Provide a helpful "explanation" for why the answer is correct.
    5. Return ONLY a JSON array.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.INTEGER },
            question: { type: Type.STRING },
            options: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            },
            correctAnswer: { type: Type.STRING },
            explanation: { type: Type.STRING }
          },
          required: ["id", "question", "options", "correctAnswer", "explanation"]
        }
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");

  try {
    const questions = JSON.parse(text) as QuizQuestion[];
    if (!Array.isArray(questions)) throw new Error("Format error: Not an array");
    return questions.map((q, index) => ({
      ...q,
      id: index + 1
    }));
  } catch (e) {
    console.error("Failed to parse AI response", e);
    throw new Error("Failed to generate valid quiz data. Please try again.");
  }
};

export const generateStudyGuide = async (topic: string, incorrectAnswers: UserAnswer[]): Promise<string> => {
  if (incorrectAnswers.length === 0) return "Great job! You got everything right. No study guide needed.";

  const mistakesContext = incorrectAnswers.map(a => 
    `- Question: "${a.questionText}"\n  User Answered: "${a.selectedOption}"\n  Correct Answer: "${a.correctAnswer}"`
  ).join('\n');

  const prompt = `
    The user took a quiz on "${topic}" and got the following questions wrong:
    
    ${mistakesContext}
    
    Please provide a concise, encouraging, and structured study guide (in Markdown) to help them understand these specific concepts better. 
    
    Format Requirements:
    - Use H3 headers (###) for main concepts.
    - Use bullet points for key details.
    - Use **bold** for important terms.
    - Do NOT use excessive formatting or asterisks like ****.
    - Keep it under 300 words.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
  });

  return response.text || "Unable to generate study guide.";
};