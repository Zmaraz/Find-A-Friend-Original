/*
    adopt.js

    JS file for the adopt page, all code in this file is specific to the adopt page
*/

const picButton = document.getElementById('pic-button');
const picContainer = document.getElementById('pic-container');
const zipContainer = document.getElementById('zip-code');
const animalSelection = document.getElementById('animal-select');
const petIdContainer = document.getElementById('pet-id');
const petAgeContainer = document.getElementById('pet-age');
const petGenderContainer = document.getElementById('pet-gender');
const petIdButton = document.getElementById('pet-id-button');
const petIDSavedContainer = document.getElementById('id-saved-container');
const loginButton = document.getElementById('login-button');


window.onload = () => {
    picButton.addEventListener('click', getInfo);
    petIdButton.addEventListener('click', useSavedPetId);

    zipContainer.value = "";
    animalSelection.value = "";
    petAgeContainer.value = "";
    petGenderContainer.value = "";


    if (window.localStorage.loggedInUser) {
        loginButton.addEventListener('click', logout);
    } else if (!window.localStorage.loggedInUser) {
        loginButton.addEventListener('click', toLoginfromAdopt);
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
    let animalChoice = animalSelection.value;
    let petAge = petAgeContainer.value;
    let petGender = petGenderContainer.value;
    //console.log('animalChoice: ' + animalChoice); DEBUG

    let xhr = new XMLHttpRequest();

    //console.log('running pet.find to get a pet that fits the entered requirements')
    //URL for petfinder api's pet.find method
    xhr.open('GET', `http://api.petfinder.com/pet.find?key=013d2d36398cd0d335d4dcdf11f4f11c&animal=${animalChoice}&format=json&output=basic&location=${zipCode}&age=${petAge}&sex=${petGender}`, true);
    xhr.send();

    xhr.onreadystatechange = () => {
        //console.log(`xhr readyState: ${xhr.readyState}, and status: ${xhr.status}`); // DEBUG

        if (xhr.readyState == 4 && xhr.status == 200) {
            let response = JSON.parse(xhr.responseText);
            //console.log(response); // DEBUG

            let randoPet = Math.floor((Math.random() * response.petfinder.pets.pet.length) + 0);
            //console.log(randoPet);

            window.localStorage.setItem('currentPetShelterID', response.petfinder.pets.pet[randoPet].shelterId.$t);
            window.localStorage.setItem('currentPetID', response.petfinder.pets.pet[randoPet].id.$t);

            //tunnels through the response to get the proper data from petfinder api, wont show the data for any field that has no value
            if (response.petfinder.pets.pet[randoPet].media.photos.photo[2].$t)
                showImage(response.petfinder.pets.pet[randoPet].media.photos.photo[2].$t);
            if (response.petfinder.pets.pet[randoPet].name.$t)
                showName(response.petfinder.pets.pet[randoPet].name.$t);
            if (response.petfinder.pets.pet[randoPet].age.$t && response.petfinder.pets.pet[randoPet].animal.$t && response.petfinder.pets.pet[randoPet].sex.$t)
                showAge(response.petfinder.pets.pet[randoPet].age.$t, response.petfinder.pets.pet[randoPet].animal.$t, response.petfinder.pets.pet[randoPet].sex.$t, response.petfinder.pets.pet[randoPet].breeds.breed.$t);
            if (response.petfinder.pets.pet[randoPet].description.$t)
                showDescription(response.petfinder.pets.pet[randoPet].description.$t);
            if (response.petfinder.pets.pet[randoPet].id.$t && response.petfinder.pets.pet[randoPet].shelterId.$t) {
                showID(response.petfinder.pets.pet[randoPet].id.$t, response.petfinder.pets.pet[randoPet].shelterId.$t);
            }

            if (response.petfinder.pets.pet[randoPet].contact)
                showContact(response.petfinder.pets.pet[randoPet].contact);


            document.getElementById('pet-id-button').addEventListener('click', useSavedPetId);
        }
    }

    //console.log('leaving getInfo()'); // DEBUG
}
/* ------------------------------------------------------- */
function useSavedPetId() {
    petID = window.localStorage.petID;


    let xhr = new XMLHttpRequest();

    //console.log(`running pet.get to retrieve a specific pet: ${petID}`);
    //URL for petfinder api's pet.get method
    xhr.open('GET', `http://api.petfinder.com/pet.get?key=013d2d36398cd0d335d4dcdf11f4f11c&format=json&id=${petID}`, true);
    xhr.send();

    xhr.onreadystatechange = () => {
        //console.log(`xhr readyState: ${xhr.readyState}, and status: ${xhr.status}`); // DEBUG

        if (xhr.readyState == 4 && xhr.status == 200) {
            let response = JSON.parse(xhr.responseText);
            //console.log(response); // DEBUG
            window.localStorage.setItem('currentPetShelterID', response.petfinder.pet.shelterId.$t);

            //tunnels through the response to get the proper image for petfinder api
            if (response.petfinder.pet.media.photos.photo[2].$t)
                showImage(response.petfinder.pet.media.photos.photo[2].$t);
            if (response.petfinder.pet.name.$t)
                showName(response.petfinder.pet.name.$t);
            if (response.petfinder.pet.age.$t && response.petfinder.pet.animal.$t && response.petfinder.pet.sex.$t)
                showAge(response.petfinder.pet.age.$t, response.petfinder.pet.animal.$t, response.petfinder.pet.sex.$t);
            if (response.petfinder.pet.description.$t)
                showDescription(response.petfinder.pet.description.$t);
            if (response.petfinder.pet.contact)
                showContact(response.petfinder.pet.contact);
            if (response.petfinder.pet.id.$t, response.petfinder.pet.shelterId.$t)
                showID(response.petfinder.pet.id.$t, response.petfinder.pet.shelterId.$t);
        }
    }

}

//function that creates image and appends it to the page using the information retrieved in getInfo()
function showImage(imageSrc) {

    //remove any images from previous clicks
    while (picContainer.firstChild) {
        picContainer.removeChild(picContainer.firstChild);
    }

    //properly set the style of the animal zone, which by default has no styling so that the page will appear blank
    animalZoneStyle();

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

function showID(ID, shelterID) {
    while (document.getElementById('id-container').firstChild) {
        document.getElementById('id-container').removeChild(document.getElementById('id-container').firstChild);
    }
    while (petIDSavedContainer.firstChild) {
        petIDSavedContainer.removeChild(petIDSavedContainer.firstChild);
    }

    let IDheaderContainer = document.createElement('div');
    let IDheader = document.createElement('h3');
    IDheader.setAttribute('id', 'animal-id');
    IDheaderContainer.appendChild(IDheader);
    IDheaderContainer.setAttribute('id', 'ID-header-container');

    IDheader.innerHTML = `Pet ID, click to save: <button id="new-pet-id-button" name="${shelterID}" value="${ID}">${ID}, ${shelterID}</button>`;
    document.getElementById('id-container').appendChild(IDheader);

    document.getElementById('new-pet-id-button').addEventListener('click', saveId);
}

function saveId(e) {
    //console.log('in saveId');
    let ID = e.target.value;
    //console.log(ID);
    window.localStorage.setItem('petID', window.localStorage.currentPetID);

    window.localStorage.setItem('shelterID', window.localStorage.currentPetShelterID);

    //console.log(localStorage.petID);

    while (petIDSavedContainer.firstChild) {
        petIDSavedContainer.removeChild(petIDSavedContainer.firstChild);
    }

    let idSavedSpan = document.createElement('span');
    idSavedSpan.setAttribute('id', 'id-saved-span');
    idSavedSpan.innerHTML = `ID Saved!`;
    petIDSavedContainer.appendChild(idSavedSpan);
}

function showAge(age, animal, gender, breed) {
    let ageHeader = document.createElement('h3');
    ageHeader.setAttribute('id', 'animal-age');
    document.getElementById('age-container').appendChild(ageHeader);

    if (breed) {
        if (gender == 'F')
            document.getElementById('animal-age').innerHTML = `${age} Female ${breed}`;
        if (gender == 'M')
            document.getElementById('animal-age').innerHTML = `${age} Male ${breed}`;
    }
    else {
        if (gender == 'F')
            document.getElementById('animal-age').innerHTML = `${age} Female ${animal}`;
        if (gender == 'M')
            document.getElementById('animal-age').innerHTML = `${age} Male ${animal}`;
    }


}

function showDescription(description) {
    let descriptionParagraph = document.createElement('p');
    descriptionParagraph.setAttribute('id', 'animal-description');
    document.getElementById('description-container').appendChild(descriptionParagraph);

    document.getElementById('animal-description').innerHTML = description;
}

function showContact(contactInfo) {
    let city = 'N/A';
    let state = 'N/A';
    let contactZip = 'N/A';
    let email = 'N/A';
    let phone = 'N/A';

    if (contactInfo.city.$t)
        city = contactInfo.city.$t;
    if (contactInfo.state.$t)
        state = contactInfo.state.$t;
    if (contactInfo.zip.$t)
        contactZip = contactInfo.zip.$t;
    if (contactInfo.email.$t)
        email = contactInfo.email.$t;
    if (contactInfo.phone.$t)
        phone = contactInfo.phone.$t;

    let contactPararaph = document.createElement('p');
    contactPararaph.setAttribute('id', 'animal-contact');
    document.getElementById('contact-container').appendChild(contactPararaph);

    document.getElementById('animal-contact').innerHTML = `${city} ${state}, ${contactZip}<br/>Email: <a href="mailto:${email}">${email}</a><br/>Phone: ${phone}`;
}

function toLoginfromAdopt() {
    window.localStorage.setItem('loginCaller', 'adopt');
    window.location.href = './login.html';
}

function logout() {
    window.localStorage.setItem('loggedInUser', '');
    loginButton.innerText = 'Login';
    document.getElementById('current-user').innerText = "";
    loginButton.addEventListener('click', toLoginfromAdopt);
}

function animalZoneStyle() {
    document.getElementById('animal-zone').style.display = 'flex';
    document.getElementById('animal-zone').style.background = 'beige';
    document.getElementById('animal-zone').style.margin = '1em';
    document.getElementById('animal-zone').style['border-radius'] = '18px';
    document.getElementById('animal-zone').style.border = 'solid 1px black';
}