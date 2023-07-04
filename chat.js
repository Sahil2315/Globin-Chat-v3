let msgtext = document.getElementById('msgtext')
let msgarea = document.getElementById('msgarea')
let sender = document.getElementById('sender')
const user = JSON.parse(localStorage.getItem('user'))
let chatsdiv = document.getElementById('chats')

let msgr = document.getElementById('srchmsgr')
let rslt = document.getElementById('srchresult')

msgr.addEventListener('keyup', async () => {
    if(msgr.value != "" && msgr.value != " "){
        let messager = await fetch('/searchmessager', {
            'method': "POST",
            'headers': {
                'Content-Type': 'application/json'
            },
            'body': JSON.stringify({
                'entry': msgr.value
            })
        })
        let mjs = await messager.json()
        if(mjs.value == 'none'){
            rslt.innerHTML = `<h3>No Such Entries</h3>`
        }else{
            for(let i=0; i<mjs.value.length; i++){
                if(mjs.value[i].uid == user.userid){
                    rslt.innerHTML = 
                    `   <div style ="background-color: rgba(0,0,0,0.5)">
                            <span>Name: ${mjs.value[i].uname}</span>
                            <span>#${1000 + mjs.value[i].uid}</span>
                        </div>
                        <hr>
                    `
                }else{
                    rslt.innerHTML = 
                    `   <div onclick = "selecterFunction([${mjs.value[i].uid}, '${mjs.value[i].uname}', '${picornot(mjs.value[i].profilepic)}', '${mjs.value[i].aboutme}', ${mjs.useronline}])">
                            <span>Name: ${mjs.value[i].uname}</span>
                            <span>#${1000 + mjs.value[i].uid}</span>
                        </div>
                        <hr>
                    `
                }
            }
        }
    }else{
        rslt.innerHTML = ''
    }
})

let picornot = (prop) => {
    if(prop == 'nopic'){
        return 'Group 3.png'
    }
    else{
        return prop
    }
}

let selecterFunction = async (user) => {
    flag = false
    let divarr = document.getElementsByClassName('chatname')
    for (let i=0; i < divarr.length; i++){
        if(user[1] == divarr[i].textContent){
            divselecter(user)
            flag = true
            break
        }
    }
    if(flag == false){
        chatsdiv.insertAdjacentHTML(`afterbegin`, `            
            <div class = "chatsdiv" onclick = "divselecter([${user[0]}, '${user[1]}', '${picornot(user[2])}', '${user[3]}'])">
            <div class="imageAndStatus">
            <div class="userpic ${OnlineTell(user[4])}">
                <img class="smolimg" src = "${picornot(user[2])}"/>
            </div>
        </div>
        <div class = "chatname">${user[1]}</div> 
            </div>
        `)
        divselecter(user)
    }
}

let OnlineTell = (bool) => {
    if(bool){
        return "online-yes"
    }
    else{
        return "online-no"
    }
}

let selfimg = document.getElementById('profilePicture1')

let deletePhoto = async () => {
    fetch('/deleteProfilePic', {
        'method': 'GET',
        'headers': {
            'Content-Type': 'application/json'
        }
    }).then(resp => resp.json())
    .then((data) => {
        if(data.status == 'success'){
            selfimg.src = "/Group 3.png"
            selfimg3.src = "/Group 3.png"
        }
    })
}

let chatinfo = document.getElementById('chatinfo')

const changePhoto = document.getElementById('changePhoto')
const uploader = document.getElementById('uploader')
const imgupload = document.getElementById('imgupload')
const imageDiv = document.getElementById('imagediv')

let tfinput = () => {
    imgupload.click()
}

imgupload.onchange = async () => {
    let sendable = imgupload.files[0]
        const formData = new FormData();
        formData.append('image', sendable);
        fetch('/upload', {
            method: 'POST',
            body: formData,
        })
            .then(response => response.json())
            .then(data => {
                selfimg.src = data.url
                selfimg3.src = data.url
            })
            .catch(error => {
            console.error('File upload failed:', error);
            // Handle any errors that occur during the upload
            });
}

