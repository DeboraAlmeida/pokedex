let limit = 15
let offset = 0
let total = 1025 

let controlOffset = 0
let extra = total % limit
let control = total - limit - extra

const pokeList = document.querySelector('[data-js="pokemons-list"]')
const fragment = document.createDocumentFragment()

const form = document.querySelector('form')
const input = document.querySelector('input')
const buttonGo = document.querySelector('#go')

const msg = document.getElementById('msg')

const getTypeColor = (type, att) => {
  const normal = {
    color: '#84918d',
    opacity: '#84918d99'
  };
  return {
    normal,
    fire: {
      color: '#eb542a',
      opacity: '#eb542a99'
    },
    grass: {
      color: '#a1fc79',
      opacity: '#a1fc7999'
    },
    ice: {
      color: '#89bed9',
      opacity: '#89bed999'
    },
    electric: {
      color: '#fcc347',
      opacity: '#fcc34799'
    },
    water: {
      color: '#4270d4',
      opacity: '#4270d499'
    },
    ground: {
      color: '#695833',
      opacity: '#69583399'
    },
    rock: {
      color: '#3d382c',
      opacity: '#3d382c99'
    },
    fairy: {
      color: '#f59ab5',
      opacity: '#f59ab599'
    },
    poison: {
      color: '#9a81eb',
      opacity: '#9a81eb99'
    },
    bug: {
      color: '#acc278',
      opacity: '#acc27899'
    },
    ghost: {
      color: '#b69adb',
      opacity: '#b69adb99'
    },
    dragon: {
      color: '#97c4be',
      opacity: '#97c4be99'
    },
    psychic: {
      color: '#eaeda1',
      opacity: '#eaeda199'
    },
    fighting: {
      color: '#31574b',
      opacity: '#31574b99'
    },
    flying: {
      color: '#ace3e8',
      opacity: '#ace3e899'
    },
    dark: {
      color: '#342414',
      opacity: '#34241499'
    },
    steel: {
      color: '#2b3142',
      opacity: '#2b314299'
    }
  }[type][att] || normal[att]
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
      return pokemons.map(fulfilled => fulfilled.types.map(info => DOMPurify.sanitize(info.type.name)))
      break;

    case 'sprites-png':
      const officalArt = sprites.map(sprite => sprite[2])
      const png = officalArt.map(png => png[1])
      return png
      break;
  
    case 'sprites-home':
      const home = sprites.map(sprite => sprite[1])
      const homeImg = home.map(png => png[1])
      return homeImg
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
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`)

    if (!response.ok) {
      throw new Error('No Pokémon around...')
      return
    }

    const { results: pokeApiResults } = await response.json()
    const pokeIds = getPokemonsIds(pokeApiResults) // using this function to avoid another request in getPokemonInfo(pokeApiResults, 'id')
    const types = await getPokemonsInfo(pokeApiResults, 'types')
    const spritesPng = await getPokemonsInfo(pokeApiResults, 'sprites-png')
    const spritesPngAlternative = await getPokemonsInfo(pokeApiResults, 'sprites-home')
    const pokemons = pokeIds.map((id, i) => (
      {
        id,
        name: pokeApiResults[i].name,
        types: types[i],
        imgUrl: spritesPng[i].front_default !== null ? spritesPng[i].front_default : spritesPngAlternative[i].front_default
      }
    ))   

    if (offset >= control) {
      offset += limit
      limit = extra
      controlOffset += 1
    } else { 
      offset += limit
    } 
    
    return pokemons

  } catch (error) {
    console.log('Oops..', error)    
  }
}

const showPokemonModal = (card) => {
  const modalOverlay = document.querySelector('.modal')
  modalOverlay.style.display = "block"
  const modalContainer = document.querySelector('.poke__modal-container')
  const pokemonCard = document.createElement('div')
  pokemonCard.append(card.cloneNode(true))
  modalContainer.append(pokemonCard)
  const close = document.querySelector('.close')
  close.onclick = function() {
    modalOverlay.style.display = "none";
    pokemonCard.remove()
  }
  modalContainer.onclick = function() {
    modalOverlay.style.display = "none";
    pokemonCard.remove()
  }
  modalOverlay.onclick = function() {
    modalOverlay.style.display = "none";
    pokemonCard.remove()
  }
}

const createCard = (id, name, types, imgUrl) => {
  const [firstType] = types
  const pokeCard = document.createElement('div')
  pokeCard.setAttribute('class', `${firstType} poke__card`)
  pokeCard.style.setProperty('--type-color', getTypeColor(firstType, 'color'))

  const pokeImg = document.createElement('img')
  pokeImg.setAttribute('class', 'poke__img')
  pokeImg.setAttribute('src', imgUrl)
  pokeImg.setAttribute('alt', name)
  
  const cardInfo = document.createElement('div')
  cardInfo.setAttribute('class', 'card__info')

  const pokeNumberBox = document.createElement('div')
  pokeNumberBox.setAttribute('class', 'poke__number-box')
  
  
  const pokeNumber = document.createElement('h4')
  pokeNumber.setAttribute('class', '.poke__number')
  pokeNumber.textContent = `#${id}`
  
  const pokeInfo = document.createElement('div')
  pokeInfo.setAttribute('class', 'poke__info')

  for (let i = 0; i < types.length; i++) {
    const pokeType = document.createElement('p')
    pokeType.setAttribute('class', 'poke__type')
    pokeType.style.setProperty('--type-color', getTypeColor(types[i], 'opacity'))
    pokeType.textContent = types[i]
    pokeInfo.append(pokeType)
  }    
  
  const pokeName = document.createElement('h2')
  pokeName.setAttribute('class', 'poke__name')
  pokeName.textContent= `${name[0].toUpperCase()}${name.slice(1)}`
  
  pokeCard.append(pokeImg)
  pokeNumberBox.append(pokeNumber)
  cardInfo.append(pokeNumberBox)
  cardInfo.append(pokeInfo)
  pokeCard.append(cardInfo)
  pokeCard.append(pokeName)

  pokeCard.addEventListener('click', function() {
    const card = pokeCard
    showPokemonModal(card)
  })

  return pokeCard
}

