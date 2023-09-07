import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { Restaurant } from "./entities/restaurant.entity";
import { CreateRestaurantDto } from "./dtos/create-restaurant.dto";
import { RestaurantService } from "./restaurant.service";
import { create } from "domain";
import { UpdateRestaurantDto } from "./dtos/update-restaurant.dto";


@Resolver(of => Restaurant)
export class RestaurantResolver {
    constructor(private readonly  restaurantService: RestaurantService)
    {}
    @Query(()=> [Restaurant])
    restaurants(): Promise<Restaurant[]>{
        return this.restaurantService.getAll();
    }

    @Mutation(()=> Boolean)
    async createRestaurnat(
       @Args('input') createRestaurantDto: CreateRestaurantDto
        ): Promise<boolean>{
        try{
            await this.restaurantService.createRestaurant(createRestaurantDto);
            return true;
        }
        catch(e){
            console.log(e)
            return false;
        }
    }

    @Mutation(returns => Boolean)
    async updateRestaurant(@Args('input') updateRestaurantDto: UpdateRestaurantDto) : Promise<Boolean>{
        try{
            await this.restaurantService.updateRestaurant(updateRestaurantDto);
            return true;
        }catch(e)
        {
            console.log(e);
            return false;
        }
    }
}