// Handle forms
document.body.addEventListener( "submit", async ( event ) => {
  // Prevent default behavior (page reload)
  event.preventDefault();
  // Get info about the form
  let form = event.target;
  let route = form.getAttribute( "action" );
  let method = form.getAttribute( "method" );
  // Collect the data from the form
  // (does not work with check and radio boxes yet)
  let requestBody = {};
  for ( let {
      name,
      value
    } of form.elements ) {
    if ( !name ) {
      continue;
    }
    requestBody[ name ] = value;
  }
  // Send the data via our REST api
  let rawResult = await fetch( route, {
    method,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify( requestBody ),
  } );
  let result = await rawResult.json();
  console.log( result );
  // Empty the fields
  for ( let element of form.elements ) {
    if ( !element.name ) {
      continue;
    }
    element.value = "";
  }
  // Non-generic code, speficic for the add product form
  form.style.display = "none";
  document.querySelector( ".add-product-button" ).style.display = "block";
  // fetch all the data from database
  await getProduct();
} );

// Show form on button click
document.body.addEventListener( "click", ( event ) => {
  let addProductButton = event.target.closest( ".add-product-button" );
  if ( !addProductButton ) {
    return;
  }
  document.querySelector( ".add-product-form" ).style.display = "block";
  addProductButton.style.display = "none";
  window.scrollTo( 0, 10000000 );
} );

// Fetch a list of all products
async function getProduct() {
  let rawData = await fetch( "/api/products" );
  let products = await rawData.json();
  let html = "";
  for ( let {
      id,
      productName,
      description,
      price,
      image
    } of products ) {
    html += `
      <div class="product">
        <h3>${productName}</h3>
        <p><img id="product-img"  src="${image}.jpg"></p>
        <p><b>Description:</b> ${description}</p>
        <p><b>Price:</b> ${price} <b>kr.</b></p>
        <p><button class="delete-button" id="delete-${id}" onclick="return confirm('Are you sure you want to Delete?');">Delete</button></p>
         <p><button class="change-button" id="change-${id}">Edit product details</button></p>
         <hr>
      </div>
    `;
  }
  let productList = document.querySelector( ".list-of-product" );
  productList.innerHTML = html;
  // when we have fetched a list  scroll to the top of th screen
  window.scrollTo( 0, 0 );
}

// Load products from database and display
getProduct();

// React on click on delete button
document.body.addEventListener( "click", async ( event ) => {
  let deleteButton = event.target.closest( ".delete-button" );
  if ( !deleteButton ) {
    return;
  }
  let idToDelete = deleteButton.id.slice( 7 );
  await fetch( "/api/products/" + idToDelete, {
    method: "DELETE",
  } );
  getProduct();
} );

// React on click on change button
// populate the change form with the correct item
document.body.addEventListener( "click", async ( event ) => {
  let changeButton = event.target.closest( ".change-button" );
  if ( !changeButton ) {
    return;
  }
  let idToChange = changeButton.id.slice( 7 );
  // get the data to change
  let rawResult = await fetch( "/api/products/" + idToChange );
  let result = await rawResult.json();
  // fill and show the change forms base on the result/data
  let changeForm = document.querySelector( ".change-product-form" );
  // add the correct route / action to the form
  changeForm.setAttribute( "action", "/api/products/" + result.id );
  // Fill the form with the data from the database
  for ( let element of changeForm.elements ) {
    if ( !element.name ) {
      continue;
    }
    element.value = result[ element.name ];
  }
  // show the form
  changeForm.style.display = "block";
  window.scrollTo( 0, 10000000 );
} );