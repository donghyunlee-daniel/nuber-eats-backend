import { Test, TestingModule } from '@nestjs/testing';
import { RestaurantService } from './restaurant.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { Category } from './entities/category.entity';
import { CateogryRepository } from './repositories/category.repository';
import { Dish } from './entities/dish.entity';

const mockRepository = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
  find: jest.fn(),
  findAndCount: jest.fn(),
};

describe('RestaurantService', () => {
  let service: RestaurantService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RestaurantService,
        {
          provide: getRepositoryToken(Restaurant),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(CateogryRepository),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Dish),
          useValue: mockRepository,
        }
      ],
    }).compile();

    service = module.get<RestaurantService>(RestaurantService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it.todo('createRestaurant');
  it.todo('editRestaurant');
  it.todo('deleteRestauant');
  it.todo('allCategories');
  it.todo('findCategoryBySlug');
  it.todo('allRestaurants');
  it.todo('findRestaurantById');
  it.todo('searchRestaurantByName');
  it.todo('createDish');
  it.todo('editDish');
  it.todo('deleteDishInput');
});
