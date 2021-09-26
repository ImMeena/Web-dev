//stock information
document.body.addEventListener( "submit", async ( event ) => {
  // Prevent default behavior (page reload)
  event.preventDefault();
  // Get info about the form
  let form = event.target;
  let route = form.getAttribute( "action" );
  let method = form.getAttribute( "method" );
  // Collect the data from the form
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
  // Send the data via REST api
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
  document.querySelector( ".add-stock-button" ).style.display = "block";
  // Now get all products again from the db
  await getstock();
} );
// Show form on button click
document.body.addEventListener( "click", ( event ) => {
  let addstockButton = event.target.closest( ".add-stock-button" );
  if ( !addstockButton ) {
    return;
  }
  document.querySelector( ".add-stockinfo-form" ).style.display = "block";
  addstockButton.style.display = "none";
  window.scrollTo( 0, 10000000 );
} );
// Fetch a list of all stockes
async function getstock() {
  let rawData = await fetch( "/api/productsXStores" );
  let stock = await rawData.json();
  let html = "";
  for ( let {
      id,
      productId,
      storeName,
      storeId,
      quantity
    } of stock ) {
    html += `
      <div class="stock">
        <h3> ${storeName}</h3>
        <p><b>Article number: </b> ${productId} </p>
        <p><b>Quantity: </b>${quantity} </p>        
        <p><button class="delete-button" id="delete-${id}" onclick="return confirm('Are you sure you want to Delete?');" >Delete</button></p>
         <p><button class="change-button" id="change-${id}">change stock details</button></p>
         <hr>
      </div>
    `;
  }
  let stockList = document.querySelector( ".stock-list" );
  stockList.innerHTML = html;
  // when we have fetched a list  scroll to the top of th screen
  window.scrollTo( 0, 0 );
}

// Load stockes from database and display
getstock();

// React on click on delete button
document.body.addEventListener( "click", async ( event ) => {
  let deleteButton = event.target.closest( ".delete-button" );
  if ( !deleteButton ) {
    return;
  }
  let idToDelete = deleteButton.id.slice( 7 );
  await fetch( "/api/productsXStores/" + idToDelete, {
    method: "DELETE",
  } );
  getstock();
} );

// React on click on change button
// populate the change form with the correct item
document.body.addEventListener( "click", async ( event ) => {
  let changeButton = event.target.closest( ".change-button" );
  if ( !changeButton ) {
    return;
  }
  let idTochange = changeButton.id.slice( 7 );
  // get the data to change
  let rawResult = await fetch( "/api/productsXStores/" + idTochange );
  let result = await rawResult.json();
  // fill and show the change forms base on the result/data
  let changeForm = document.querySelector( ".change-stockinfo-form" );
  // add the correct route / action to the form
  changeForm.setAttribute( "action", "/api/productsXStores/" + result.id );
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