let aboutfn = (prop) => {
    if(prop == null || prop == 'null'){
        return ''
    }
    else{
        return `${prop}`
    }
}

let imgdiv3 = document.getElementById('imagediv3')

let info1 = document.getElementById('info1')
let info2 = document.getElementById('info2')
let info3 = document.getElementById('info3')

window.addEventListener('load', async () => {
    let chats = await fetch('/getprev', {
        'method': 'GET',
        'headers': {
            'Content-Type': 'application/json'
        }
    })
    let chatsjs = await chats.json()
    for(let i=0;i <chatsjs.chats.length; i++){
        let selectdiv = document.createElement('div')
        if(chatsjs.chats[i].profilepic == 'nopic'){
            selectdiv.innerHTML = `            
            <div class = "chatsdiv" onclick = "divselecter([${chatsjs.chats[i].uid}, '${chatsjs.chats[i].uname}', 'Group 3.png', '${chatsjs.chats[i].aboutme}'])"> 
                <div class="imageAndStatus">
                    <div class="userpic ${OnlineTell(chatsjs.chats[i].online)}">
                        <img class="smolimg" src = "Group 3.png"/>
                    </div>
                </div>
                <div class = "chatname">${chatsjs.chats[i].uname}</div> 
            </div>
            `
        }
        else{
            selectdiv.innerHTML = `            
            <div class = "chatsdiv" onclick = "divselecter([${chatsjs.chats[i].uid}, '${chatsjs.chats[i].uname}', '${chatsjs.chats[i].profilepic}', '${chatsjs.chats[i].aboutme}'])"> 
                <div class="imageAndStatus">
                    <div class="userpic ${OnlineTell(chatsjs.chats[i].online)}">
                        <img class="smolimg" src = "${chatsjs.chats[i].profilepic}"/>
                    </div>
                </div>
                <div class = "chatname">${chatsjs.chats[i].uname}</div> 
            </div>
            `
        }
        chatsdiv.appendChild(selectdiv)
    }
    let userProfile = await fetch('/getprofile', {
        'method': 'GET',
        'headers': {
            'Content-Type': 'application/json'
        }
    })
    let profilejs = await userProfile.json()
    
    info3.insertAdjacentHTML('beforeend', `
        <div id = "selfinfodiv"> 
        <div class="imageAndStatus">
            <div class="userpic ">
                <img id="selfimg3" class="smolimg" src = "Group 3.png"/>
            </div>
        </div>
        <div class = "chatname">${profilejs.profile.uname}</div> 
    </div>
    `)
    let selfimg3 = document.getElementById('selfimg3')
    if(profilejs.profile.profilepic != null){
        selfimg.src = profilejs.profile.profilepic
        selfimg3.src = profilejs.profile.profilepic
    }

    info1.insertAdjacentHTML('beforeend', `
        <div class = "profileInfo">
            <div>
            ${profilejs.profile.uname}  
            </div>
            <div>
            #${1000 + profilejs.profile.uid}
            </div>
            <div id="about-div1" class="about-div">${aboutfn(profilejs.profile.aboutme)}</div>
            <input type="text" placeholder="Edit Status" id="ch-about1" class="change-about">
        </div>
    `)
    info1.style.display = 'none'
    let imgtoggle = false

    info3.addEventListener('click', () => {
        if(!imgtoggle){
            info1.style.display = ''
            imgtoggle = true
        }else{
            info1.style.display = 'none'
            imgtoggle = false
        }
    })

    let aboutEditor1 = document.getElementById('ch-about1')
    let aboutDiv1 = document.getElementById('about-div1')

    aboutEditor1.addEventListener('keypress', (event) => {
        if(event.key == "Enter" && aboutEditor1.value != "" && aboutEditor1.value != " "){
            changeAboutMe(aboutEditor1.value)
        }
    })
    let changeAboutMe = async(prop) => {
        fetch('/changeAbout', {
            'method':'POST',
            'headers': {
                'Content-Type': 'application/json'
            },
            'body': JSON.stringify({
                'entry': prop
            })
        }).then(response => response.json()).then(data => {
            if(data.changed == 'success'){
                aboutDiv1.textContent = prop
                aboutEditor1.value = ''
                aboutEditor1.blur()
            }
        })
    }
})

