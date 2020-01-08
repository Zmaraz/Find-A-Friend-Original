/*
    index.js

    JS file for the index page, all code in this file is specific to the index page
*/

const picButton = document.getElementById('pic-button');
const picContainer = document.getElementById('pic-container');
const zipContainer = document.getElementById('zip-code');
const petIDSavedContainer = document.getElementById('id-message-container');
const loginButton = document.getElementById('login-button');


window.onload = () => {
    picButton.addEventListener('click', getInfo);

    if (window.localStorage.loggedInUser) {
        loginButton.addEventListener('click', logout);
    } else if (!window.localStorage.loggedInUser) {
        loginButton.addEventListener('click', toLoginfromHome);
    }

    if (window.localStorage.loggedInUser) {
        document.getElementById('current-user').innerHTML = "Logged in as: " + window.localStorage.loggedInUser;
        loginButton.innerText = "Logout";
    }

}
/* ------------------------------------------------------ */
//main AJAX function for retrieving info from API
function getInfo() {
    if(!zipContainer.value){
        alert('Please enter a ZIP code');
    }
    //console.log('in getInfo()'); // DEBUG

    //take in the users selection input
    let zipCode = zipContainer.value;
    //console.log('animalChoice: ' + animalChoice);

    let xhr = new XMLHttpRequest();

    //if the users inputs an ID, they will recieve that specific pet, if no ID is given, they will retrieve a pet that matches their requirements
    //console.log('running pet.find to get a pet that fits the entered requirements')
    //URL for petfinder api's pet.find method
    xhr.open('GET', `http://api.petfinder.com/pet.find?key=013d2d36398cd0d335d4dcdf11f4f11c&format=json&output=basic&location=${zipCode}`, true);
    xhr.send();

    xhr.onreadystatechange = () => {
        //console.log(`xhr readyState: ${xhr.readyState}, and status: ${xhr.status}`); // DEBUG

        if (xhr.readyState == 4 && xhr.status == 200) {
            let response = JSON.parse(xhr.responseText);
            //console.log(response); // DEBUG

            // message is the field in response that hold the image, this is unique to dog.ceo.api
            // createImage(response.message);
            let randoPet = Math.floor((Math.random() * response.petfinder.pets.pet.length) + 0);
            //tunnels through the response to get the proper image for petfinder api
            createImage(response.petfinder.pets.pet[randoPet].media.photos.photo[2].$t);
            showName(response.petfinder.pets.pet[randoPet].name.$t);
            showID(response.petfinder.pets.pet[randoPet].id.$t, response.petfinder.pets.pet[randoPet].shelterId.$t);
        }
    }
    //console.log('leaving getInfo()'); // DEBUG
}
/* ------------------------------------------------------- */
//function that creates image and appends it to the page using the information retrieved in getInfo()
function createImage(imageSrc) {

    //remove any images from previous clicks
    while (picContainer.firstChild) {
        picContainer.removeChild(picContainer.firstChild);
    }
    while (petIDSavedContainer.firstChild) {
        petIDSavedContainer.removeChild(petIDSavedContainer.firstChild);
    }


    let image = document.createElement('img');
    image.setAttribute('id', 'animal-picture');
    image.setAttribute('src', imageSrc);
    picContainer.appendChild(image);
}

function showName(name) {
    let nameContainer = document.createElement('h3');
    nameContainer.setAttribute('id', 'animal-name');
    document.getElementById('name-container').appendChild(nameContainer);
    document.getElementById('animal-name').innerHTML = name;
}

function showID(ID, shelter) {
    let IDheader = document.createElement('span');
    IDheader.setAttribute('id', 'animal-id');
    document.getElementById('id-container').appendChild(IDheader);

    document.getElementById('animal-id').innerHTML = `<button id="pet-id-button" value="${ID}" data-value="${shelter}">Click to Save Pet ID</button>`;
    document.getElementById('pet-id-button').addEventListener('click', saveId);
}
function saveId() {
    ID = document.getElementById('pet-id-button').value;

    shelter = document.getElementById('pet-id-button').getAttribute('data-value');

    //console.log(shelter);
    //console.log(ID);

    window.localStorage.setItem('shelterID', shelter);
    window.localStorage.setItem('petID', ID);
    //console.log(localStorage.petID);

    while (petIDSavedContainer.firstChild) {
        petIDSavedContainer.removeChild(petIDSavedContainer.firstChild);
    }

    let idSavedSpan = document.createElement('span');
    idSavedSpan.setAttribute('id', 'id-saved-span');
    idSavedSpan.innerHTML = `Pet ID Saved!`;
    petIDSavedContainer.appendChild(idSavedSpan);
}

function toLoginfromHome() {
    window.localStorage.setItem('loginCaller', 'index');
    window.location.href = './login.html';
}

function logout() {
    window.localStorage.setItem('loggedInUser', '');
    loginButton.innerText = 'Login';
    document.getElementById('current-user').innerText = "";
    loginButton.addEventListener('click', toLoginfromHome);
}