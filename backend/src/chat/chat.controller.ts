import { Controller, Post, Body } from '@nestjs/common'
import { ChatService } from './chat.service'
import { buildGenericSystemPrompt, GENERIC_MODEL } from './chat.prompts'
import {
  buildRelevantExperienceSystemPrompt,
  RELEVANT_EXPERIENCE_MODEL,
} from '../relevant-experience/relevant-experience.prompts'
import { buildCoverLetterSystemPrompt, RelevantExperienceEntry } from '../cover-letter/cover-letter.prompts'
import { buildTailoredCvSystemPrompt } from '../tailored-cv/tailored-cv.prompts'

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
  relevantExperiences?: RelevantExperienceEntry[]
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
              systemPrompt: buildTailoredCvSystemPrompt(
                body.baseCvText,
                body.jobDescription,
                body.relevantExperiences,
                editorContent,
              ),
              model: GENERIC_MODEL,
            }
          : body.context === 'cover-letter'
            ? {
                systemPrompt: buildCoverLetterSystemPrompt(body.baseCvText, body.jobDescription, body.relevantExperiences, editorContent),
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
