import { Module } from '@nestjs/common';
import { FeramentasService } from './ferramentas.service';
import { FeramentasController } from './ferramentas.controller';

@Module({
  providers: [FeramentasService],
  controllers: [FeramentasController],
  exports: [FeramentasService],
})
export class FeramentasModule {}
