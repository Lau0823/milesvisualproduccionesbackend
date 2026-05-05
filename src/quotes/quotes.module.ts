import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuotesService } from './quotes.service';
import { QuotesController } from './quotes.controller';
import { QuoteRequest } from './entities/quote.entity';

@Module({
  imports: [TypeOrmModule.forFeature([QuoteRequest])],
  controllers: [QuotesController],
  providers: [QuotesService],
})
export class QuotesModule {}
