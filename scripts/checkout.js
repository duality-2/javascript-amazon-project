import {calculateCartQuantity, cart, removeFromCart, updateDeliveryOption, updateQuantity} from '../data/cart.js';
import { products } from '../data/products.js';
import formatCurrency from './utils/money.js';

import {hello} from 'https://unpkg.com/supersimpledev@1.0.1/hello.esm.js'
import dayjs from 'https://unpkg.com/supersimpledev@8.5.0/dayjs/esm/index.js'
import {deliveryOptions} from '../data/deliveryOptions.js'

hello()

const today = dayjs()
const deliveryDate = today.add(7, 'days')
console.log(deliveryDate.format('dddd, MMMM D'))


let cartSummaryHTML = '';
cart.forEach((cartItem) => {
  const productId = cartItem.productId;
  let matchingProduct;
  products.forEach((product) => {
    if(product.id === productId) {
      matchingProduct = product;
    }
  })


  const deliveryOptionId = cartItem.deliveryOptionId
  let deliveryOption
  deliveryOptions.forEach((option) => {
    if(option.id === deliveryOptionId) {
      deliveryOption = option
    }
  })

  const today = dayjs()
  const deliveryDate = today.add(deliveryOption.deliveryDays, 'days')
  const dateString = deliveryDate.format('dddd, MMM D')

  
  cartSummaryHTML +=
  `
    <div class="cart-item-container js-cart-item-container-${productId}">
      <div class="delivery-date">
        Delivery date: ${dateString}
      </div>

      <div class="cart-item-details-grid">
        <img class="product-image"
          src="${matchingProduct.image}">

        <div class="cart-item-details">
          <div class="product-name">
            ${matchingProduct.name}
          </div>
          <div class="product-price">
            $${formatCurrency(matchingProduct.priceCents)}
          </div>
          <div class="product-quantity">
            <span>
              Quantity: <span class="quantity-label js-quantity-label">${cartItem.quantity}</span>
            </span>
            <span class="update-quantity-link link-primary js-update-quantity-link" data-product-id="${matchingProduct.id}">
              Update
            </span>
            <input class="quantity-input js-quantity-input">
            <span class="save-quantity-link link-primary" data-product-id="${matchingProduct.id}">Save</span>
            <span class="delete-quantity-link link-primary js-delete-link" data-product-id="${matchingProduct.id}">
              Delete
            </span>
          </div>
        </div>

        <div class="delivery-options">
          <div class="delivery-options-title">
            Choose a delivery option:
          </div>
          ${deliveryOptionsHTML(matchingProduct, cartItem)}
        </div>
      </div>
    </div>
  `;
})

function deliveryOptionsHTML(matchingProduct, cartItem) {
  let html = ''
  deliveryOptions.forEach(deliveryOption => {
    const today = dayjs()
    const deliveryDate = today.add(deliveryOption.deliveryDays, 'days')
    const dateString = deliveryDate.format('dddd, MMM D')
    
    const priceString = deliveryOption.priceCents === 0 ? 'FREE' : `$${formatCurrency(deliveryOption.priceCents)} -`
    const isChecked = deliveryOption.id === cartItem.deliveryOptionId
    html += `
      <div class="delivery-option js-delivery-option" 
      data-product-id="${matchingProduct.id}" 
      data-delivery-option-id="${deliveryOption.id}">
        <input type="radio"
          ${isChecked ? 'checked' : ''}
          class="delivery-option-input"
          value="${deliveryOption.id}"
          name="delivery-option-${matchingProduct.id}">
        <div>
          <div class="delivery-option-date">
            ${dateString}
          </div>
          <div class="delivery-option-price">
            ${priceString} Shipping
          </div>
        </div>
      </div>
    `
  });
  return html
}


document.querySelector('.js-order-summary').innerHTML = cartSummaryHTML

document.querySelectorAll('.js-delete-link').forEach(link => {
    link.addEventListener('click', () => {
      const productId = link.dataset.productId;
      removeFromCart(productId)   //removing from the cart(backend)

      const container = document.querySelector(`.js-cart-item-container-${productId}`)
      container.remove()    //removing from frontend
      updateCartQuantity()    //when deleting

    })
  }) 

function updateCartQuantity() {
  const cartQuantity = calculateCartQuantity()
  document.querySelector('.js-return-to-home').innerHTML = `${cartQuantity} items`
}
updateCartQuantity()    //when loading


document.querySelectorAll('.js-update-quantity-link').forEach(link => {
  link.addEventListener('click', () => {
    const productId = link.dataset.productId

    const container = document.querySelector(`.js-cart-item-container-${productId}`)
    container.classList.add('is-editing-quantity')

  })
})

document.querySelectorAll('.save-quantity-link').forEach(link => {
  const productId = link.dataset.productId
  const container = document.querySelector(`.js-cart-item-container-${productId}`)
  link.addEventListener('click', () => {
    handleUpdateQuantity(productId, container)  
  })
  container.querySelector('.js-quantity-input').addEventListener('keydown', event => {
    if(event.key === 'Enter') {
      handleUpdateQuantity(productId, container)
    }
  })
})

function handleUpdateQuantity(productId, container) {
 
  const newQuantity = Number(container.querySelector('.quantity-input').value)   //gets the input element for that specific cartItem, document.querySelector() selects the only the first cart having the class: quantity-input

  updateQuantity(productId, newQuantity)    //updates the newQuantity in the cart

  container.querySelector('.js-quantity-label').innerHTML = newQuantity    //updates the: Quantity: __ for each specific cartItem, document.querySelector() only changes the quantity for the first element
  updateCartQuantity()    //updates the header at top: Checkout(__)

  container.classList.remove('is-editing-quantity')
}

document.querySelectorAll('.js-delivery-option').forEach(element => {
  element.addEventListener('click', () => {
    const {productId, deliveryOptionId} = element.dataset
    // const productId = element.dataset.productId
    // const deliveryOptionId = element.dataset.deliveryOptionId

    updateDeliveryOption(productId, deliveryOptionId)
  })
})