import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { Injectable } from "@nestjs/common";
import { CreateAccountInput } from "./dtos/create-account.dto";
import { LoginInput } from "./dtos/login.dto";
import { JwtService } from "src/jwt/jwt.service";

@Injectable()
export class UsersService{
    constructor(
        @InjectRepository(User) private readonly users: Repository<User>,
        private readonly jwtService: JwtService,
    ){}

    async createAccount({email, password, role}: CreateAccountInput): Promise<{ok: boolean, error? :string}>{
        try{
            const exists = await this.users.findOne({where:{email}});
            if(exists){
                return {
                    ok: false,
                    error:"There is a user with that email already"};
                
            }
            await this.users.save(this.users.create({email, password, role}));
            return {
                ok:true,
            };
        }catch(e){
            return {
                ok: false,
                error: "Couldn't create an account"};
        }
    }

    async login({email,password}: LoginInput) : Promise<{ok: boolean; error?: string, token?:string}>{
        // find the user with the email
        // check if the password is correct
        // make a JWT and give it to the user
        try{
            const user = await this.users.findOne({where: {email}});
            if(!user){
                return{
                    ok: false,
                    error: 'User not found',
                }
            }
            const passwordCorrect = await user.checkPassword(password);
            if(!passwordCorrect)
            {
                return {
                    ok:false,
                    error:"Wrong Password"
                }
            }
            const token = this.jwtService.sign(user.id)
            return{
                ok:true,
                token
            }
        }catch(error){
            return{
                ok:false,
                error
            }
        }
    }
}