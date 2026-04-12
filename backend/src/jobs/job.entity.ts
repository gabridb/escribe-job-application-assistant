import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, OneToOne } from 'typeorm';
import { Theme } from '../themes/theme.entity';
import { TailoredCv } from '../tailored-cv/tailored-cv.entity';
import { CoverLetter } from '../cover-letter/cover-letter.entity';

@Entity('jobs')
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  company: string;

  @Column('text')
  description: string;

  @Column({ default: 'active' })
  status: 'active' | 'archived';

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Theme, (theme) => theme.job, { cascade: true })
  themes: Theme[];

  @OneToOne(() => TailoredCv, (tailoredCv) => tailoredCv.job, { cascade: true })
  tailoredCv: TailoredCv;

  @OneToOne(() => CoverLetter, (coverLetter) => coverLetter.job, { cascade: true })
  coverLetter: CoverLetter;
}
