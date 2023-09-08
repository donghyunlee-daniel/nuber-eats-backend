import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { Repository, ReturningStatementNotSupportedError } from "typeorm";
import { Injectable } from "@nestjs/common";
import { CreateAccountInput } from "./dtos/create-account.dto";
import { error } from "console";
import { LoginInput } from "./dtos/login.dto";


@Injectable()
export class usersService{
    constructor(
        @InjectRepository(User) private readonly users: Repository<User>
    ) {}

    async createAccount({email,password,role}: CreateAccountInput): Promise<{ok:boolean, error?:string}>{
        try{
            const exists = await this.users.findOne({where:{email}});
            if(exists){
                return {ok:false, error:"There is a user with that email already"};
            }
            await this.users.save(this.users.create({email,password,role}))
            return {ok:true};
        }
        catch(e)
        {
            return {ok:false, error:"Couldn't create account"};
        }       
    }

    async login({email,password}: LoginInput) : Promise<{ok:boolean, error?:string, token?: string}>{
        //find the user with the email
        try{
            const user = await this.users.findOne({where: {email}})
            if(!user){
                return {
                    ok:false,
                    error: 'User not found',
                };
            }
            // check if the password is correct
            const passwordCorrect = await user.checkPassword(password);
            if(!passwordCorrect){
                return{
                    ok:false,
                    error:"Wrong password',"
                }
            }
            return{
                ok:true,
                token:"lalalala"
            }
        // make a JWT and give it to the user
        }catch(error)
        {
            return {
                ok:false,
                error
            }
        }
    }
}