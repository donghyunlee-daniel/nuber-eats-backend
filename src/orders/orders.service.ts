import { Injectable } from "@nestjs/common";
import { Order } from "./entities/order.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class OrderService{
    constructor(
        @InjectRepository(Order)
        private readonly orders: Repository<Order>
    ){}

    
}