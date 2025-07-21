import ollama from "ollama/browser";

export async function generate(content: string, setOutputValue: React.Dispatch<React.SetStateAction<string>>) {
  const promt = 'Пиши на русском. Пиши очень кратко, максимум 25 слов. \n'
  const response = await ollama.chat({
    model: 'llama3',
    messages: [{ role: 'user', content: content +  promt}],
    stream: true 
  })

  let outputValue = ''
  for await (const part of response) {
    outputValue += part.message.content
    setOutputValue(outputValue)
  }

  return outputValue
}