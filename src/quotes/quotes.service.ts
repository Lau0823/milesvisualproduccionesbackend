import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuoteRequest } from './entities/quote.entity';

@Injectable()
export class QuotesService {
  constructor(
    @InjectRepository(QuoteRequest)
    private readonly quoteRepository: Repository<QuoteRequest>,
  ) {}

  async create(createQuoteDto: any) {
    const quote = this.quoteRepository.create(createQuoteDto);
    return await this.quoteRepository.save(quote);
  }

  async findAll() {
    return await this.quoteRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    const quote = await this.quoteRepository.findOneBy({ id });
    if (!quote) {
      throw new NotFoundException(`Quote with ID ${id} not found`);
    }
    return quote;
  }

  async update(id: number, updateQuoteDto: any) {
    const quote = await this.findOne(id);
    this.quoteRepository.merge(quote, updateQuoteDto);
    return await this.quoteRepository.save(quote);
  }

  async remove(id: number) {
    const quote = await this.findOne(id);
    return await this.quoteRepository.remove(quote);
  }
}
