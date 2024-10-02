import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { CreatePaymentInput, CreatePaymentOutput } from './dtos/create-payment.dto';
import { Restaurant } from 'src/restaurant/entities/restaurant.entity';
import { GetPaymentsOutput } from './dtos/get-payments.dto';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment) private readonly payments: Repository<Payment>,
    @InjectRepository(Restaurant) private readonly restaurants: Repository<Restaurant>,
  ) {}

  async createPayment(owner: User, {transactionId, restaurantId}: CreatePaymentInput) : Promise<CreatePaymentOutput>{
    try{
        const restaurant = await this.restaurants.findOne({where: {id: restaurantId}});
        if(!restaurant){
            return{
                ok:false,
                error: 'Restaurant Not Found'
            }
        }
        if(restaurant.ownerId !== owner.id){
            return{
                ok: false,
                error: 'You are not allowed to do this.'
            }
        }
        
        await this.payments.save(this.payments.create({
            transactionId,
            user: owner,
            restaurant,
        }))
        return{
            ok: true
        }
    }catch{
        return{
            ok: false,
            error: 'Could not create a payment'
        }
    }
  }

  async getPayments(user: User) : Promise<GetPaymentsOutput>{
    try{
        const payments = await  this.payments.find({where: { user: {id : user.id}}})
        return{
            ok: true,
            payments
        }
    }
    catch{
        return{
            ok: false,
            error: 'Could not get payments'
        }
    }
  }
}