const renderPokemons = pokemons => {
  const count = document.querySelector('.poke__count')


  pokemons.forEach(({ id, name, types, imgUrl }) => {
    const pokeCard = createCard(id, name, types, imgUrl)    
    fragment.append(pokeCard)  
  })

  pokeList.append(fragment)
  count.textContent = `${total} Pokémon listed:`
}

const observeLastPokemon = pokemonObserver => {
  const lastPokemon = document.querySelector('.poke__list').lastChild
  pokemonObserver.observe(lastPokemon)
}

const handleNextPokemonsRender = () => {
  const pokemonObserver = new IntersectionObserver(async ([lastPokemon], observer) => {
    if (!lastPokemon.isIntersecting) return

    observer.unobserve(lastPokemon.target)

    if (controlOffset > 1) {
      return
    }

    const pokemons = await getPokemons()
    renderPokemons(pokemons)
    observeLastPokemon(pokemonObserver)
  })

  observeLastPokemon(pokemonObserver)
}

const handlePageLoaded = async () => {
  const pokemons = await getPokemons()
  renderPokemons(pokemons)
  handleNextPokemonsRender()
}

const renderPokemonSearch = async (pokemon) => {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon}`)
    
    if (!response.ok) {
      throw new Error('Pokémon not found...')
      return
    }
    
    const data = await response.json()
    const types = data.types.map(info => DOMPurify.sanitize(info.type.name))
    const imgs = Object.entries(data.sprites.other)
    const officialArt = imgs[2][1].front_default
    const homeArt = imgs[1][1].front_default
    const sprite = officialArt !== null ? officialArt : homeArt
    const card = createCard(data.id, data.name, types, sprite )
    input.value = ''
    showPokemonModal(card)

  } catch (error) {
    input.value = ''
    alert('Pokémon not found. Try again')
    console.log('Oops..', error)    
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault()
  renderPokemonSearch(input.value.toLowerCase())
})

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

