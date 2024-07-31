import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { Restaurant } from "../entities/restaurant.entity";
import { CoreOutput } from "src/common/dtos/output.dto";

@InputType()
export class DeleteRestaurantInput{
    @Field(type => Number)
    restaurantId: number;
}


@ObjectType()
export class DeleteRestaurantOutput extends CoreOutput{}