import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Job } from '../jobs/job.entity';

@Entity('tailored_cvs')
export class TailoredCv {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  jobId: string;

  @ManyToOne(() => Job, (job) => job.tailoredCvs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'jobId' })
  job: Job;

  @Column('text')
  text: string;

  @UpdateDateColumn()
  updatedAt: Date;
}
