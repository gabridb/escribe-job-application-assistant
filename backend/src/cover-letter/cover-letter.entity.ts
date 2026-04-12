import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { Job } from '../jobs/job.entity';

@Entity('cover_letters')
export class CoverLetter {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  jobId: string;

  @OneToOne(() => Job, (job) => job.coverLetter, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'jobId' })
  job: Job;

  @Column('text')
  text: string;

  @UpdateDateColumn()
  updatedAt: Date;
}
