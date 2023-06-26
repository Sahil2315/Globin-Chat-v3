let express = require('express')
let app = express()
let path = require('path')
require('dotenv').config();
const { Pool, Client } = require('pg')
const connectionString = process.env.Postgres_Con_String
const cookieParser = require('cookie-parser')
const server = require("http").Server(app);
const io = require("socket.io")(server);
const db = new Client({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false }
})

app.use(express.json())
app.use(express.static(path.join(__dirname)))
app.use(cookieParser())

const multer = require('multer')

const sharp = require('sharp')

const firebase = require('firebase/app');
const {getStorage, ref, getDownloadURL, uploadBytesResumable} = require('firebase/storage');
const firebaseConfig = {
  apiKey: process.env.fbase_API_KEY,
  authDomain: process.env.fbase_Auth_Domain,
  projectId: "chatapp-6f2d9",
  storageBucket: process.env.fbase_Storage_Bucket,
  messagingSenderId: process.env.fbase_Messaging_Sender,
  appId: process.env.fbase_APPID,
  measurementId: process.env.fbase_MeasureID
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const storage = getStorage();

const upload = multer({ storage: multer.memoryStorage() });

app.post('/upload', upload.single('image'), async (req, res) => {
  const storageRef = ref(storage, `Images/${req.cookies.id.uid}${req.cookies.id.uname}`);
  await sharp(req.file.buffer, {failOnError:false})
  .resize( 200, 200, { fit: 'cover' }) // Use the "cover" argument here
  .toFormat('jpeg')
  .toBuffer()
  .then(async (sharpBuffer) => {
    uploadTask = await uploadBytesResumable(storageRef, sharpBuffer)
    // console.log(uploadTask)
    getDownloadURL(uploadTask.ref).then((downloadURL) => {
      db.query(`update login set profilePic = '${downloadURL}' where uid = ${req.cookies.id.uid}`, (err, result) => {
        if(err) throw err
        res.send({'url': downloadURL})
      })
    })
  })
});

db.connect((err) => {
  if (err) throw err
  console.log("Connected")
})

let sockettoid = {}
let idtosocket = {}
let OnlineUsers = new Set()

io.on("connection", (socket) => {
  io.to(socket.id).emit("hands", 'first1')
  socket.on('user', (userdet) => {
    OnlineUsers.add(userdet.userid)
    sockettoid[socket.id] = userdet
    idtosocket[userdet.userid] = socket.id
    socket.broadcast.emit("usercon", userdet.name)
  })
  socket.on("newmsg", (msg) => {
    io.to(idtosocket[`${msg.msgto}`]).emit("nmessage", {'fromname': `${sockettoid[socket.id].name}`, 'fromid': `${sockettoid[socket.id].userid}`, 'cont': msg.msgcont})
    db.query(`insert into messages(sendid, sendname, recid, recname, content, timing) values('${sockettoid[socket.id].userid}' , '${sockettoid[socket.id].name}',  ${msg.msgto}, '${msg.toname}', '${msg.msgcont}', now());`, (err, res) => {
      if (err) throw err
    })
  })
  socket.on('disconnect', () => {
    socket.broadcast.emit("userdis", sockettoid[socket.id].name)
    OnlineUsers.delete((sockettoid[socket.id]).userid)
    delete idtosocket[sockettoid[socket.id]]
    delete sockettoid[socket.id]
  })
})

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"))
})

app.get('/signupPage', (req, res) => {
  res.sendFile(path.join(__dirname, "signup.html"))
})

app.post('/signupFunction', (req, res) => {
  db.query(`select * from login where email = '${req.body.email}'`, (error, rets) => {
    if (error) throw error
    if(rets.rowCount >0 ){
      res.send({'signup': 'usedEmail'})
    }
    else{
      db.query(`insert into login (uname, email, password, profilepic) values('${req.body.uname}', '${req.body.email}', '${req.body.password}', 'nopic');`, (err, result) => {
        if(err){ res.send({'signup': 'failed'}); throw err}
        db.query(`select uid from login where uname = '${req.body.uname}' and email = '${req.body.email}'`, (er, rslt) => {
          if(er) throw er
          db.query(`insert into messages (content, sendid, sendname, recid, recname, timing)
            values('Welcome to Globin Chat! Start Chatting By Searching for you Friend''s Username', 0, 'Chat-Bot', ${rslt.rows[0].uid}, '${req.body.uname}', now());
          `, (errr, fresult) => {
            if(errr) throw errr
            res.send({'signup': 'successful'})
          })
        })
      })
    }
  })
})

