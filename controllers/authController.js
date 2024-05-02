const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../model/User");

const handleLogin = async (req, res) => {
  const { email, pwd } = req.body;
  if (!email || !pwd)
    return res.status(400).json({ message: "Email and Password are required" });

  const foundUser = await User.findOne({ email: email, archive: false }).exec();
  if (!foundUser) return res.sendStatus(401);

  const match = await bcrypt.compare(pwd, foundUser.password);
  if (!match)
    return res.status(401).json({ message: `Incorrect email or password` });
  try {
    const roles = Object.values(foundUser.roles).filter(Boolean);
    const fullname = `${foundUser.firstname} ${foundUser.lastname}`;
    const id = foundUser._id;

    const accessToken = jwt.sign(
      {
        UserInfo: {
          id: id,
          email: foundUser.email,
          roles: roles,
          fullname: fullname,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    // if user allreafy login
    const rToken = foundUser.refreshToken;
    // if (rToken != "") {
    //   res.cookie("jwt", rToken, {
    //     httpOnly: true,
    //     maxAge: 24 * 60 * 60 * 1000,
    //     sameSite: "None",
    //     secure: true,
    //   }); //secure: true
    //   return res.json({ roles, accessToken, fullname });
    // }

    const refreshToken = jwt.sign(
      { email: foundUser.email },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    foundUser.refreshToken = refreshToken;
    const result = await foundUser.save();
    //response
    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: "None",
      secure: true,
    }); //secure: true
    res.json({ roles, accessToken, fullname });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { handleLogin };
