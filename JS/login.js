let userName = document.getElementById('userName').value;
let pass = document.getElementById('pass').value;

let userNameValid = false;
let passValid = false;
let valid = false;

window.onload = () => {
    userName = '';
    pass = '';
    document.getElementById('registerButton').addEventListener('click', getLogin);

    document.getElementById('userName').addEventListener('input', checkValue);
    document.getElementById('pass').addEventListener('input', checkValue);
}

//will return true if input is not empty
function checkValue(event) {
    let id = event.target.id;
    //console.log("id");
    let inputValue = document.getElementById(id).value;
    //console.log(userName);

    if (inputValue != '') {
        if (id == 'userName')
            userNameValid = true;
        else if (id == 'pass')
            passValid = true;

    } else {
        if (id == 'userName')
            userNameValid = false;
        else if (id == 'pass')
            passValid = false;
    }
    checkDisabled();
}


function checkDisabled() {
    if (userNameValid == true && passValid == true) {
        valid = true;
    }
    else {
        valid = false;
    }

    if (valid == true) {
        document.getElementById('registerButton').disabled = false;
    }
    else if (valid == false) {
        document.getElementById('registerButton').disabled = true;
    }
}

function backToLoginCaller() {


    let un = document.getElementById('userName').value;
    //console.log('in backtoloagin');

    window.localStorage.setItem('loggedInUser', un);
    window.location.href = `../HTML/${window.localStorage.loginCaller}.html`;
}

function getLogin() {
    //console.log('in getLogin');
    let xhr = new XMLHttpRequest;
    xhr.open('GET', 'https://api.myjson.com/bins/ec2l8', true);
    xhr.send();

    xhr.onreadystatechange = () => {
        if (xhr.readyState == 4 && xhr.status == 200) {
            let userDetails = JSON.parse(xhr.responseText);
            //console.log(userDetails);
            checkLogin(userDetails);
        }
    }
}

function checkLogin(userDetails) {
    let invalidCredentials = false;
    //console.log('in checkLogin');
    //console.log(userDetails.length);
    for (i = 0; i < userDetails.length; i++) {
        if (document.getElementById('userName').value == userDetails[i].username) {
            if (document.getElementById('pass').value == userDetails[i].password) {
                //console.log("valid info");
                invalidCredentials = false;
                backToLoginCaller();
                break;
            } else {
                invalidCredentials = true;
            }
        } else {
            invalidCredentials = true;
        }

    }
    if (invalidCredentials) {
        //console.log('invalid credentials');
        window.alert('Invalid credentials, please try again');
    }
}