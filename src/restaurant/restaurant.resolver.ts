import { Args, Int, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantService } from './restaurant.service';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create-restaurant.dto';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { User, UserRole } from 'src/users/entities/user.entity';
import { Role } from 'src/auth/role.decorator';
import {
  EditRestaurantInput,
  EditRestaurantOutput,
} from './dtos/edit-restaurant.dto';
import {
  DeleteRestaurantInput,
  DeleteRestaurantOutput,
} from './dtos/delete-restaurant.dto';
import { Category } from './entities/category.entity';
import { AllCategoriesOutput } from './dtos/all-cateogories.dto';

@Resolver((of) => Restaurant)
export class RestaurantResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Mutation((returns) => CreateRestaurantOutput)
  @Role(['Owner'])
  async createRestaurant(
    @AuthUser() authUser: User,
    @Args('input') createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    return this.restaurantService.createRestaurant(
      authUser,
      createRestaurantInput,
    );
  }

  @Mutation(() => EditRestaurantOutput)
  @Role(['Owner'])
  editRestaurant(
    @AuthUser() owner: User,
    @Args('input') editRestaurantInput: EditRestaurantInput,
  ): Promise<EditRestaurantOutput> {
    return this.restaurantService.editRestaurant(owner, editRestaurantInput);
  }

  @Mutation((returns) => DeleteRestaurantOutput)
  @Role(['Owner'])
  deleteRestaurant(
    @AuthUser() owner: User,
    @Args('input') deleteRestaurantInput: DeleteRestaurantInput,
  ): Promise<DeleteRestaurantOutput> {
    return this.restaurantService.deleteRestauant(owner, deleteRestaurantInput);
  }
}

@Resolver(of => Category)
export class CategoryResolver{
  constructor(private readonly restaurantService: RestaurantService){}

  @ResolveField(type => Int)
  restaurantCount(@Parent() category: Category): Promise<number> {
    return this.restaurantService.countRestaurant(category);
  }
  
  @Query(type => AllCategoriesOutput)
  allCategories():Promise<AllCategoriesOutput>{
    return this.restaurantService.allCategories();
  }
}