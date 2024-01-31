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

const getPokemonInfo = async (results, info) => {
  const promises = results.map(result => fetch(result.url))
  const responses = await Promise.allSettled(promises) // allSettled vai esperar todas as promises serem resolvidas em paralelo
  const fulfilled = responses.filter(response => response.status === 'fulfilled')
  const pokePormises = fulfilled.map(url => url.value.json())
  const pokemons = await Promise.all(pokePormises)
  const other = pokemons.map(fulfilled => Object.entries(fulfilled.sprites.other))  

  switch (info) {
    case 'types':
      return pokemons.map(fulfilled => fulfilled.types.map(info => info.type.name))
      break;

    case 'sprites-png':
      const officalArt = other.map(sprite => sprite[2])
      const png = officalArt.map(png => png[1])
      return png
      break; 
      
    case 'sprites-gif':
      const showdown = other.map(sprite => sprite[3])
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

const handlePageLoaded = async () => {
  try {
    const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=10&offset=0')

    if (!response.ok) {
      throw Error('No Pokémon around...')
      return
    }

    const { results: pokeApiResults, count } = await response.json()

    //testes no console
    const types = await getPokemonInfo(pokeApiResults, 'types')
    const sprites = await getPokemonInfo(pokeApiResults, 'sprites-gif')
    const spritespng = await getPokemonInfo(pokeApiResults, 'sprites-png')
    console.log(types)
    console.log(count)
    console.log(sprites)
    console.log(spritespng)
  } catch (error) {
    console.log('Oops..', error)
    
  }
}

handlePageLoaded()

/* const pokeList = document.querySelector('.poke__list');
const pokeCard = document.querySelector('.poke__card');
const pokeImg = document.querySelector('.poke__img');
const pokeName = document.querySelector('.poke__name');
const pokeNumber = document.querySelector('.poke__number');
*/