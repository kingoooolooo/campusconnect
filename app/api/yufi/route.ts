import { NextRequest } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { message, history, department } = await request.json()

    if (!message?.trim()) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: `You are Yufi, an AI study assistant for CampusConnect — a college platform. You help students understand academic topics, summarize notes, explain concepts, and provide practice questions.

Your personality:
- Friendly, encouraging, and patient
- Use clear, simple language
- When explaining complex topics, use analogies and examples
- Format responses with markdown for readability
- If a student asks about something outside academics, gently redirect them

${department ? `The student is from the ${department} department.` : ''}

Always respond in markdown format. Use:
- **bold** for key terms
- \`code\` for technical terms
- Code blocks with language tags for code examples
- Bullet points and numbered lists for steps
- Tables when comparing things
- > blockquotes for important notes`,
    })

    // Build conversation history for context
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chatHistory = (history || []).map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }))

    const chat = model.startChat({ history: chatHistory })
    const result = await chat.sendMessageStream(message)

    // Stream the response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text()
            if (text) {
              controller.enqueue(encoder.encode(text))
            }
          }
          controller.close()
        } catch (err) {
          controller.error(err)
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    })

  } catch (err) {
    console.error('Yufi error:', err)
    return new Response(JSON.stringify({ error: 'Yufi encountered an error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
