import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { Restaurant } from "./entities/restaurant.entity";
import { CreateRestaurantDto } from "./dtos/create-restaurant.dto";


@Resolver(of => Restaurant)
export class RestaurantResolver {
    @Query(()=> [Restaurant])
    restaurants(@Args('veganOnly') veganOnly: boolean): Restaurant[]{
        console.log(veganOnly);
        return [];
    }

    @Mutation(()=> Boolean)
    createRestaurnat(
       @Args() createRestaurantDto: CreateRestaurantDto
        ): boolean{
            console.log(createRestaurantDto);
        return true;
    }
}