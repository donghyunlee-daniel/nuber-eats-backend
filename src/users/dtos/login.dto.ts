import { Field, InputType, ObjectType, PickType } from "@nestjs/graphql";
import { Mutationoutput } from "src/common/dtos/output.dto";
import { User } from "../entities/user.entity";

@InputType()
export class LoginInput extends PickType(User, ["email", "password"]){}


@ObjectType()
export class LoginOutput extends Mutationoutput{
    @Field(()=>String,{nullable:true})
    token?: string;
}