import { Request, Response } from "express"

export const allowCors = (req: Request, res: Response, next: any) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader ("Access-Control-Allow-Headers", "*")
    res.setHeader('Access-Control-Request-Method', '*');
    res.setHeader("Access-Control-Allow-Methods","*") ;
    next();
}