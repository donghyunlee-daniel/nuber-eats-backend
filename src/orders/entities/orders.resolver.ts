import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { Order } from './order.entity';
import { OrderService } from '../orders.service';
import { CreateOrderInput, CreateOrderOutput } from '../dtos/create-order.dto';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { Role } from 'src/auth/role.decorator';

import { GetOrdersInput, GetOrdersOutput } from '../dtos/get-orders.dto';
import { GetOrderInput, GetOrderOutput } from '../dtos/get-order.dto';
import { EditOrderInput, EditOrderOutput } from '../dtos/edit-order.dto'; 
import { PubSub } from 'graphql-subscriptions';

const pubsub = new PubSub();

@Resolver((of) => Order)
export class OrderResolver {
  constructor(private readonly ordersService: OrderService) {}

  @Mutation((returns) => CreateOrderOutput)
  @Role(['Client'])
  async createOrder(
    @AuthUser() customer: User,
    @Args('input')
    createOrderInput: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    return this.ordersService.createOrder(customer, createOrderInput);
  }

  @Query(() => GetOrdersOutput)
  @Role(['Any'])
  async getOrders(
    @AuthUser() user: User,
    @Args('input') getOrdersInput: GetOrdersInput,
  ): Promise<GetOrdersOutput> {
    return this.ordersService.getOrders(user, getOrdersInput);
  }

  @Query(() => GetOrderOutput)
  @Role(['Any'])
  async getOrder(
    @AuthUser() user: User,
    @Args('input') getOrderinput: GetOrderInput,
  ): Promise<GetOrderOutput> {
    return this.ordersService.getOrder(user, getOrderinput);
  }
 
  @Mutation(()=> EditOrderOutput)
  @Role(['Any'])
  async editOrder(@AuthUser() user:User, @Args('input') editOrderInput: EditOrderInput) : Promise<EditOrderOutput>
  {
    return this.ordersService.editOrder(user,editOrderInput)
  }

  @Mutation(returns => Boolean)
  potatoReady(){
    pubsub.publish("hotPotatos",{readyPotatos: "Your potato is ready"})
    return true;
  }
  
   
  @Subscription(returns => String)
  @Role(['Any'])
  readyPotatos(@AuthUser() user:User) {
    console.log("User",user);
    return pubsub.asyncIterator("hotPotatos")
    
  }
}
