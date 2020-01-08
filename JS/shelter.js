/*
    shelter.js

    JS file for the shelter page, all code in this file is specific to the shelter page
*/

const shelterButton = document.getElementById('shelter-button');
const zipContainer = document.getElementById('zip-code');
const tableContainer = document.getElementById('table-container');
const petListTableContainer = document.getElementById('pet-list-table-container');
const petIDSavedContainer = document.getElementById('id-message-container');
const loginButton = document.getElementById('login-button');
const petIdButton = document.getElementById('pet-id-button');

window.onload = () => {
    shelterButton.addEventListener('click', getShelterInfo);
    petIdButton.addEventListener('click', createShelterTableFromSaved);

    zipContainer.value = "";

    if (window.localStorage.loggedInUser) {
        loginButton.addEventListener('click', logout);
    } else if (!window.localStorage.loggedInUser) {
        loginButton.addEventListener('click', toLoginfromShelter);
    }

    if (window.localStorage.loggedInUser) {
        document.getElementById('current-user').innerHTML = `Logged in as: ${window.localStorage.loggedInUser}`;
        loginButton.innerText = "Logout";
    }
}

function getShelterInfo() {
    if(!zipContainer.value){
        alert('Please enter a ZIP code');
    }
    //the ZIP code is the value of the input field at the time of the search button being pressed
    let zipCode = zipContainer.value;

    //create a new request to the API, and insert the ZIP code provided by the user into the URL
    let xhr = new XMLHttpRequest();
    xhr.open('GET', `http://api.petfinder.com/shelter.find?key=013d2d36398cd0d335d4dcdf11f4f11c&format=json&location=${zipCode}`, true);
    xhr.send();

    //each time the readystate of the xhr changes, check for the appropriate readystate and status code, and then parse the responsetext
    xhr.onreadystatechange = () => {
        if (xhr.readyState == 4 && xhr.status == 200) {
            let response = JSON.parse(xhr.responseText);

            //call the function that created the table on the page, and pass it the info it needs to populate that table
            createTable(response.petfinder.shelters);
            console.log(response);
        }
    }
}

function createTable(response) {

    //remove all elements that may have been generated and left by previous calls of this function
    while (tableContainer.firstChild) {
        tableContainer.removeChild(tableContainer.firstChild);
    }
    while (petListTableContainer.firstChild) {
        petListTableContainer.removeChild(petListTableContainer.firstChild);
    }
    while (petIDSavedContainer.firstChild) {
        petIDSavedContainer.removeChild(petIDSavedContainer.firstChild);
    }

    //create an array to store each value that will be used in the tables <td> tags
    let shelterNameArray = [];
    let shelterPhoneArray = [];
    let shelterEmailArray = [];
    let shelterIdArray = [];
    let shelterCityArray = [];
    let shelterStateArray = [];
    let shelterZipArray = [];
    let shelterLatitudeArray = [];
    let shelterLongitudeArray = [];

    //iterate through each shelter in the response and assign its values to their own arrays
    for (let i = 0; i < response.shelter.length; i++) {
        if (response.shelter[i].name.$t)
            shelterNameArray[i] = response.shelter[i].name.$t;
        else
            shelterNameArray[i] = 'None Available';
        if (response.shelter[i].phone.$t)
            shelterPhoneArray[i] = response.shelter[i].phone.$t;
        else
            shelterPhoneArray[i] = 'None Available';
        if (response.shelter[i].email.$t)
            shelterEmailArray[i] = response.shelter[i].email.$t;
        else
            shelterEmailArray[i] = 'None Available';
        if (response.shelter[i].id.$t)
            shelterIdArray[i] = response.shelter[i].id.$t;
        else
            shelterIdArray[i] = 'None Available';
        if (response.shelter[i].city.$t)
            shelterCityArray[i] = response.shelter[i].city.$t;
        else
            shelterCityArray[i] = 'None Available';
        if (response.shelter[i].state.$t)
            shelterStateArray[i] = response.shelter[i].state.$t;
        else
            shelterStateArray[i] = 'None Available';
        if (response.shelter[i].zip.$t)
            shelterZipArray[i] = response.shelter[i].zip.$t;
        else
            shelterZipArray[i] = 'None Available';
        if (response.shelter[i].latitude.$t && response.shelter[i].longitude.$t) {
            shelterLatitudeArray[i] = response.shelter[i].latitude.$t;
            shelterLongitudeArray[i] = response.shelter[i].longitude.$t;
        } else {
            shelterLatitudeArray[i] = '';
            shelterLongitudeArray[i] = '';
        }


    }

    //create and add the table elements to the page
    let resultsTable = document.createElement('table');
    let resultsTableHeader = document.createElement('thead');
    let resultsTableBody = document.createElement('tbody');

    tableContainer.appendChild(resultsTable);
    resultsTable.appendChild(resultsTableHeader);
    resultsTable.appendChild(resultsTableBody);

    //create the head section of the table
    resultsTableHeader.innerHTML = "<th>Name</th><th>Address</th><th>Phone</th><th>Email</th><th>Shelter ID</th>";

    //iterate through all the shelters in the response and create a new row to be appended to the table
    for (let i = 0; i < response.shelter.length; i++) {
        let newRow = document.createElement('tr');

        //insert the appropriate data from the eariler arrays into each row
        newRow.innerHTML = `
        <td><button id="shelterNameButton${i}"class="shelterNameButton"value="${shelterIdArray[i]}"data-value="${shelterNameArray[i]}">
            ${shelterNameArray[i]}</button></td>    
        
        <td><a href="https://www.google.com/maps?q=${shelterLatitudeArray[i]},${shelterLongitudeArray[i]}" target="_blank">
            ${shelterCityArray[i]} ${shelterStateArray[i]}, ${shelterZipArray[i]}</a></td>
        
        <td>${shelterPhoneArray[i]}</td>
        
        <td><a href="mailto:${shelterEmailArray[i]}">${shelterEmailArray[i]}</a></td><td>${shelterIdArray[i]}</td>`;

        //append the new row to the table
        resultsTableBody.appendChild(newRow);

        //this event listener launches the method for creating a pet list of the invoking shelter name button
        document.getElementById(`shelterNameButton${i}`).addEventListener('click', createShelterTable);
    }
}

