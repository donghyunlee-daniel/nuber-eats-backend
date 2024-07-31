import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { Repository } from 'typeorm';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create-restaurant.dto';
import { User } from 'src/users/entities/user.entity';
import { Category } from './entities/category.entity';
import {
  EditRestaurantInput,
  EditRestaurantOutput,
} from './dtos/edit-restaurant.dto';
import { CateogryRepository } from './repositories/category.repository';
import {
  DeleteRestaurantInput,
  DeleteRestaurantOutput,
} from './dtos/delete-restaurant.dto';
import { AllCategoriesOutput } from './dtos/all-cateogories.dto';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    private readonly categories: CateogryRepository,
  ) {}

  async createRestaurant(
    owner: User,
    createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    try {
      const newRestaurant = this.restaurants.create(createRestaurantInput);
      newRestaurant.owner = owner;
      const category = await this.categories.getOrCreate(
        createRestaurantInput.categoryName,
      );
      newRestaurant.category = category;
      await this.restaurants.save(newRestaurant);
      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not create restaurant',
      };
    }
  }

  async editRestaurant(
    owner: User,
    editRestaurantInput: EditRestaurantInput,
  ): Promise<EditRestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne({
        where: { id: editRestaurantInput.restaurantId },
      });
      if (!restaurant) {
        return { ok: false, error: 'Restaurant Not Found' };
      }
      if (owner.id !== restaurant.ownerId) {
        return {
          ok: false,
          error: 'You cannot edit a restaurant that you do not own',
        };
      }

      let category: Category = null;
      if (editRestaurantInput.categoryName) {
        category = await this.categories.getOrCreate(
          editRestaurantInput.categoryName,
        );
      }
      await this.restaurants.save([
        {
          id: editRestaurantInput.restaurantId,
          ...editRestaurantInput,
          ...(category && { category }),
        },
      ]);
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }

  async deleteRestauant(
    owner: User,
    { restaurantId }: DeleteRestaurantInput,
  ): Promise<DeleteRestaurantOutput> {
    const restaurant = await this.restaurants.findOne({
      where: { id: restaurantId },
    });
    if (!restaurant)
      return {
        ok: false,
        error: 'Restaurant Not Found',
      };
    if (owner.id !== restaurant.ownerId)
      return {
        ok: false,
        error: 'You cannot delete a restaurant that you do not own',
      };
    try {
      await this.restaurants.delete(restaurantId);
      return{
        ok:true
      }
    } catch {
      return {
        ok: false,
        error: 'Could not delete the restaurant',
      };
    }
  }

  async allCategories():Promise<AllCategoriesOutput> {
    try{
      const categories = await this.categories.find();
      return{
        ok:true,
        categories
      }
    }catch{
      return{
        ok:false,
        error: 'Could not load categories'
      }
    }
  }

  countRestaurant(category: Category) {
    return this.restaurants.count({where: {category : {id:category.id}}})
  }
}
