const Franchise = require('../model/Franchise')

const getAllData = async(req, res) => {
  try {
      const result = await Franchise.find()
      console.log(result)
      res.json(result)
  } catch (err) {
    console.log(err);
    res.status(500).json({ "message": err.message })

  }

}

module.exports = {getAllData}