import { Test, TestingModule } from '@nestjs/testing';
import { RestaurantService } from './restaurant.service';
import { getCustomRepositoryToken, getRepositoryToken } from '@nestjs/typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { Category } from './entities/category.entity';
import { CateogryRepository } from './repositories/category.repository';
import { Dish } from './entities/dish.entity';
import { Repository } from 'typeorm';
import { User, UserRole } from 'src/users/entities/user.entity';

const mockRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
  find: jest.fn(),
  findAndCount: jest.fn(),
  getOrCreate: jest.fn(() => Promise.resolve(Category)),
});

const mockedUser = new User();

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

type MockCategoryRepo = Partial<Record<keyof CateogryRepository, jest.Mock>>;

describe('RestaurantService', () => {
  let service: RestaurantService;
  let restaurantRepository: MockRepository<Restaurant>;
  let categoryRepository: MockCategoryRepo;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RestaurantService,
        {
          provide: getRepositoryToken(Restaurant),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(CateogryRepository),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Dish),
          useValue: mockRepository(),
        },
      ],
    }).compile();

    service = module.get<RestaurantService>(RestaurantService);
    restaurantRepository = module.get(getRepositoryToken(Restaurant));
    categoryRepository = module.get(getRepositoryToken(CateogryRepository));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createRestaurant', () => {
    const createRestaurantArgs = {
      name: '',
      coverImg: '',
      address: '',
      categoryName: '',
      ownerId: 1,
    };
    mockedUser.id = 1;

    it('should create a restaurant', async () => {
      // create restaurant

      restaurantRepository.create.mockReturnValue(createRestaurantArgs);
      // Check the owner
      expect(createRestaurantArgs.ownerId).toEqual(mockedUser.id);

      const finalResult = await service.createRestaurant(
        mockedUser,
        createRestaurantArgs,
      );
      expect(restaurantRepository.create).toHaveBeenCalledTimes(1);
      expect(restaurantRepository.create).toHaveBeenCalledWith(
        createRestaurantArgs,
      );
      // get or create category
      expect(categoryRepository.getOrCreate).toHaveBeenCalledTimes(1);
      expect(categoryRepository.getOrCreate).toHaveBeenCalledWith(
        createRestaurantArgs.categoryName,
      );
      expect(restaurantRepository.save).toHaveBeenCalledTimes(1);
      expect(restaurantRepository.save).toHaveBeenCalledWith(
        createRestaurantArgs,
      );
      expect(finalResult).toEqual({ ok: true });
    });
    it('should fail on Exception', async () => {
      restaurantRepository.save.mockRejectedValue(new Error());
      const result = await service.createRestaurant(
        mockedUser,
        createRestaurantArgs,
      );
      expect(result).toEqual({
        ok: false,
        error: 'Could not create restaurant',
      });
    });
  });
  describe('editRestaurant', () => {
    const editRestaurantArgs = [
      {
        restaurantId: 1,
        id: 1,
        name: 'new',
        categoryName: 'test',
        category: Category,
      },
    ];
    it('should fail on restaurant not found', async () => {
      // find restaurant
      restaurantRepository.findOne.mockResolvedValue(null);
      const result = await service.editRestaurant(
        mockedUser,
        editRestaurantArgs[0],
      );

      expect(restaurantRepository.findOne).toHaveBeenCalledTimes(1);
      expect(restaurantRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: editRestaurantArgs[0].restaurantId },
        }),
      );
      expect(result).toEqual({ ok: false, error: 'Restaurant Not Found' });
    });
    it('should fail on different user ID', async () => {
      const mockedRestaurant = {
        ownerId: 2,
      };
      restaurantRepository.findOne.mockResolvedValue(mockedRestaurant);
      const result = await service.editRestaurant(
        mockedUser,
        editRestaurantArgs[0],
      );

      expect(restaurantRepository.findOne).toHaveBeenCalledTimes(1);
      expect(restaurantRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: editRestaurantArgs[0].restaurantId },
        }),
      );
      expect(result).toEqual({
        ok: false,
        error: 'You cannot edit a restaurant that you do not own',
      });
    });
    it('should change name of the restaurant', async () => {
      const oldRest = {
        restauratId: 1,
        ownerId: 1,
        name: '',
      };

      restaurantRepository.findOne.mockResolvedValue(oldRest);
      expect(oldRest.ownerId).toEqual(mockedUser.id);

      const result = await service.editRestaurant(
        mockedUser,
        editRestaurantArgs[0],
      );

      expect(categoryRepository.getOrCreate).toHaveBeenCalledTimes(1);
      expect(categoryRepository.getOrCreate).toHaveBeenCalledWith(
        editRestaurantArgs[0].categoryName,
      );
      expect(restaurantRepository.save).toHaveBeenCalledTimes(1);
      expect(restaurantRepository.save).toHaveBeenCalledWith(
        editRestaurantArgs,
      );
      expect(result).toEqual({ ok: true });
    });
    it('should fail on exception', async () => {
      restaurantRepository.findOne.mockRejectedValue(new Error());
      const result = await service.editRestaurant(
        mockedUser,
        editRestaurantArgs[0],
      );

      expect(restaurantRepository.findOne).toHaveBeenCalledTimes(1);
      expect(restaurantRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: editRestaurantArgs[0].restaurantId },
        }),
      );
      expect(result).toEqual({
        ok: false,
        error: 'Could not edit the restaruant',
      });
    });
  });
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
