import { Module } from '@nestjs/common';
import { CategoryResolver, RestaurantResolver } from './restaurant.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantService } from './restaurant.service';
import { CategoryRepository } from './repositories/category.repository';

@Module({
    imports: [TypeOrmModule.forFeature([Restaurant,CategoryRepository])],
    providers:[RestaurantResolver, RestaurantService,CategoryRepository,CategoryResolver],
})
export class RestaurantModule {}
