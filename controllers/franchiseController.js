const Franchise = require('../model/Franchise')

const getAllData = async(req, res) => {
  try {
      const result = await Franchise.find().exec()
      res.json(result)
  } catch (err) {
    res.status(500).json({ "message": err.message })

  }

}

module.exports = {getAllData}