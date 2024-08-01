import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { ILike, Like, Raw, Repository } from 'typeorm';
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
import { CategoryInput, CategoryOutput } from './dtos/category.dto';
import { RestaurantsInput, RestaurantsOutput } from './dtos/restaurants.dto';
import { RestaurantInput, RestaurantOutput } from './dtos/restaurant.dto';
import { SearchRestaurantInput, SearchRestaurantOutput } from './dtos/search-restaurant.dto';

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
      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not delete the restaurant',
      };
    }
  }

  async allCategories(): Promise<AllCategoriesOutput> {
    try {
      const categories = await this.categories.find({
        relations: ['restaurants'],
      });
      return {
        ok: true,
        categories,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not load categories',
      };
    }
  }

  countRestaurant(category: Category) {
    return this.restaurants.count({ where: { category: { id: category.id } } });
  }

  async findCategoryBySlug({
    slug,
    page,
  }: CategoryInput): Promise<CategoryOutput> {
    try {
      const category = await this.categories.findOne({
        where: { slug: slug },
      });
      if (!category) {
        return {
          ok: false,
          error: 'Category not found',
        };
      }
      const restaurants = await this.restaurants.find({
        where: {
          category: {
            id: category.id,
          },
        },
        take: 3,
        skip: (page - 1) * 3,
      });
      category.restaurants = restaurants;
      const totalResults = await this.countRestaurant(category);
      console.log(totalResults);
      return {
        ok: true,
        category,
        restaurants,
        totalPages: Math.ceil(totalResults / 3),
      };
    } catch {
      return {
        ok: false,
        error: 'Could not load category',
      };
    }
  }

  async allRestaurants({ page }: RestaurantsInput): Promise<RestaurantsOutput> {
    try {
      const [results, totalResults] = await this.restaurants.findAndCount({
        take: 3,
        skip: (page - 1) * 3,
      });
      return {
        ok: true,
        results,
        totalPages: Math.ceil(totalResults / 3),
        totalResults,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not load restaurants',
      };
    }
  }

  async findRestaurantById({
    restaurantId,
  }: RestaurantInput): Promise<RestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne({
        where: { id: restaurantId },
      });
      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant Not Found',
        };
      }
      return {
        ok: true,
        restaurant,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not find restaurant',
      };
    }
  }

  async searchRestaurantByName({query,page}: SearchRestaurantInput) : Promise<SearchRestaurantOutput> {
    try{
      const [restaurants, totalResults] = await this.restaurants.findAndCount({
        where: {
          //name: ILike(`%${query}%`)    same as 
          name: Raw(name => `${name} ILIKE '%${query}%'`)
        }
      })
      return{
        ok:true,
        restaurants,
        totalPages: Math.ceil(totalResults/3),
        totalResults,
      }
    }
    catch{
      return{
        ok:false,
        error: 'Could not search for the restaurant'
      }
    }
  }
}
