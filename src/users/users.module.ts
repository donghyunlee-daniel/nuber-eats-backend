import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersResolver } from './users.resolver';
import { usersService } from './users.service';
import { Verification } from './entities/verification.entity';


@Module({
    imports:[TypeOrmModule.forFeature([User, Verification])],
    providers:[UsersResolver, usersService],
    exports: [usersService]
})
export class UsersModule {} 
