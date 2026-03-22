import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Theme } from '../themes/theme.entity';

@Entity('relevant_experiences')
export class RelevantExperience {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  themeId: string;

  @ManyToOne(() => Theme, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'themeId' })
  theme: Theme;

  @Column('text')
  text: string;

  @UpdateDateColumn()
  updatedAt: Date;
}