//creates the shelters specific Pet list 
async function createShelterTable(e) {
    //console.log('in createShelterTable()'); //DEBUG

    while (petListTableContainer.firstChild) {
        petListTableContainer.removeChild(petListTableContainer.firstChild);
    }
    while (petIDSavedContainer.firstChild) {
        petIDSavedContainer.removeChild(petIDSavedContainer.firstChild);
    }


    window.localStorage.setItem('shelterID', e.target.value);

    let shelterPetList = await shelterGet();

    //console.log('back in createShelterTable'); // DEBUG
    //console.log(shelterPetList); // DEBUG

    let petNameArray = [];
    let petTypeArray = [];
    let petAgeArray = [];
    let petIDArray = [];

    //iterate through the pet array in the response and assign its values to their own arrays    
    for (let i = 0; i < shelterPetList.length; i++) {
        if (shelterPetList[i].name.$t)
            petNameArray[i] = shelterPetList[i].name.$t;
        else
            petNameArray[i] = 'None Available';
        if (shelterPetList[i].animal.$t)
            petTypeArray[i] = shelterPetList[i].animal.$t;
        else
            petTypeArray[i] = 'None Available';
        if (shelterPetList[i].age.$t)
            petAgeArray[i] = shelterPetList[i].age.$t;
        else
            petAgeArray[i] = 'None Available';
        if (shelterPetList[i].id.$t)
            petIDArray[i] = shelterPetList[i].id.$t;
    }
    //console.log(petNameArray); // DEBUG
    //console.log(petTypeArray); // DEBUG
    //console.log(petAgeArray); // DEBUG
    //console.log(petIDArray); // DEBUG

    //create and add pet list table ements to page
    let petListTable = document.createElement('table');
    let petListTableHeader = document.createElement('thead');
    let petListTableBody = document.createElement('tbody');

    petListTableContainer.appendChild(petListTable);
    petListTable.appendChild(petListTableHeader);
    petListTable.appendChild(petListTableBody);

    //create the header section of the pet list table
    petListTableHeader.innerHTML = `<th colspan="3">${window.localStorage.shelterName} Animal List</th>`;

    //create new rows and dynamically add them to the table
    for (let i = 0; i < shelterPetList.length; i++) {
        let newRow = document.createElement('tr');
        newRow.innerHTML = `<td><button id="petIdButton${i}" value="${petIDArray[i]}">${petNameArray[i]}</button></td><td>${petTypeArray[i]}</td><td>${petAgeArray[i]}</td>`;
        petListTableBody.appendChild(newRow);

        document.getElementById(`petIdButton${i}`).addEventListener('click', savePetId);
    }
}

//async function to request a shelters pet list from the API
async function shelterGet() {
    //console.log('in shelterGet()'); //DEBUG

    let shelterID = window.localStorage.shelterID;
    //console.log(shelterID)

    let petResponse = await fetch(`http://api.petfinder.com/shelter.getPets?key=013d2d36398cd0d335d4dcdf11f4f11c&format=json&id=${shelterID}`);
    let petData = await petResponse.json();
    //console.log(petData); //DEBUG

    let shelterResponse = await fetch(`http://api.petfinder.com/shelter.get?key=013d2d36398cd0d335d4dcdf11f4f11c&format=json&id=${shelterID}`);
    let shelterData = await shelterResponse.json();
    //console.log(shelterData); //DEBUG

    //console.log('setting shelterName from shelterData response');

    window.localStorage.setItem('shelterName', shelterData.petfinder.shelter.name.$t);

    return petData.petfinder.pets.pet;
}

