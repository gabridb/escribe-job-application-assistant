import { Controller, Get, Post, Delete, Body } from '@nestjs/common';
import { CvService } from './cv.service';

@Controller('cv')
export class CvController {
  constructor(private readonly cvService: CvService) {}

  @Get()
  get() {
    return this.cvService.get();
  }

  @Post()
  save(@Body('name') name: string, @Body('text') text: string) {
    return this.cvService.save(name, text);
  }

  @Delete()
  remove() {
    return this.cvService.remove();
  }
}
