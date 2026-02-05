
import { GoogleGenAI, Type } from "@google/genai";
import { Task } from "../types";

// Helper para validar o ambiente
const getApiKey = () => {
  const key = process.env.API_KEY;
  // Verifica se é nulo, undefined ou string vazia
  if (!key || key.trim() === '') {
    throw new Error(
      "API KEY AUSENTE: Abra o arquivo 'index.html' e cole sua chave do Google Gemini na variável 'API_KEY' dentro do script 'window.process'."
    );
  }
  return key;
};

// Instanciação segura ou adiada
const createAI = () => {
  try {
    const key = getApiKey();
    return new GoogleGenAI({ apiKey: key });
  } catch (e) {
    // Retorna null se não tiver chave, o erro será lançado na chamada da função
    return null;
  }
};

const ai = createAI();

/**
 * Sugere uma otimização para uma tarefa específica baseada em seu título e descrição.
 */
export const suggestTaskOptimization = async (task: Task): Promise<string> => {
  try {
    if (!ai) getApiKey(); // Força o erro se ai for null

    const response = await ai!.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Forneça uma dica de otimização de 2 frases para esta tarefa: "${task.title} - ${task.description}". Foque em eficiência ou clareza. Responda em Português do Brasil.`,
    });
    return response.text || "Sem sugestões disponíveis no momento.";
  } catch (error: any) {
    console.error("Erro na IA:", error);
    if (error.message.includes("API KEY AUSENTE")) {
      return "⚠️ " + error.message;
    }
    return "Não foi possível conectar à IA. Verifique sua chave de API.";
  }
};

/**
 * Decompõe um objetivo de projeto em uma lista de tarefas menores e acionáveis.
 */
export const decomposeGoalIntoTasks = async (goal: string): Promise<any[]> => {
  try {
    if (!ai) getApiKey(); // Força o erro explicativo se a chave não existir

    const response = await ai!.models.generateContent({
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
    return JSON.parse(jsonStr);
  } catch (error: any) {
    console.error("Erro crítico na IA:", error);
    // Repassa o erro com a mensagem clara para o componente exibir
    throw error;
  }
};
