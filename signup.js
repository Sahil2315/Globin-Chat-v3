let uname = document.getElementById('uname')
let email = document.getElementById('email')
let passw = document.getElementById('passw')
let passc = document.getElementById('passc')

let bsignup = document.getElementById('bsignup')

bsignup.addEventListener('click', () => {
    SignupFunction()
})
passc.addEventListener('keypress',(event) => {
    if(event.key == "Enter"){
        SignupFunction()
    }
})

let SignupFunction = async () => {
    if(uname.value!="" && email.value!="" && passw.value!="" && passc.value!=""){
        if(passw.value == passc.value){
            fetch('/signupFunction', {
                'method': 'POST',
                'headers': {
                    'Content-Type': 'application/json'
                },
                'body': JSON.stringify({
                    'uname': uname.value,
                    'email': email.value,
                    "password": passw.value
                })
            }).then(response => response.json()).then(data => {
                if(data.signup == 'successful'){
                    if(confirm("Signup Successful!\nDo you want to Continue to the Login Page")){
                        window.location.href = window.location.origin + '/'
                    }
                }
            })
        }
        else{
            alert("These Passwords don't Match")
        }
    }
}
