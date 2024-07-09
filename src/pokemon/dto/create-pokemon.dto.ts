import { IsInt, IsPositive, IsString, MinLength, Min } from "class-validator";

export class CreatePokemonDto {
    @Min(1)
    @IsPositive()
    @IsInt()
    no:number;
    @IsString()
    @MinLength(1)
    name:string;

}
