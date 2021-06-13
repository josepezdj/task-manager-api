const User = require('../models/User');
const { Router } = require('express');
const router = new Router();
const auth = require('../middlewares/auth');
const multer = require('multer');
const sharp = require('sharp');
const { sendWelcomeEmail, sendByeEmail } = require('../emails/account')

router.post('/user', async (req, res) => {
    const user = new User(req.body);
    try {
        await user.save();
        sendWelcomeEmail(user.email, user.name);
        const token = await user.generateAuthToken();
        res.status(201).send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }
});
router.post('/user/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.send({ user, token })
        // const public = user.getPublicProfile();
        // res.send({ user: public, token })
    } catch (e) {
        res.status(400).send()
    }
});

// Routes that require Authentication

router.post('/user/logout', auth, async (req, res) => {
   try {
       req.user.tokens = req.user.tokens.filter(token => token.token !== req.token);
       await req.user.save()
       res.send('Logged out')
   } catch (e) {
        res.status(501).send()
   }
});
router.post('/user/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send('Logged out from all devices')
    } catch (e) {
         res.status(501).send()
    }
 });
 router.get('/user/me', auth, async (req, res) => {
    res.send(req.user)
});
// router.get('/user/:id', auth, async (req, res) => {
//     const _id = req.params.id
//     const user = await User.findById(_id)
//     if(!user) {
//         return res.status(404).send()
//     }
//     res.send(user)
// });
router.patch('/user/me', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'password', 'email', 'age'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));
    if(!isValidOperation) {
        return res.status(400).send({error: 'Invalid Updates!'})
    }
    try {
        updates.forEach(update => req.user[update] = req.body[update])
        await req.user.save();
        // const user = await User.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        res.status(201).send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
});
router.delete('/user/me', auth, async (req, res) => {
    try {
        // const user = await User.findByIdAndDelete(req.params.id);
        // if(!user) {
        //     return res.status(404).send({error: 'User not Found.'})
        // }
        // res.send(user)
        
        await req.user.remove();
        sendByeEmail(req.user.email, req.user.name);
        res.send(req.user)
    } catch (e) {
        res.status(500).send(e)
    }
});

const avatarUpload = multer({
    // dest: 'images/avatars', // Removed in order to allow the multer function to return the file.
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(jpg|jpeg|png)/)) {
            cb(new Error('Please choose a valid image file'))
        }
        cb(undefined, true)
    }
});

router.post('/user/me/avatar', auth, avatarUpload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
});
router.delete('/user/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.send()
});
router.get('/user/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if(!user || !user.avatar) {
            throw new Error()
        }
        res.set('Content-Type', 'image/jpg');
        res.send(user.avatar)
    } catch (e) {
        res.status(404).send()
    }
})

module.exports = router;