const socket = io.connect('https://globin-chat.onrender.com', { transports : ['websocket'] });
socket.on('hands', (first) => {
    socket.emit('user', user)
})
socket.on('nmessage', (msg) => {
    if(currentchat != null && msg.fromname == currentchat[1]){
        msgarea.insertAdjacentHTML('beforeend', `
            <div class="receivedmsg">${msg.cont}</div>
        `)
        msgarea.scrollTop = 10000
    }
    else{
        let divarr = document.getElementsByClassName('chatname')
        let htmlcurr = null
        for(let i=0; i< divarr.length; i++){
            if(msg.fromname == divarr[i].textContent){
                htmlcurr = divarr[i].parentElement
                divarr[i].parentElement.remove()
            }
        }
        if(htmlcurr){
            let notifier = htmlcurr.querySelector('.notif')
            if(notifier){
                let msgnumber = notifier.querySelector('span')
                msgnumber.textContent = parseInt(msgnumber.textContent) + 1
            }
            else{
                htmlcurr.insertAdjacentHTML('beforeend', `
                <div class="notif">
                    <svg width="25" height="25" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="9" cy="9" r="9" fill="#FF4D00"/>
                    </svg>
                    <span>1</span>
                </div>
                `)    
            }
        }
        else{
            htmlcurr = document.createElement('div')
            htmlcurr.classList.add('chatsdiv')
            fetch('/getNewUser', {
                'method': 'POST',
                'headers': {
                    'Content-Type': 'application/json'
                },
                'body': JSON.stringify({
                    'uid': msg.fromid
                }) 
            }).then(resp => resp.json())
            .then(data => {
                htmlcurr.addEventListener('click', () => {
                    divselecter([msg.fromid, msg.fromname, data.user.profilepic, data.user.aboutme])
                })
                htmlcurr.innerHTML = `
                    <div class="imageAndStatus">
                        <div class="userpic ${OnlineTell(true)}">
                            <img class="smolimg" src = "${picornot(data.user.profilepic)}"/>
                        </div>
                    </div>
                    <div class = "chatname">${msg.fromname}</div> 
                    <div class="notif">
                        <svg width="25" height="25" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="9" cy="9" r="9" fill="#FF4D00"/>
                        </svg>
                        <span>1</span>
                    </div>
                `
            })
        }
        chatsdiv.insertAdjacentElement('afterbegin', htmlcurr)
    }
    
})
socket.on("usercon", (user) => {
    let divarr = document.getElementsByClassName('chatname')
    for (let i=0; i < divarr.length; i++){
        if(user == divarr[i].textContent){
            let changeBorder = divarr[i].parentElement.getElementsByClassName('imageAndStatus')[0].getElementsByClassName('userpic')[0]
            changeBorder.classList.remove('online-no')
            changeBorder.classList.add('online-yes')
            break
        }
    }
})

socket.on("userdis", (user) => {
    let divarr = document.getElementsByClassName('chatname')
    for (let i=0; i < divarr.length; i++){
        if(user == divarr[i].textContent){
            let changeBorder = divarr[i].parentElement.getElementsByClassName('imageAndStatus')[0].getElementsByClassName('userpic')[0]
            changeBorder.classList.remove('online-yes')
            changeBorder.classList.add('online-no')
            break
        }
    }
})

let currentchat = null

