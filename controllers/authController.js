const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const User = require('../model/User');

const handleLogin = async (req, res) => {
    const { email, pwd } = req.body;
    if (!email || !pwd) return res.status(400).json({ "message": "Email and Password are required" })

    const foundUser = await User.findOne({ email }).exec();
    if (!foundUser) return res.sendStatus(401)

    const match = await bcrypt.compare(pwd, foundUser.password);
    if (!match) return res.status(401).json({ 'message': `Incorrect email or password` })

    try {
        const roles = Object.values(foundUser.roles)
        const accessToken = jwt.sign(
            {
                "UserInfo": {
                    "email": foundUser.email,
                    "roles": roles
                }
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '1h' }
        )

        const refreshToken = jwt.sign(
            { "email": foundUser.email },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '1d' }
        )

        foundUser.refreshToken = refreshToken
        const result = await foundUser.save()
        //response
        res.cookie('jwt', refreshToken, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000, sameSite: 'None' }) //secure: true
        res.json({ accessToken })
    } catch (error) {
        res.status(400).json({ "message": error.message })
    }

}

module.exports = { handleLogin }