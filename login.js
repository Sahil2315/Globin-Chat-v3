let entry1 = document.getElementById('entry1')
let pass1 = document.getElementById('pass1')
let blogin = document.getElementById('blogin')

entry1.addEventListener('keypress', (event) => {
    if(event.key == "Enter"){
        blogin.click()
    }
})
pass1.addEventListener('keypress', (event) => {
    if(event.key == "Enter"){
        blogin.click()
    }
})

blogin.addEventListener('click', async() => {
    if(entry1.value != "" && pass1.value != ""){
        let logresp = await fetch('/loginreq', {
            'method' : 'POST', 
            'headers' : {
                'Content-Type': 'application/json'
            },
            'body' : JSON.stringify({
                'entry': entry1.value,
                'password': pass1.value
            })
        })
        let respjs = await logresp.json()
        if(respjs.login == "successful"){
            localStorage.setItem('user', JSON.stringify(respjs.user))
            window.location.href = window.location.origin + '/chatget'
        }else{
            alert("Login Unsuccessful\nPLease Enter Valid Credentials")
        }
    }else{
        alert("You Can't leave these fields empty")
    }
})