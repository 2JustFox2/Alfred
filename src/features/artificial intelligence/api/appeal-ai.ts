import ollama from "ollama/browser";

export async function generate(content: string): Promise<string> {
  const response = await ollama.chat({
    model: 'llama3.1',
    messages: [{ role: 'user', content: content }],
  })
  
  return response.message.content
}