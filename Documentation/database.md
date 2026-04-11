# Database Documentation

Engine: PostgreSQL (via Docker)
ORM: TypeORM 0.3 with `synchronize: true` (schema auto-synced from entities — no migration files)

---

## Connection

| Setting | Default |
|---------|---------|
| Host | `localhost` |
| Port | `5432` |
| Username | `escribe` |
| Password | `escribe` |
| Database | `escribe` |

Configurable via env vars: `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`.

Docker Compose starts the PostgreSQL container. Run `docker compose up -d` before starting the backend.

---

## Tables

### `jobs`

Stores job offers added by the user.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, generated | Primary key |
| `title` | varchar | NOT NULL | Job title (extracted by AI) |
| `company` | varchar | NOT NULL | Company name (extracted by AI) |
| `description` | text | NOT NULL | Full job description pasted by user |
| `status` | varchar | NOT NULL, default `'active'` | `'active'` or `'archived'` |
| `createdAt` | timestamp | NOT NULL, auto | Creation timestamp |

---

### `themes`

Key interview competencies generated per job offer.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, generated | Primary key |
| `jobId` | UUID | NOT NULL, FK → `jobs.id` | Parent job |
| `name` | varchar | NOT NULL | Theme name (e.g. "Leadership") |
| `description` | text | NOT NULL | Interview competency description |
| `status` | varchar | NOT NULL, default `'todo'` | `'todo'`, `'in-progress'`, or `'done'` |

---

### `relevant_experiences`

User-written STAR-format experience stories, one per theme.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, generated | Primary key |
| `themeId` | UUID | NOT NULL, UNIQUE, FK → `themes.id` | Parent theme (one-to-one) |
| `text` | text | NOT NULL | Written experience content |
| `updatedAt` | timestamp | NOT NULL, auto | Last update timestamp |

---

### `tailored_cvs`

Job-specific CV versions, one per job.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, generated | Primary key |
| `jobId` | UUID | NOT NULL, UNIQUE, FK → `jobs.id` | Parent job (one-to-one) |
| `text` | text | NOT NULL | Tailored CV content |
| `updatedAt` | timestamp | NOT NULL, auto | Last update timestamp |

---

### `cv_documents`

Base CV uploaded by the user. Only one row is kept at a time.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, generated | Primary key |
| `name` | varchar | NOT NULL | File name |
| `text` | text | NOT NULL | Extracted CV text |
| `uploadedAt` | timestamp | NOT NULL, auto | Upload timestamp |

The service deletes all existing rows before saving a new one, so this table always has 0 or 1 rows.

---

## Entity Relationships

```
jobs (1) ──────────────── (*) themes
  │                              │
  │  onDelete: CASCADE           │  onDelete: CASCADE
  │                              │
  └──── (1) tailored_cvs         └──── (1) relevant_experiences
             (unique jobId)                   (unique themeId)
```

- Deleting a **job** cascade-deletes its **themes** and **tailored CV**
- Deleting a **theme** cascade-deletes its **relevant experience**
- **cv_documents** is standalone — not related to any other table

---

## TypeORM Entity Definitions

### Job entity (`backend/src/jobs/job.entity.ts`)

```typescript
@Entity('jobs')
class Job {
  @PrimaryGeneratedColumn('uuid') id: string
  @Column() title: string
  @Column() company: string
  @Column('text') description: string
  @Column({ default: 'active' }) status: 'active' | 'archived'
  @CreateDateColumn() createdAt: Date

  @OneToMany(() => Theme, (t) => t.job, { cascade: true })
  themes: Theme[]

  @OneToMany(() => TailoredCv, (t) => t.job, { cascade: true })
  tailoredCvs: TailoredCv[]
}
```

### Theme entity (`backend/src/themes/theme.entity.ts`)

```typescript
@Entity('themes')
class Theme {
  @PrimaryGeneratedColumn('uuid') id: string
  @Column() jobId: string
  @ManyToOne(() => Job, (j) => j.themes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'jobId' }) job: Job
  @Column() name: string
  @Column('text') description: string
  @Column({ default: 'todo' }) status: 'todo' | 'in-progress' | 'done'
}
```

### RelevantExperience entity (`backend/src/relevant-experience/relevant-experience.entity.ts`)

```typescript
@Entity('relevant_experiences')
class RelevantExperience {
  @PrimaryGeneratedColumn('uuid') id: string
  @Column({ unique: true }) themeId: string
  @ManyToOne(() => Theme, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'themeId' }) theme: Theme
  @Column('text') text: string
  @UpdateDateColumn() updatedAt: Date
}
```

### TailoredCv entity (`backend/src/tailored-cv/tailored-cv.entity.ts`)

```typescript
@Entity('tailored_cvs')
class TailoredCv {
  @PrimaryGeneratedColumn('uuid') id: string
  @Column({ unique: true }) jobId: string
  @ManyToOne(() => Job, (j) => j.tailoredCvs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'jobId' }) job: Job
  @Column('text') text: string
  @UpdateDateColumn() updatedAt: Date
}
```

### CvDocument entity (`backend/src/cv/cv.entity.ts`)

```typescript
@Entity('cv_documents')
class CvDocument {
  @PrimaryGeneratedColumn('uuid') id: string
  @Column() name: string
  @Column('text') text: string
  @CreateDateColumn() uploadedAt: Date
}
```

---

## Notes

- No explicit migration files exist — TypeORM's `synchronize: true` auto-applies schema changes on startup. Suitable for development; should be replaced with migrations before any production deployment.
- All primary keys are UUIDs generated by the database.
- Foreign key columns (`jobId`, `themeId`) are stored as plain `varchar(UUID)` columns with `@JoinColumn` mapping. The unique constraints on `tailored_cvs.jobId` and `relevant_experiences.themeId` enforce the one-to-one semantics at the database level.