let homer = `
    <div style = "padding:50px; color:white; display:flex; flex-direction:column;">
        <span style = "margin-top:40px; font-size:40px; font-weight: 600; text-shadow: 1px 1px 4px rgba(255,255,255,0.7);">Welcome to Globin Chat! </span>
        <span style = "margin-top:30px; line-height:1.7; font-size:30px; text-shadow: 1px 1px 3px rgba(255,255,255,0.8);">Start Chatting by Selecting one of Your Chats or Search for a New Person to Chat with.</span>
    </div>
`

msgarea.innerHTML = homer
msgtext.style.display = 'none'
sender.style.display = 'none'

let msgarea1 = document.getElementById('msgarea1')


let divselecter = async (centity) => {
    let media2 = window.matchMedia('(min-width: 1100px)')
    const media3 = window.matchMedia('(min-width: 900px)')
    if(media2.matches){
        chatinfo.style.display = 'flex'
        chatinfo.style.width = '220px'
        msgarea1.style.width = 'calc(98% - 220px)'
    }
    else if(media3.matches){
        chatinfo.style.display = 'flex'
        chatinfo.style.width = '170px'
        msgarea1.style.width = 'calc(98% - 170px)'
    }
    if(mediaQuery.matches){
        chatsouter.style.transform = 'translateX(-300px)'
        infodiv.style.display = 'none'
        opened = false
    }
    if(currentchat == null){
        msgtext.style.display = ''
        sender.style.display = ''
    }else{
        if(currentchat[0] == centity[0]){
            return
        }
    }
    let divarr = document.getElementsByClassName('chatname')
    for(let i=0; i< divarr.length; i++){
        if(divarr[i].textContent == centity[1]){
            let notifier = divarr[i].parentElement.querySelector('.notif')
            if(notifier){
                notifier.parentNode.removeChild(notifier)
            }
            divarr[i].parentElement.style.background = "rgba(0, 0, 0, 0.24)"
            info2.innerHTML = `
                <div id= 'imagediv2'>
                    <img class = "profilePicture" src="${centity[2]}"/>
                </div>
                <div class = "profileInfo">
                    <div>
                    ${centity[1]}  
                    </div>
                    <div>
                    #${1000 + centity[0]}
                    </div>
                    <div id="about-div1" class="about-div">${aboutfn(centity[3])}</div>
                </div>

            `
            continue
        }
        divarr[i].parentElement.style.background = ""
    }
    msgarea.innerHTML = `
        <div style="height:100%; width:100%; display:flex; align-items:center; justify-content:center;">
            <svg id="loadercircle" width="120" height="120" viewBox="0 0 88 88" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="44" cy="44" r="31.5" stroke="url(#paint0_radial_0_1)" stroke-width="25"/>
                <path d="M40.5677 5L49.3647 11.566L42.4763 18.8151" stroke="black" stroke-width="5"/>
                <path d="M58.7807 7.25996L65.737 15.7517L57.3052 21.128" stroke="black" stroke-width="5"/>
                <path d="M22.574 10.0677L32.7175 14.2641L27.8273 22.9868" stroke="black" stroke-width="5"/>
                <defs>
                <radialGradient id="paint0_radial_0_1" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(44 44) rotate(90) scale(44)">
                <stop offset="0.401042" stop-color="#00FFC2" stop-opacity="0"/>
                <stop offset="0.5" stop-color="#00FFC2"/>
                <stop offset="0.739583" stop-color="#00F0FF" stop-opacity="0.71"/>
                <stop offset="1" stop-color="#00F0FF" stop-opacity="0.05"/>
                </radialGradient>
                </defs>
            </svg>
        </div>`
    currentchat = centity
    let respchat = await fetch('/whichchat', {
        'method': 'POST',
        'headers': {
            'Content-Type': 'application/json'
        },
        'body': JSON.stringify({
            'entity': centity[1]
        })
    })
    function sleep(ms) {
        return new Promise((resolve) => {
          setTimeout(resolve, ms);
        });
    }
    let rcjs = await respchat.json().then(await sleep(500)).then(msgarea.innerHTML='')
    for(let i=rcjs.messages.length -1; i>= 0; i--){
        if(rcjs.messages[i].sendid == user.userid){
            msgarea.insertAdjacentHTML('beforeend', `
                <div class="sentmsg">${rcjs.messages[i].content}</div>
            `)
        }
        else{
            msgarea.insertAdjacentHTML('beforeend', `
                <div class="receivedmsg">
                    ${rcjs.messages[i].content}
                </div>
            `)
        }
    }
    msgarea.scrollTop = 10000
}

