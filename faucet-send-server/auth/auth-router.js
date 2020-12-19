
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const secret = require('../config/secrets');
const Users = require('./auth-model');

 
router.post('/signup',  (req, res) => {
  let user = req.body;
  const hash = bcrypt.hashSync(user.password,10);
  
  user.password = hash;
  user.deposit_id = Users.makeid(32)
  // give users a testing balance for now
  user.balance = 100000000;
  Users.add(user)
    .then(saved => {
    const newUser = saved[0]
    delete newUser.password;
    const token = generateToken(newUser);
     res.status(201).json({user_id: newUser.id, token: token})
     
    })
    .catch(err => {
      res.status(500).json(err)
      console.log(err, 'err')
    })
});

router.post('/login', (req, res) => {
  let {email, password} = req.body;

  Users.findBy({email})
    .first()
    .then(user => {
      if (user && bcrypt.compareSync(password, user.password)) {
       const token = generateToken(user) 
       delete user.password;
        res.status(200).json({
          user_id: user.id,
          token
        });
      } else {
        res.status(401).json({message: "Invalid Credentials"})
      }
    })

});


function generateToken(user) {
  const payload = {
    username: user.username,
    id: user.id,
    
  };
  const options = {
    expiresIn: "42069d"
  };
  return jwt.sign(payload, process.env.JWT_SECRET, options);
}

module.exports = router;
