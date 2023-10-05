import { Module } from '@nestjs/common';
import { RestaurantResolver } from './restaurant.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantService } from './restaurant.service';
import { Category } from './entities/category.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Restaurant,Category])],
    providers:[RestaurantResolver, RestaurantService],
})
export class RestaurantModule {}
