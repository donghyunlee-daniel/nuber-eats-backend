import { Test, TestingModule } from '@nestjs/testing';
import { RestaurantService } from './restaurant.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { Category } from './entities/category.entity';
import { CateogryRepository } from './repositories/category.repository';
import { Dish } from './entities/dish.entity';
import { Raw, Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';

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
mockedUser.id = 1;

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
  describe('deleteRestauant', () => {
    const deleteRestaurantArgs = {
      restaurantId: 1,
    };
    it('should fail if restaurant is not found', async () => {
      restaurantRepository.findOne.mockResolvedValue(null);
      const result = await service.deleteRestauant(
        mockedUser,
        deleteRestaurantArgs,
      );
      expect(restaurantRepository.findOne).toHaveBeenCalledTimes(1);
      expect(restaurantRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: deleteRestaurantArgs.restaurantId },
        }),
      );
      expect(result).toEqual({
        ok: false,
        error: 'Restaurant Not Found',
      });
    });
    it('should fail if ids are not equal', async () => {
      const mockedRestaurant = {
        restaurantId: 2,
      };
      restaurantRepository.findOne.mockResolvedValue(mockedRestaurant);
      const result = await service.deleteRestauant(
        mockedUser,
        mockedRestaurant,
      );

      expect(restaurantRepository.findOne).toHaveBeenCalledTimes(1);
      expect(restaurantRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockedRestaurant.restaurantId },
        }),
      );
      expect(result).toEqual({
        ok: false,
        error: 'You cannot delete a restaurant that you do not own',
      });
    });
    it('should delete the restaurant', async () => {
      const mockedRestaurant = {
        id: 1,
        ownerId: 1,
      };
      restaurantRepository.findOne.mockResolvedValue(mockedRestaurant);
      const result = await service.deleteRestauant(
        mockedUser,
        deleteRestaurantArgs,
      );
      expect(restaurantRepository.findOne).toHaveBeenCalledTimes(1);
      expect(restaurantRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: deleteRestaurantArgs.restaurantId },
        }),
      );
      expect(result).toEqual({
        ok: true,
      });
    });
    it('should fail on exception', async () => {
      restaurantRepository.findOne.mockRejectedValue(new Error());
      const result = await service.deleteRestauant(
        mockedUser,
        deleteRestaurantArgs,
      );

      expect(result).toEqual({
        ok: false,
        error: 'Could not delete the restaurant',
      });
    });
  });
  describe('allCategories', () => {
    it('should return categories', async () => {
      const mockedCategories: Category[] = [];
      categoryRepository.find.mockResolvedValue(mockedCategories);

      const result = await service.allCategories();

      expect(categoryRepository.find).toHaveBeenCalledTimes(1);
      expect(categoryRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          relations: ['restaurants'],
        }),
      );
      expect(result).toEqual({
        ok: true,
        categories: mockedCategories,
      });
    });
    it('should fail on exception', async () => {
      categoryRepository.find.mockRejectedValue(new Error());

      const result = await service.allCategories();

      expect(categoryRepository.find).toHaveBeenCalledTimes(1);
      expect(categoryRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          relations: ['restaurants'],
        }),
      );
      expect(result).toEqual({
        ok: false,
        error: 'Could not load categories',
      });
    });
  });
  describe('countRestaurant', () => {
    const countRestaurantArgs = new Category();
    countRestaurantArgs.id = 1;
    it('should return the number of restaurants', () => {
      restaurantRepository.count.mockReturnValue(1);

      const result = service.countRestaurant(countRestaurantArgs);
      expect(restaurantRepository.count).toHaveBeenCalledTimes(1);
      expect(restaurantRepository.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { category: { id: countRestaurantArgs.id } },
        }),
      );

      expect(result).toEqual(1);
    });
  });
  describe('findCategoryBySlug', () => {
    const findCategoryBySlugArgs = {
      slug: '',
      page: 1,
    };
    it('should fail if category is not found', async () => {
      categoryRepository.findOne.mockResolvedValue(null);
      const result = await service.findCategoryBySlug(findCategoryBySlugArgs);

      expect(categoryRepository.findOne).toHaveBeenCalledTimes(1);
      expect(categoryRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { slug: findCategoryBySlugArgs.slug },
        }),
      );
      expect(result).toEqual({
        ok: false,
        error: 'Category not found',
      });
    });
    it('should return categories', async () => {
      const mockedCategory = new Category();
      mockedCategory.id = 1;
      categoryRepository.findOne.mockResolvedValue(mockedCategory);
      const mockedRestaruant = new Restaurant();
      mockedRestaruant.category = mockedCategory;
      const mockedRestaurants: Restaurant[] = [];
      mockedRestaurants[0] = mockedRestaruant;
      restaurantRepository.find.mockResolvedValue(mockedRestaurants);
      const mockedCountRestaurant = 1;
      restaurantRepository.count.mockReturnValue(mockedCountRestaurant);

      const result = await service.findCategoryBySlug(findCategoryBySlugArgs);

      expect(categoryRepository.findOne).toHaveBeenCalledTimes(1);
      expect(categoryRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { slug: findCategoryBySlugArgs.slug },
        }),
      );
      expect(restaurantRepository.find).toHaveBeenCalledTimes(1);
      expect(restaurantRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { category: { id: mockedCategory.id } },
        }),
      );
      expect(restaurantRepository.count).toHaveBeenCalledTimes(1);
      expect(restaurantRepository.count).toHaveBeenCalledWith({
        where: { category: { id: mockedCategory.id } },
      });

      expect(result).toEqual({
        ok: true,
        category: mockedCategory,
        restaurants: mockedRestaurants,
        totalPages: 1,
      });
    });
    it('should fail on exceptoin', async () => {
      categoryRepository.findOne.mockRejectedValue(new Error());
      const result = await service.findCategoryBySlug(findCategoryBySlugArgs);

      expect(result).toEqual({ ok: false, error: 'Could not load category' });
    });
  });
  describe('allRestaurants', () => {
    const allRestaurantsArgs = {
      page: 1,
    };
    it('should return all restaurants', async () => {
      const mockedFindAndCount = [[], 1];
      restaurantRepository.findAndCount.mockResolvedValue(mockedFindAndCount);

      const result = await service.allRestaurants(allRestaurantsArgs);

      expect(restaurantRepository.findAndCount).toHaveBeenCalledTimes(1);
      expect(restaurantRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 3,
          skip: (allRestaurantsArgs.page - 1) * 3,
        }),
      );
      expect(result).toEqual({
        ok: true,
        results: mockedFindAndCount[0],
        totalPages: Math.ceil(1 / 3),
        totalResults: 1,
      });
    });
    it('should fail on Exception', async () => {
      restaurantRepository.findAndCount.mockRejectedValue(new Error());

      const result = await service.allRestaurants(allRestaurantsArgs);

      expect(restaurantRepository.findAndCount).toHaveBeenCalledTimes(1);
      expect(restaurantRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 3,
          skip: (allRestaurantsArgs.page - 1) * 3,
        }),
      );
      expect(result).toEqual({
        ok: false,
        error: 'Could not load restaurants',
      });
    });
  });
  describe('findRestaurantById', () => {
    const findRestaurantByIdArgs = {
      restaurantId: 1,
    };
    it('should fail if the restaurant is not found', async () => {
      restaurantRepository.findOne.mockResolvedValue(null);

      const result = await service.findRestaurantById(findRestaurantByIdArgs);

      expect(restaurantRepository.findOne).toHaveBeenCalledTimes(1);
      expect(restaurantRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: findRestaurantByIdArgs.restaurantId },
          relations: ['menu'],
        }),
      );
      expect(result).toEqual({
        ok: false,
        error: 'Restaurant Not Found',
      });
    });
    it('should return restaurant', async () => {
      const mockedRestaruant = {
        id: 1,
      };
      restaurantRepository.findOne.mockResolvedValue(mockedRestaruant);
      const result = await service.findRestaurantById(findRestaurantByIdArgs);

      expect(restaurantRepository.findOne).toHaveBeenCalledTimes(1);
      expect(restaurantRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: findRestaurantByIdArgs.restaurantId },
          relations: ['menu'],
        }),
      );
      expect(result).toEqual({
        ok: true,
        restaurant: mockedRestaruant,
      });
    });
    it('should fail on exception', async () => {
      restaurantRepository.findOne.mockRejectedValue(new Error());
      const result = await service.findRestaurantById(findRestaurantByIdArgs);
      expect(result).toEqual({
        ok: false,
        error: 'Could not find restaurant',
      });
    });
  });
  describe('searchRestaurantByName', () => {
    const searchRestaurantByNameArgs = {
      query: '',
      page: 1,
    };
    it('should return an array of restaurants that contains input', async () => {
      const mockedFindAndCount = [[], 1];
      restaurantRepository.findAndCount.mockResolvedValue(mockedFindAndCount);

      const result = await service.searchRestaurantByName(
        searchRestaurantByNameArgs,
      );

      expect(restaurantRepository.findAndCount).toHaveBeenCalledTimes(1);
      expect(restaurantRepository.findAndCount).toHaveBeenCalledWith(
        expect(Raw).toHaveBeenCalledTimes(1)
      );
      expect(result).toEqual({
        ok: true,
        restaurants: mockedFindAndCount,
        totalPages: 1,
        totalResults: 1,
      });
    });
    it('should fail on exception', async () => {
      restaurantRepository.findAndCount.mockResolvedValue(new Error());
      const result = await service.searchRestaurantByName(
        searchRestaurantByNameArgs,
      );

      expect(result).toEqual({
        ok: false,
        error: 'Could not search for the restaurant',
      });
    });
  });
  it.todo('createDish');
  it.todo('editDish');
  it.todo('deleteDishInput');
});
