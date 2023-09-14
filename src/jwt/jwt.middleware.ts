import { NestMiddleware } from "@nestjs/common";
import { Request,Response, NextFunction } from "express";


export class JwtMiddleware implements NestMiddleware{
    use(req:Request, res:Response, next:NextFunction){
        console.log(req.headers);
        next();
    }
}