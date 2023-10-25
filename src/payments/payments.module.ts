import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { Restaurant } from 'src/restaurant/entities/restaurant.entity';
import { PaymentService } from './payments.service';
import { PaymentResolver } from './payments.resolver';

@Module({
    imports: [TypeOrmModule.forFeature([Payment, Restaurant])],
    providers: [PaymentService, PaymentResolver]
    
})
export class PaymentsModule {}
