const getTypeColor = type => {
  const normal = '#f5f5f5';
  return {
    normal,
    fire: '#fddfdf',
    grass: '#defde0',
    ice: '#def3fd',
    electric: '#fcf7de',
    water: '#def3fd',
    ground: '#f4e7da',
    rock: '#d5d5d4',
    fairy: '#fceaff',
    poison: '#98d7a5',
    bug: '#f8d5a3',
    ghost: '#cac0f7',
    dragon: '#97b3e6',
    psychic: '#eaeda1',
    fighting: '#e6e0d4',
    flying: '#c6c6c6'
  }[type] || normal
}

const getPokemonsInfo = async (results, info) => {
  const promises = results.map(result => fetch(result.url))
  const responses = await Promise.allSettled(promises) // allSettled vai esperar todas as promises serem resolvidas em paralelo
  const fulfilled = responses.filter(response => response.status === 'fulfilled')
  const pokePormises = fulfilled.map(url => url.value.json())
  const pokemons = await Promise.all(pokePormises)
  const sprites = pokemons.map(fulfilled => Object.entries(fulfilled.sprites.other))  

  switch (info) {
    case 'types':
      return pokemons.map(fulfilled => fulfilled.types.map(info => info.type.name))
      break;

    case 'sprites-png':
      const officalArt = sprites.map(sprite => sprite[2])
      const png = officalArt.map(png => png[1])
      return png
      break; 
      
    case 'sprites-gif':
      const showdown = sprites.map(sprite => sprite[3])
      const gif = showdown.map(gif => gif[1])
      return gif
      break;

    case 'name':
      return pokemons.map(fulfilled => fulfilled.name)
      break;

    case 'id':
      return pokemons.map(fulfilled => fulfilled.id)
      break;

    default:
      break;
  }
}

const getPokemonsIds = pokeApiResults => pokeApiResults.map(({ url }) => {
  const urlAsArray = url.split('/')
  return urlAsArray.at(urlAsArray.length - 2)
})

const getPokemons = async () => {
  try {
    const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=10&offset=0')

    if (!response.ok) {
      throw new Error('No Pokémon around...')
      return
    }

    const { results: pokeApiResults, count } = await response.json()

    const pokeIds = getPokemonsIds(pokeApiResults) // using this function to avoid another request in getPokemonInfo(pokeApiResults, 'id')
    const types = await getPokemonsInfo(pokeApiResults, 'types')
    const spritesPng = await getPokemonsInfo(pokeApiResults, 'sprites-png')
    const pokemons = pokeIds.map((id, i) => (
      {
        id,
        name: pokeApiResults[i].name,
        types: types[i],
        imgUrl: spritesPng[i].front_default
      }
    ))

    return pokemons

  } catch (error) {
    console.log('Oops..', error)    
  }
}

const renderPokemons = () => {
  
}

const handlePageLoaded = async () => {
  const pokemons = await getPokemons()
  renderPokemons(pokemons)
}

handlePageLoaded()


/***
 * If I'd used local imgs on ./assets/img
 * I could have done like this excelent example:
 * 
 * function to get all fulfilled and use both for img and types:
 * 
 * const getOnlyFulfilled = async ({ arr, func }) => {
  const promises = arr.map(func)
  const responses = await Promise.allSettled(promises) // allSettled vai esperar todas as promises serem resolvidas em paralelo
  return responses.filter(response => response.status === 'fulfilled')
}

* function to get the local imgs url:

const getPokemonImgs = async ids => {
  const fulfilled = getOnlyFulfilled({ arr: ids, func: id => fetch(`./assets/img/${id}.png`) })
  return fulfilled.map(response => response.value.url)
}

* and on getPokemonInfo to get only types I should do:

* const promises = getOnlyFulfilled({ arr: results, func: result => fetch(result.url) })
* and eliminate 'responses' and 'fulfilled' consts

* But I'm getting the sprites on the same function of the types, so it's not necessary
 */

/* const pokeList = document.querySelector('.poke__list');
const pokeCard = document.querySelector('.poke__card');
const pokeImg = document.querySelector('.poke__img');
const pokeName = document.querySelector('.poke__name');
const pokeNumber = document.querySelector('.poke__number');
*/

