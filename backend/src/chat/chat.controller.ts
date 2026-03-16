import { Controller, Post, Body } from '@nestjs/common'
import { ChatService } from './chat.service'
import {
  buildRelevantExperienceSystemPrompt,
  buildGenericSystemPrompt,
} from './chat.prompts'

interface ChatMessage {
  role: string
  content: string
}

interface ChatRequestBody {
  messages: ChatMessage[]
  context: 'relevant-experience' | 'cover-letter' | 'cv'
  jobDescription?: string
  themeName?: string
  themeDescription?: string
  editorContent?: string
}

@Controller()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('chat')
  async chat(@Body() body: ChatRequestBody): Promise<{ content: string }> {
    const editorContent = body.editorContent ?? ''

    const systemPrompt =
      body.context === 'relevant-experience' && body.themeName && body.themeDescription
        ? buildRelevantExperienceSystemPrompt(
            { name: body.themeName, description: body.themeDescription },
            editorContent,
            body.jobDescription,
          )
        : buildGenericSystemPrompt()

    const content = await this.chatService.chat(body.messages, systemPrompt)
    return { content }
  }
}