sender.addEventListener('click', () => {
    if(msgtext.value.replace(" ", '') != '' && msgtext.value.replace(" ", '') != '' && currentchat != null){
        socket.emit('newmsg', {
            'msgcont': msgtext.value,
            'msgto': currentchat[0],
            'toname': currentchat[1]
        })
        msgarea.insertAdjacentHTML('beforeend', `
            <div class="sentmsg">${msgtext.value}</div>
        `)
        msgtext.value = ''
        msgarea.scrollTop = 10000

        let divarr = document.getElementById('')
    }
})

msgtext.addEventListener('keypress', (event) => {
    if(event.key == "Enter"){
        if(msgtext.value.replace(" ", '') != '' && msgtext.value.replace(" ", '') != '' && currentchat != null){
            socket.emit('newmsg', {
                'msgcont': msgtext.value,
                'msgto': currentchat[0],
                'toname': currentchat[1]
            })
            msgarea.insertAdjacentHTML('beforeend', `
                <div class="sentmsg">${msgtext.value}</div>
            `)
            msgtext.value = ''
            msgarea.scrollTop = 10000
            
            let divarr = document.getElementsByClassName('chatname')
            let htmlcurr
            for (let i=0; i< divarr.length; i++){
                if (divarr[i].textContent == currentchat[1]){
                    htmlcurr = divarr[i].parentElement
                    divarr[i].parentElement.remove()
                }
            }
            chatsdiv.insertAdjacentElement('afterbegin', htmlcurr)
        }
    }
})

const mediaQuery = window.matchMedia('(max-width: 650px)')

let infodiv = document.getElementById('info-div')
let opened = false
if(mediaQuery.matches){
    let chatsouter = document.getElementById('chatsouter')
    let startpoint = 0
    let endpoint = 0
    msgarea.innerHTML =
    `<div style = "padding:10px; color:white; display:flex; flex-direction:column;">
        <span style = "margin-top:40px; font-size:20px; font-weight: 600; text-shadow: 1px 1px 3px rgba(255,255,255,0.7);">Welcome to Globin Chat! </span>
        <span style = "margin-top:30px; line-height:1.7; font-size:15px; text-shadow: 1px 1px 2px rgba(255,255,255,0.8);">Swipe Right to begin Chatting.</span>
    </div>`
    document.addEventListener('touchstart', e => {
        startpoint = e.changedTouches[0].screenX
    })
    document.addEventListener('touchend', e => {
        endpoint = e.changedTouches[0].screenX
        if(endpoint > startpoint+100 && opened == false){
            chatsouter.style.transform = 'translateX(0px)'
            infodiv.style.display = 'block'
            opened = true
        }
        if(startpoint > endpoint+100 && opened == true){
            chatsouter.style.transform = 'translateX(-300px)'
            infodiv.style.display = 'none'
            opened = false
        }
    })
}

window.addEventListener('resize', () => {
    if (window.innerWidth < 900){
        chatinfo.style.display = 'none'
        msgarea1.style.width = '98%'   
    }
    else if(window.innerWidth > 900 && window.innerWidth < 1100){
        chatinfo.style.display = 'flex'
        chatinfo.style.width = '170px'
        msgarea1.style.width = 'calc(98% - 170px)'
    }
    else{
        chatinfo.style.width = '220px'
        msgarea1.style.width = 'calc(98% - 220px)'
    }
})