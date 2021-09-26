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
  document.querySelector( ".add-address-button" ).style.display = "block";
  // Now get all products again from the db
  await getaddresses();
} );


// Show form on button click
document.body.addEventListener( "click", ( event ) => {
  let addaddresseButton = event.target.closest( ".add-address-button" );
  if ( !addaddresseButton ) {
    return;
  }
  document.querySelector( ".add-address-form" ).style.display = "block";
  addaddresseButton.style.display = "none";
  window.scrollTo( 0, 10000000 );
} );
// Fetch a list of all addresses
async function getaddresses() {
  let rawData = await fetch( "/api/addresses" );
  let addresses = await rawData.json();
  let html = "";
  for ( let {
      id,
      streetName,
      streetNumber,
      zipCode,
      city,
      country,
      storeName,
    } of addresses ) {
    html += `
      <div class="address">
        <h3>${storeName}</h3>
          <p><b>Address Id: </b> ${id} </p>
        <p><b>Address:</b> ${streetName} ${streetNumber}, </p>
        <p>${zipCode} ${city}, ${country}</p>
        
        <p><button class="delete-button" id="delete-${id}" onclick="return confirm('Are you sure you want to Delete?');" >Delete</button></p>
         <p><button class="change-button" id="change-${id}">Edit address details</button></p>
         <hr>
      </div>
    `;
  }
  let addresseList = document.querySelector( ".list-of-addresses" );
  addresseList.innerHTML = html;

  // when we have fetched a list  scroll to the top of th screen
  window.scrollTo( 0, 0 );
}

// Load addresses from database and display
getaddresses();

// React on click on delete button
document.body.addEventListener( "click", async ( event ) => {
  let deleteButton = event.target.closest( ".delete-button" );
  if ( !deleteButton ) {
    return;
  }
  let idToDelete = deleteButton.id.slice( 7 );
  await fetch( "/api/addresses/" + idToDelete, {
    method: "DELETE",
  } );
  getaddresses();
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
  let rawResult = await fetch( "/api/addresses/" + idToChange );
  let result = await rawResult.json();
  // fill and show the change forms base on the result/data
  let changeForm = document.querySelector( ".change-address-form" );
  // add the correct route / action to the form
  changeForm.setAttribute( "action", "/api/addresses/" + result.id );
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