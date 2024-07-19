import { Injectable } from '@nestjs/common';

import { PokeResponse } from './interfaces/poke-response-interface'; 
import { CreatePokemonDto } from 'src/pokemon/dto/create-pokemon.dto'; 
import { InjectModel } from '@nestjs/mongoose';
import { Pokemon } from '../pokemon/entities/pokemon.entity';
import { Model } from 'mongoose';
import { AxiosAdapter } from '../common/adapters/axios.adatper';


@Injectable()
export class SeedService {

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel:Model<Pokemon>,
    private readonly http:AxiosAdapter
  ){
  }

private readonly axios = this.http;

  async excuteSeed() {
    await this.pokemonModel.deleteMany({});
    //const { data } = await this.axios.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=650');
    const data = await this.http.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=250');

    const pokeminToInsert: {name:string, no:number}[] = [];
    data.results.forEach(async({name, url})=>{
       console.log({name, url})
       const segments = url.split('/');
       const no = +segments[segments.length - 2];
       //const pokemon = await this.pokemonModel.create({name, no});
       pokeminToInsert.push({name, no});
    })
    await this.pokemonModel.insertMany(pokeminToInsert);
    return  'seed executed';
  }

}
