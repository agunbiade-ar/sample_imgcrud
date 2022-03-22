const express = require('express')
const app = express()
const mongoose = require('mongoose')
const methodOverride = require('method-override');
const dotenv = require('dotenv')
dotenv.config()

const path = require('path')

const User = require('./models/user')
const cloudinary = require('cloudinary').v2
const upload = require('./utils/multer');

const port = 3000

const cloudinary_parameters = {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
}

//connect to mongodb local
mongoose.connect(process.env.DATABASE_URL)
const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', ()=> console.log("Successfully connected to mongoose"))

app.use(methodOverride('_method'));
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(express.static('public'))

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs')

app.get('/', function(req, res){
    res.send('Welcome Page: Hellloooo')
})

app.get('/user', function(req, res){
    res.render('user')
})

app.post('/user', upload.single('image'), async function(req, res){
    let errors = []

    if(!req.body.name && !req.file){
        errors.push({msg: 'Please fill all fields correctly'})
    }

    if(errors.length) 
    {
        res.render('user', {errors: errors})
    }
    else{
        try {
            await cloudinary.uploader.upload(req.file.path, cloudinary_parameters).then( result => {
                
                let details = new User({
                    name: req.body.name,
                    avatar: result.secure_url,
                    cloudinary_id: result.public_id
                })
                details.save().then(detail => {
                    console.log(detail)
                    // res.redirect('/users')
                    res.redirect('/')
                })
            })
        } catch (error) {
            console.error(error)
        }
    }
})

app.get('/users', async function(req, res){

    const users = await User.find({})
    // res.send('all users')
    res.render('users', {users: users})
})

app.get("/user/:id", function(req, res){
    let id = req.params.id
    User.findById(id, function(err, user){
        if(err) {  res.redirect('/user') }
        res.render('updateUser', {user: user})
    })
})

app.put("/user/:id", upload.single('image'), async function(req, res){
    try {
        
        let user = await User.findById(req.params.id)
        if(req.body.name != user.name && req.body.name !== ''){
            user.name = req.body.name
        }

        if(req.file){
            await cloudinary.uploader.destroy(user.cloudinary_id, function(err, result){
            if(err) { console.log(err); }
            // else{ console.log(result) }
            })

            await cloudinary.uploader.upload(req.file.path, cloudinary_parameters).then(
                result => {
                    user.avatar = result.secure_url       
                    user.cloudinary_id = result.public_id
                    console.log(result)
                    }
            ).catch( err => {
                console.log(err)
            })
        }

        await User.findByIdAndUpdate(req.params.id, user, {new: true}).then( 
            user => {
                console.log('Successfully Updated')
                res.redirect('/users')
            }
        )} catch (error) {
            console.log(error)
        }

    // res.json(user)
})

app.listen(port)