const Ticket = require("../model/Ticket");

const getAllTickets = async (req, res) => {
  try {
    const result = await Ticket.find().sort({
      _id: "desc",
    });
    if (!result) return res.status(204).json({ message: "No Data found" });

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

const addTicket = async (req, res) => {
  try {
    const ticketDetails = req.body;
    if (!ticketDetails)
      return res.status(400).json({ message: "All fields are required" });

    const result = await Ticket.create(ticketDetails);

    res.status(201).json(result);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
};

const updateTicket = async (req, res) => {
  try {
    const ticketDetails = req.body;
    if (!ticketDetails) return res.sendStatus(400);
    const result = await Ticket.findByIdAndUpdate(
      ticketDetails._id,
      ticketDetails,
      { new: true }
    );

    res.status(201).json(result);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getAllTickets,
  addTicket,
  updateTicket,
};
