import { Module } from '@nestjs/common';
import { RestaurantService } from './restaurant.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { CategoryResolver, DishResolver, RestaurantResolver } from './restaurant.resolver';
import { CateogryRepository } from './repositories/category.repository';
import { Dish } from './entities/dish.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurant, CateogryRepository, Dish])],
  providers: [RestaurantResolver, RestaurantService, CateogryRepository, CategoryResolver, DishResolver]
})
export class RestaurantModule {}
