import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation, ReservationStatus } from './entities/reservation.entity';
import { MailService } from '../common/mail/mail.service';
import { GoogleCalendarService } from '../google-calendar/google-calendar.service';

@Injectable()
export class ReservationsService {
  private readonly logger = new Logger(ReservationsService.name);

  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    private readonly mailService: MailService,
    private readonly googleCalendarService: GoogleCalendarService,
  ) {}

  async create(createReservationDto: Partial<Reservation>) {
    const reservation = this.reservationRepository.create(createReservationDto);
    const saved = await this.reservationRepository.save(reservation);

    if (saved.status === ReservationStatus.CONFIRMED) {
      await this.processConfirmedReservation(saved);
    }

    return saved;
  }

  async findAll() {
    return await this.reservationRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    const reservation = await this.reservationRepository.findOneBy({ id });
    if (!reservation) {
      throw new NotFoundException(`Reservation with ID ${id} not found`);
    }
    return reservation;
  }

  async update(id: number, updateReservationDto: Partial<Reservation>) {
    const oldReservation = await this.findOne(id);
    const updated = await this.reservationRepository.save({
      ...oldReservation,
      ...updateReservationDto,
    });

    // Si el estado cambió a 'confirmed' en esta actualización
    if (oldReservation.status !== ReservationStatus.CONFIRMED && updated.status === ReservationStatus.CONFIRMED) {
      await this.processConfirmedReservation(updated);
    }

    return updated;
  }

  async remove(id: number) {
    const reservation = await this.findOne(id);
    return await this.reservationRepository.remove(reservation);
  }

  private async processConfirmedReservation(reservation: Reservation) {
    try {
      // 1. Enviar Email (si tiene email)
      if (reservation.email) {
        await this.mailService.sendReservationConfirmation(
          reservation.email,
          reservation.clientName,
          reservation.serviceType,
          reservation.eventDate || 'Fecha por confirmar',
          reservation.time,
        );
      }

      // 2. Sincronizar con Google Calendar
      try {
        const googleEvent = await this.googleCalendarService.createEvent(reservation);
        if (googleEvent && googleEvent.id) {
          // Usamos una actualización directa para evitar loops
          await this.reservationRepository.createQueryBuilder()
            .update(Reservation)
            .set({ googleEventId: googleEvent.id })
            .where("id = :id", { id: reservation.id })
            .execute();
        }
      } catch (calError) {
        this.logger.warn(`No se pudo sincronizar con Google Calendar: ${calError.message}`);
      }
    } catch (error) {
      this.logger.error(`Error procesando confirmación de reserva: ${error.message}`);
    }
  }
}
