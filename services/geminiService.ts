
import { GoogleGenAI, Type } from "@google/genai";
import { Task } from "../types";

// Always use process.env.API_KEY directly as per guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Sugere uma otimização para uma tarefa específica baseada em seu título e descrição.
 */
export const suggestTaskOptimization = async (task: Task): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Forneça uma dica de otimização de 2 frases para esta tarefa: "${task.title} - ${task.description}". Foque em eficiência ou clareza. Responda em Português do Brasil.`,
  });
  // Property access .text directly to extract content as per guidelines.
  return response.text || "Sem sugestões disponíveis no momento.";
};

/**
 * Decompõe um objetivo de projeto em uma lista de tarefas menores e acionáveis.
 */
export const decomposeGoalIntoTasks = async (goal: string): Promise<any[]> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Decomponha o seguinte objetivo em uma lista de tarefas técnicas e acionáveis: "${goal}". Responda em Português do Brasil.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: 'O título curto e acionável da tarefa.',
            },
            description: {
              type: Type.STRING,
              description: 'Uma descrição detalhada do que deve ser feito.',
            },
            priority: {
              type: Type.STRING,
              description: 'A prioridade da tarefa: Baixa, Média, Alta ou Crítica.',
            },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Lista de tags relevantes.',
            },
          },
          required: ["title", "description", "priority", "tags"],
          propertyOrdering: ["title", "description", "priority", "tags"],
        },
      },
    },
  });

  const jsonStr = response.text?.trim() || '[]';
  try {
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Erro ao converter resposta da IA para JSON:", error);
    return [];
  }
};