async function createShelterTableFromSaved() {
    //console.log('in createShelterTableFromSaved()'); //DEBUG

    while (tableContainer.firstChild) {
        tableContainer.removeChild(tableContainer.firstChild);
    }
    while (petListTableContainer.firstChild) {
        petListTableContainer.removeChild(petListTableContainer.firstChild);
    }
    while (petIDSavedContainer.firstChild) {
        petIDSavedContainer.removeChild(petIDSavedContainer.firstChild);
    }

    let shelterPetList = await shelterGetFromSaved();

    //console.log('back in createShelterTableFromSaved'); // DEBUG
    //console.log(shelterPetList); // DEBUG

    let petNameArray = [];
    let petTypeArray = [];
    let petAgeArray = [];
    let petIDArray = [];

    //iterate through the pet array in the response and assign its values to their own arrays    
    for (let i = 0; i < shelterPetList.length; i++) {
        if (shelterPetList[i].name.$t)
            petNameArray[i] = shelterPetList[i].name.$t;
        else
            petNameArray[i] = 'None Available';
        if (shelterPetList[i].animal.$t)
            petTypeArray[i] = shelterPetList[i].animal.$t;
        else
            petTypeArray[i] = 'None Available';
        if (shelterPetList[i].age.$t)
            petAgeArray[i] = shelterPetList[i].age.$t;
        else
            petAgeArray[i] = 'None Available';
        if (shelterPetList[i].id.$t)
            petIDArray[i] = shelterPetList[i].id.$t;
    }
    //console.log(petNameArray); // DEBUG
    //console.log(petTypeArray); // DEBUG
    //console.log(petAgeArray); // DEBUG
    //console.log(petIDArray); // DEBUG

    //create and add pet list table ements to page
    let petListTable = document.createElement('table');
    let petListTableHeader = document.createElement('thead');
    let petListTableBody = document.createElement('tbody');

    petListTableContainer.appendChild(petListTable);
    petListTable.appendChild(petListTableHeader);
    petListTable.appendChild(petListTableBody);

    //create the header section of the pet list table
    petListTableHeader.innerHTML = `<th colspan="3">${window.localStorage.shelterName} Animal List</th>`;

    //create new rows and dynamically add them to the table
    for (let i = 0; i < shelterPetList.length; i++) {
        let newRow = document.createElement('tr');
        newRow.innerHTML = `<td><button id="petIdButton${i}" value="${petIDArray[i]}">${petNameArray[i]}</button></td><td>${petTypeArray[i]}</td><td>${petAgeArray[i]}</td>`;
        petListTableBody.appendChild(newRow);

        document.getElementById(`petIdButton${i}`).addEventListener('click', savePetId);
    }
}

async function shelterGetFromSaved() {
    //console.log('in shelterGetFromSaved()'); //DEBUG

    let shelterID = window.localStorage.shelterID;
    //console.log(shelterID)

    let petResponse = await fetch(`http://api.petfinder.com/shelter.getPets?key=013d2d36398cd0d335d4dcdf11f4f11c&format=json&id=${shelterID}`);
    let petData = await petResponse.json();
    //console.log(petData); //DEBUG



    let shelterResponse = await fetch(`http://api.petfinder.com/shelter.get?key=013d2d36398cd0d335d4dcdf11f4f11c&format=json&id=${shelterID}`);
    let shelterData = await shelterResponse.json();
    //console.log(shelterData); //DEBUG

   //console.log('setting shelterName from shelterData response');

    window.localStorage.setItem('shelterName', shelterData.petfinder.shelter.name.$t);
    //shelterPetsGet(petData.petfinder.pets);

    return petData.petfinder.pets.pet;
}

function savePetId(e) {
    let ID = e.target.value;
    //console.log(ID); // DEBUG

    window.localStorage.setItem('petID', ID);

    let idSavedSpan = document.createElement('span');
    idSavedSpan.setAttribute('id', 'id-saved-span');

    while (petIDSavedContainer.firstChild) {
        petIDSavedContainer.removeChild(petIDSavedContainer.firstChild);
    }

    idSavedSpan.innerHTML = `Pet ID Saved!`;
    petIDSavedContainer.appendChild(idSavedSpan);
}

function toLoginfromShelter() {
    window.localStorage.setItem('loginCaller', 'shelter');
    window.location.href = './login.html';
}

function logout() {
    window.localStorage.setItem('loggedInUser', '');
    loginButton.innerText = 'Login';
    document.getElementById('current-user').innerText = "";
    loginButton.addEventListener('click', toLoginfromShelter);
}