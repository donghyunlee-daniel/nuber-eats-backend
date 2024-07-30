import { Module } from '@nestjs/common';
import { RestaurantService } from './restaurant.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantResolver } from './restaurant.resolver';
import { CateogryRepository } from './repositories/category.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurant, CateogryRepository])],
  providers: [RestaurantResolver, RestaurantService, CateogryRepository]
})
export class RestaurantModule {}