app.post('/loginreq', (req, res) => {
  db.query(`select * from login where (uname = '${req.body.entry}' or email = '${req.body.entry}') and password = '${req.body.password}'`, (err, result) => {
    if (err) throw err
    if (result.rowCount > 0) {
      res.cookie('id', result.rows[0])
      res.send({ 'login': 'successful', 'user': { 'userid': result.rows[0].uid, 'name': result.rows[0].uname } })
    }
    else {
      res.send({ 'login': 'unsuccessful' })
    }
  })
})

app.post('/searchmessager', (req, res) => {
  db.query(`select * from login where uname ilike '${req.body.entry}%'`, (err, result) => {
    if (err) throw err
    if (result.rows.length == 0) { res.send({ 'value': 'none' }) }
    else {
      res.send({ 'value': result.rows , 'useronline': OnlineUsers.has(result.rows[0].uid)})
    }
  })
})

app.get('/getolder', (req, res) => {
  db.query(`select * from messages where 
    sendid = ${req.cookies.id.uid} or 
    recid = ${req.cookies.id.uid}
    order by msgid desc limit 20;
  `, (err, result) => {
    if (err) throw err
    res.send({ 'oldermsg': result.rows })
  })
})

app.get('/getprofile', (req, res) => {
  db.query(`select uid, uname, profilepic, aboutme from login where uid = ${req.cookies.id.uid}`, (err, result) => {
    if (err) throw err
    res.send({'profile': result.rows[0]})
  })
})

app.get('/getprev', (req, res) => {
  db.query(`select sendid, sendname, recid, recname from messages where 
  sendid = ${req.cookies.id.uid} or 
  recid = ${req.cookies.id.uid}
  order by msgid desc;`, (err, result) => {
    if (err) throw err
    let arrid = new Set()
    let finalresult = []
    for (let i = 0; i < result.rowCount; i++) {
      if (result.rows[i].sendid == req.cookies.id.uid) {
        arrid.add(result.rows[i].recid)
      }
      else {
        arrid.add(result.rows[i].sendid)
      }
    }
    arrid = [...arrid]
    if(arrid.length == 0){
      res.send({'chats': []})
    }
    else{
      let picquery = `select uid, uname, profilepic, aboutme from login where uid = ${arrid[0]}`
      for(let i=1; i< arrid.length; i++){
        picquery += ` or uid = ${arrid[i]}`
      }
      db.query(picquery, (picerr, picresult) => {
        if(picerr) throw picerr
        for(let i=0; i<arrid.length; i++){
          for(let j=0; j< picresult.rows.length; j++){
            if(arrid[i] == picresult.rows[j].uid){
              if(picresult.rows[j].profilepic == null){
                finalresult.push({'uid': picresult.rows[j].uid, 'uname': picresult.rows[j].uname, 'profilepic': 'nopic', 'online': OnlineUsers.has(arrid[i]), 'aboutme': picresult.rows[j].aboutme})
              }
              else{
                finalresult.push({'uid': picresult.rows[j].uid, 'uname': picresult.rows[j].uname, 'profilepic': picresult.rows[j].profilepic, 'online': OnlineUsers.has(arrid[i]), 'aboutme': picresult.rows[j].aboutme})
              }
              continue
            }
          }
        }
        res.send({
          'chats': finalresult
        })
      })
    }
  })
})

app.get('/deleteProfilePic', (req, res) => {
  db.query(`update login
    set profilepic = null
    where uid = ${req.cookies.id.uid}
  `, (err, result) => {
    if(err){
      res.send({'status': 'failure'})
    }
    res.send({'status': 'success'})
  })
})

app.post('/changeAbout', (req, res) => {
  db.query(`update login set aboutme = '${req.body.entry}' where uid = ${req.cookies.id.uid}`, (err, result) => {
    if(err){
      res.send({'changed': 'failure'})
      throw err
    }
    res.send({'changed': 'success'})
  })
})

app.post('/whichchat', (req, res) => {
  db.query(`select * from messages where 
    (sendname = '${req.cookies.id.uname}' and recname = '${req.body.entity}') or 
    (recname = '${req.cookies.id.uname}' and sendname = '${req.body.entity}')
    order by msgid desc
    limit 20
  `, (err, result) => {
    if (err) throw err
    res.send({ "messages": result.rows })
  })
})

app.get('/chatget', (req, res) => {
  res.sendFile(path.join(__dirname, "chat.html"))
})

app.post('/getnewUser', (req, res) => {
  db.query(`select profilepic, aboutme from login where uid = ${req.body.uid};`, (err, result) =>{
    if (err) throw err
    res.send({'user': result.rows[0]})
  })
})

server.listen(5000, () => {
  console.log("Server Running on Port 5000")
})