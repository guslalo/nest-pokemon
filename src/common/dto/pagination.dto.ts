import { IsInt, IsNumber, IsOptional, IsPositive, Min } from "class-validator";

export class PaginationDto {
    @IsOptional()
    @IsPositive()
    @Min(1)
    limit?:number;
    @IsOptional()
    @IsNumber()
    @IsInt()
    @Min(0)
    offset?:number;
}