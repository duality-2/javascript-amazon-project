export let cart = []

export function addToCart(productId) {
  let matchingItem = undefined
  cart.forEach(cartItem => {
    if(productId === cartItem.productId) {
      matchingItem = cartItem
    }
  })

  if(matchingItem) {
    matchingItem.quantity++
  } else {
    cart.push({
      productId: productId,
      quantity: 1
    }) 
  }
}

