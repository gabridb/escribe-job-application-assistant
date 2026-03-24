import { Controller, Post, Body } from '@nestjs/common'
import { ChatService } from './chat.service'
import { buildGenericSystemPrompt, buildCvSystemPrompt, GENERIC_MODEL } from './chat.prompts'
import {
  buildRelevantExperienceSystemPrompt,
  RELEVANT_EXPERIENCE_MODEL,
} from '../relevant-experience/relevant-experience.prompts'

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
  baseCvText?: string
}

@Controller()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('chat')
  async chat(@Body() body: ChatRequestBody): Promise<{ content: string }> {
    const editorContent = body.editorContent ?? ''

    const { systemPrompt, model } =
      body.context === 'relevant-experience' && body.themeName && body.themeDescription
        ? {
            systemPrompt: buildRelevantExperienceSystemPrompt(
              { name: body.themeName, description: body.themeDescription },
              editorContent,
              body.jobDescription,
            ),
            model: RELEVANT_EXPERIENCE_MODEL,
          }
        : body.context === 'cv'
          ? {
              systemPrompt: buildCvSystemPrompt(body.baseCvText, body.jobDescription),
              model: GENERIC_MODEL,
            }
          : {
              systemPrompt: buildGenericSystemPrompt(),
              model: GENERIC_MODEL,
            }

    const content = await this.chatService.chat(body.messages, systemPrompt, model)
    return { content }
  }
}
