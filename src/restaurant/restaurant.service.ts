import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Restaurant } from './entities/restaurant.entity';
import * as typeorm from 'typeorm';
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
import {
  SearchRestaurantInput,
  SearchRestaurantOutput,
} from './dtos/search-restaurant.dto';
import { CreateDishInput, CreateDishOutput } from './dtos/create-dish.dto';
import { Dish } from './entities/dish.entity';
import { EditDishInput, EditDishOutput } from './dtos/edit-dish.dto';
import { DeleteDishInput, DeleteDishOutput } from './dtos/delete-dish.dto';
import { MyRestaurantsOutput } from './dtos/my-restaurants.dto';
import { MyRestaurantInput, MyRestaurantOutput } from './dtos/my-restaurant';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: typeorm.Repository<Restaurant>,
    private readonly categories: CateogryRepository,
    @InjectRepository(Dish)
    private readonly dishes: typeorm.Repository<Dish>,
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
        restaurantId: newRestaurant.id
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
    } catch {
      return {
        ok: false,
        error: 'Could not edit the restaruant',
      };
    }
  }

  async deleteRestauant(
    owner: User,
    { restaurantId }: DeleteRestaurantInput,
  ): Promise<DeleteRestaurantOutput> {
    try {
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
        order: {
          isPromoted: 'DESC',
        },
      });
      category.restaurants = restaurants;
      const totalResults = await this.countRestaurant(category);
      return {
        ok: true,
        category,
        restaurants,
        totalResults,
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
        relations: ['category'],
        take: 3,
        skip: (page - 1) * 3,
        order: {
          isPromoted: 'DESC',
        },
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
        relations: ['menu', 'category'],
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

  async myRestaurant(
    owner: User,
    {id} : MyRestaurantInput
  ) : Promise<MyRestaurantOutput>{
    try{
      const restaurant = await this.restaurants.findOne({where: {owner:{id:owner.id},id:id}, relations:['menu','orders']})
      return{
        restaurant,
        ok:true
      }
    }
    catch{
      return{
        ok:false,
        error: 'Could not find restaurant'
      }
    }
  }

  async searchRestaurantByName({
    query,
    page,
  }: SearchRestaurantInput): Promise<SearchRestaurantOutput> {
    try {
      const [restaurants, totalResults] = await this.restaurants.findAndCount({
        where: {
          //name: ILike(`%${query}%`)    same as
          name: typeorm.Raw((name) => `${name} ILIKE '%${query}%'`),
        },
        take: 25,
        skip: (page - 1) * 25,
      });
      return {
        ok: true,
        restaurants,
        totalPages: Math.ceil(totalResults / 25),
        totalResults,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not search for the restaurant',
      };
    }
  }

  async createDish(
    owner: User,
    createDishInput: CreateDishInput,
  ): Promise<CreateDishOutput> {
    try {
      const restaurant = await this.restaurants.findOne({
        where: { id: createDishInput.restaurantId },
      });
      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant Not Found',
        };
      }
      if (owner.id !== restaurant.ownerId) {
        return {
          ok: false,
          error: 'You cannot create a dish',
        };
      }
      await this.dishes.save(
        this.dishes.create({ ...createDishInput, restaurant }),
      );
      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not create a dish',
      };
    }
  }

  async editDish(
    owner: User,
    editDishInput: EditDishInput,
  ): Promise<EditDishOutput> {
    try {
      const dish = await this.dishes.findOne({
        where: { id: editDishInput.dishId },
        relations: ['restaurant'],
      });
      if (!dish) {
        return {
          ok: false,
          error: 'Dish Not Found',
        };
      }
      if (dish.restaurant.ownerId !== owner.id) {
        return {
          ok: false,
          error: 'You cannot edit the dish that you do not own',
        };
      }
      await this.dishes.save([{ id: editDishInput.dishId, ...editDishInput }]);
      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not edit dish',
      };
    }
  }

  async deleteDish(
    owner: User,
    deleteDishInput: DeleteDishInput,
  ): Promise<DeleteDishOutput> {
    try {
      const dish = await this.dishes.findOne({
        where: { id: deleteDishInput.dishId },
        relations: ['restaurant'],
      });
      if (!dish) {
        return {
          ok: false,
          error: 'Dish Not Found',
        };
      }
      if (dish.restaurant.ownerId !== owner.id) {
        return {
          ok: false,
          error: 'You cannot delete a dish that you do not own',
        };
      }
      await this.dishes.delete(deleteDishInput.dishId);
      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not delete the dish',
      };
    }
  }

  async myRestaurants(owner: User): Promise<MyRestaurantsOutput> {
    try {
      const restaurants = await this.restaurants.find({
        where: { owner: { id: owner.id } },
        relations:['category']
      });
      return {
        restaurants,
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not find restaurants.',
      };
    }
  }
}
