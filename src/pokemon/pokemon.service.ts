import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, Query } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Model, isValidObjectId } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';
import { PaginationDto } from 'src/common/dto/pagination.dto';


@Injectable()
export class PokemonService {

  private defaultLimit:number;

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel:Model<Pokemon>,
    private readonly configService: ConfigService){
      this.defaultLimit = this.configService.get<number>('DEFAULT_LIMIT');

  }
  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();
      /*const newPokemon:Car = { 
          no:Number,
          ...createCar 
      };
      this.cars.push(newcar); */
      try {
        const pokemon = await this.pokemonModel.create(createPokemonDto);
        return pokemon;
      } catch (error) {
        this.HandleExepction(error);
      }
  }

  async findAll( PaginationDto:PaginationDto) {
    const { limit = this.defaultLimit, offset = 0 } = PaginationDto;

    return this.pokemonModel.find()
      .limit( limit )
      .skip( offset )
      .sort({
        no: 1
      })
      .select('-__v');
  }

  async findOne(search: string) {
    let pokemon: Pokemon;

    if ( !isNaN(+search) ) {
      pokemon = await this.pokemonModel.findOne({ no: search });
    }

    // MongoID
    if ( !pokemon && isValidObjectId( search ) ) {
      pokemon = await this.pokemonModel.findById( search );
    }

    // Name
    if ( !pokemon ) {
      pokemon = await this.pokemonModel.findOne({ name: search.toLowerCase().trim() })
    }


    if ( !pokemon ) 
      throw new NotFoundException(`Pokemon with id, name or no "${ search }" not found`);
    

    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {

    const  pokemon = await this.findOne(term);
    if(updatePokemonDto.name)
      updatePokemonDto.name = updatePokemonDto.name.toLocaleLowerCase();

    try {
      const pokemonUpdate = await pokemon.updateOne(updatePokemonDto, {new:true})
      return {
        ...pokemon.toJSON, ...updatePokemonDto
      }
    } catch (error) {
      this.HandleExepction(error);
    }

    
  }

  async remove(id: string) {
    //const pokemon = await this.findOne(id);
    //await pokemon.deleteOne();
    //const result = await this.pokemonModel.findByIdAndDelete(id);

    const { deletedCount } = await this.pokemonModel.deleteOne({ _id: id });
    if ( deletedCount === 0 )
      throw new BadRequestException(`Pokemon with id "${ id }" not found`);
    return;

  }

  private HandleExepction(error:any){
    if( error.code === 11000){
      throw new BadRequestException (`' duplicado' ${JSON.stringify(error.keyValue)}` );
    }
    console.log(error);
    throw new InternalServerErrorException ('error server check logs')
  } 
}
