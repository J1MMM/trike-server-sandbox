const Franchise = require('../model/Franchise');

const getAllData = async (req, res) => {
      try {
            const rows = await Franchise.find().sort({ 'MTOP': 'asc' });
            const totalRows = await Franchise.countDocuments();
            res.json({ rows, totalRows });
      } catch (err) {
            console.error('Error fetching data:', err);
            res.status(500).json({ message: 'Internal server error' });
      }
};

module.exports = { getAllData };
