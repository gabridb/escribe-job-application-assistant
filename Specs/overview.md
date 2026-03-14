# Writing Assistant - Project Overview

An **intelligent AI writing assistant** that provides real-time writing help to apply for a new role.

---

## Architecture Foundation

### Split-Screen Layout: The Core Component

**Every screen in the application is built on the same foundational component**: `split-screen-layout`

This reusable frame provides a consistent two-panel structure:
- **Left Slot**: Chat panel for AI interaction
- **Right Slot**: Content panel (editor or wizard)

All modes are variations of this shell, with different content plugged into each slot.

---

## Application Modes

The application has two main modes, both using the split-screen layout foundation:

### 1. Writing Assistant Mode

**Left Panel**: AI chat assistant
**Right Panel**: Text editor (single or multi-tab)

This is the primary mode where users work on their job application materials. It provides an AI-powered writing environment for:
- **Example Writing with STAR Framework**: Craft compelling professional examples
- **CV Review & Tailoring**: Refine and optimize your CV
- **Cover Letter Generation**: Create personalized cover letters
- **General Writing Tasks**: Any other job application writing needs

#### Key Features
- **AI-powered suggestions**: Context-aware improvements based on selected text
- **Change tracking**: Accept/reject AI proposals with inline controls
- **Configurable tabs**: Multiple writing contexts with custom system prompts
- **Real-time collaboration**: AI writes with you, not for you

---

### 2. Job Applications Mode

**Left Panel**: Job-aware AI chat with context from analysis, CV, and examples
**Right Panel**: Wizard interface with step navigation and persistent job summary sidebar

An **AI-powered job analysis and workflow assistant** that helps users organize their job application process across 5 different aspects.

**Note**: This mode uses the same `split-screen-layout` foundation, simply plugging different components into the left and right slots.

#### The 5 Aspects

---

### Job Analysis & Document Collection

**Purpose**: Gather all materials and analyze job requirements

**Components**:
- `job-analysis-container` + `job-analysis-view`

**Features**:

1. **Multi-document upload**:
   - Job posting (PDF, text, .doc, .docx)
   - CV/Resume (PDF with full text extraction)
   - Writing samples (optional)

2. **Intelligent Job Analysis**: AI extracts and structures:
   - Company name & position title
   - Role summary
   - Required skills (vs. nice-to-have)
   - Company values
   - Key responsibilities
   - Salary range, benefits, etc.

**Output**:
- `session.jobAnalysis` - Structured job data
- `session.rawCv` - Full CV text
+
---

### Example Writing with STAR Framework

**Purpose**: Create compelling professional examples using the STAR method

**Components**:
- `example-writing-container` + `example-writing-view`

**Features**:

1. **Rich text editor** for writing professional examples

2. **Skill & responsibility tagging**: Link examples to job requirements

3. **AI STAR Review System**:
   - Submit example for AI analysis
   - Get 4 STAR framework questions:
     - **S**ituation: What was the context?
     - **T**ask: What was your responsibility?
     - **A**ction: What did you do?
     - **R**esult: What was the outcome?
   - Receive AI-generated answers based on your example
   - Get **1-5 star rating** with detailed feedback:
     - Strengths identified
     - Areas for improvement
     - Overall assessment
     - Actionable suggestions

4. **Example Library**:
   - Save reviewed examples for reuse
   - Tag examples (e.g., "leadership", "technical", "teamwork")
   - Load saved examples into current session
   - Delete examples from library

**Output**:
- `session.examples[]` - Array of reviewed, tagged examples
- Library of reusable examples across applications

---

### CV Review & Tailoring

**Purpose**: Analyze CV alignment with job and provide tailoring recommendations

**Components**:
- `cv-review-container` + `cv-review-view`

**Features**:

1. **Auto-triggered AI Analysis**: Runs automatically when entering step

2. **Alignment Score (0-100)**:
   - Circular progress ring visualization
   - Color-coded:
     - 🔴 Red (0-40): "Needs Significant Work"
     - 🟠 Orange (41-70): "Good Foundation"
     - 🟢 Green (71-100): "Strong Match"

3. **Skills Analysis** (Two-column comparison):
   - **Matched Skills** ✓: Green badges showing skills present in CV
   - **Missing Skills** ✗: Red badges showing gaps to address
   - Count summaries: "12 of 15 required skills present"

4. **Three Types of Suggestions**:

   a. **Formatting Suggestions** 🎨
      - Layout, structure, readability improvements
      - Professional presentation tips

   b. **Tailoring Suggestions** ✂️
      - Content changes to better match job
      - Keyword optimization
      - Experience highlighting

   c. **Strategic Recommendations**
      - **Emphasize**: CV sections to highlight (green badges)
      - **De-emphasize**: Sections to minimize (gray badges)

5. **Re-analysis**: "Regenerate Analysis" button for fresh review

**Data Structure**:
```typescript
{
  alignmentScore: 85,
  skillsMatched: ["Python", "AWS", "Docker", ...],
  skillsMissing: ["Kubernetes", "GraphQL", "Redis"],
  formattingSuggestions: ["Use bullet points...", "Add metrics..."],
  tailoringSuggestions: ["Emphasize cloud experience...", "Quantify achievements..."],
  emphasizeSections: ["Technical Skills", "Cloud Projects"],
  deemphasizeSections: ["Unrelated Hobbies"]
}
```

**Output**:
- `session.cvReview` - Complete CV analysis and recommendations

---

### Cover Letter Generation

**Purpose**: Generate personalized cover letter using all gathered context

**Features**:

1. **Example Selection UI**: Choose which examples to feature

2. **AI Cover Letter Generation**:
   - Inputs: Job analysis + CV + selected examples
   - Generates tailored, professional cover letter
   - Highlights relevant skills and experiences
   - Addresses specific job requirements

3. **Iterative Refinement**:
   - Request modifications ("make it more formal", "emphasize leadership")
   - Version history tracking
   - Compare drafts side-by-side

4. **Export Options**:
   - Copy to clipboard
   - Download as .docx or .pdf
   - Plain text export

**Output**:
- `session.coverLetter` - Generated letter with version history

---

## Architecture Patterns

### Container-View Pattern

Every feature follows this pattern:

- **Container** (`*-container.ts`):
  - Business logic
  - Service calls
  - State management
  - Event emission

- **View** (`*-view.ts`):
  - Presentation layer
  - User interactions
  - Props-based rendering
  - Event dispatching

## Core Value Proposition

**"The AI writing assistant that writes with you, not for you."**

An intelligent writing companion that provides contextual suggestions, inline edits, and real-time collaboration. For job applications, it transforms preparation from a scattered, stressful process into a guided, AI-assisted experience that produces polished, tailored materials.

