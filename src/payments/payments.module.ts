import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { PaymentResolver } from './payments.resolver';
import { PaymentService } from './payments.service';
import { Restaurant } from 'src/restaurant/entities/restaurant.entity';

@Module({
    imports:[TypeOrmModule.forFeature([Payment, Restaurant])],
    providers: [PaymentResolver, PaymentService]
})
export class PaymentsModule {}
