import { CoverLetterService } from './cover-letter.service';
import { CoverLetter } from './cover-letter.entity';

const makeRepo = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
});

describe('CoverLetterService', () => {
  let service: CoverLetterService;
  let repo: ReturnType<typeof makeRepo>;

  beforeEach(() => {
    repo = makeRepo();
    service = new CoverLetterService(repo as any);
  });

  describe('upsert', () => {
    it('creates a new CoverLetter when no existing record', async () => {
      const newDoc = { id: 'cl-1', jobId: 'job-1', text: 'Hello world' } as CoverLetter;
      repo.findOne.mockResolvedValue(null);
      repo.create.mockReturnValue(newDoc);
      repo.save.mockResolvedValue(newDoc);

      const result = await service.upsert('job-1', 'Hello world');

      expect(repo.create).toHaveBeenCalledWith({ jobId: 'job-1', text: 'Hello world' });
      expect(repo.save).toHaveBeenCalledWith(newDoc);
      expect(result).toEqual(newDoc);
    });

    it('updates text in place when an existing record is found', async () => {
      const existing = { id: 'cl-1', jobId: 'job-1', text: 'Old text' } as CoverLetter;
      const updated = { ...existing, text: 'New text' } as CoverLetter;
      repo.findOne.mockResolvedValue(existing);
      repo.save.mockResolvedValue(updated);

      const result = await service.upsert('job-1', 'New text');

      expect(repo.create).not.toHaveBeenCalled();
      expect(repo.save).toHaveBeenCalledWith({ ...existing, text: 'New text' });
      expect(result).toEqual(updated);
    });
  });

  describe('getByJob', () => {
    it('returns the CoverLetter when a record exists', async () => {
      const doc = { id: 'cl-1', jobId: 'job-1', text: 'Some text' } as CoverLetter;
      repo.findOne.mockResolvedValue(doc);

      const result = await service.getByJob('job-1');

      expect(repo.findOne).toHaveBeenCalledWith({ where: { jobId: 'job-1' } });
      expect(result).toEqual(doc);
    });

    it('returns null when no record exists', async () => {
      repo.findOne.mockResolvedValue(null);

      const result = await service.getByJob('job-1');

      expect(result).toBeNull();
    });
  });
});
