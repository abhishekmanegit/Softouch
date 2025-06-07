const express = require('express');
const auth = require('../middleware/auth');
const Connection = require('../models/Connection');
const User = require('../models/User');

const router = express.Router();

// @route   POST api/connections/request/:id
// @desc    Send a connection request
// @access  Private
router.post('/request/:id', auth, async (req, res) => {
  try {
    const receiverId = req.params.id;
    const senderId = req.user; // Comes from auth middleware

    if (senderId === receiverId) {
      return res.status(400).json({ message: 'You cannot send a connection request to yourself' });
    }

    // Check if a connection already exists or a request is pending
    const existingConnection = await Connection.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
    });

    if (existingConnection) {
      if (existingConnection.status === 'accepted') {
        return res.status(400).json({ message: 'Already connected with this user' });
      } else if (existingConnection.status === 'pending' && existingConnection.sender.toString() === senderId) {
        return res.status(400).json({ message: 'Connection request already sent' });
      } else if (existingConnection.status === 'pending' && existingConnection.receiver.toString() === senderId) {
        return res.status(400).json({ message: 'You have a pending request from this user. Please accept or reject it.' });
      }
    }

    const connection = new Connection({
      sender: senderId,
      receiver: receiverId,
    });

    await connection.save();
    res.status(200).json({ message: 'Connection request sent', connection });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/connections/accept/:id
// @desc    Accept a connection request
// @access  Private
router.put('/accept/:id', auth, async (req, res) => {
  try {
    const requestId = req.params.id;
    const userId = req.user; // Receiver

    const connection = await Connection.findById(requestId);

    if (!connection) {
      return res.status(404).json({ message: 'Connection request not found' });
    }

    // Ensure the logged-in user is the receiver of the pending request
    if (connection.receiver.toString() !== userId) {
      return res.status(401).json({ message: 'Not authorized to accept this request' });
    }

    if (connection.status === 'accepted') {
      return res.status(400).json({ message: 'Connection already accepted' });
    }

    connection.status = 'accepted';
    await connection.save();
    res.status(200).json({ message: 'Connection accepted', connection });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/connections/reject/:id
// @desc    Reject a connection request
// @access  Private
router.put('/reject/:id', auth, async (req, res) => {
  try {
    const requestId = req.params.id;
    const userId = req.user; // Receiver

    const connection = await Connection.findById(requestId);

    if (!connection) {
      return res.status(404).json({ message: 'Connection request not found' });
    }

    // Ensure the logged-in user is the receiver of the pending request
    if (connection.receiver.toString() !== userId) {
      return res.status(401).json({ message: 'Not authorized to reject this request' });
    }

    if (connection.status === 'rejected') {
      return res.status(400).json({ message: 'Connection already rejected' });
    }

    connection.status = 'rejected';
    await connection.save();
    res.status(200).json({ message: 'Connection rejected', connection });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/connections/my-connections
// @desc    Get all accepted connections for the logged-in user
// @access  Private
router.get('/my-connections', auth, async (req, res) => {
  try {
    const userId = req.user;
    const connections = await Connection.find({
      $or: [{ sender: userId }, { receiver: userId }],
      status: 'accepted',
    }).populate('sender', 'name email profilePicture headline').populate('receiver', 'name email profilePicture headline');

    // Return the other user in the connection
    const connectedUsers = connections.map(conn => {
      return conn.sender._id.toString() === userId ? conn.receiver : conn.sender;
    });

    res.json(connectedUsers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/connections/my-requests
// @desc    Get all pending connection requests received by the logged-in user
// @access  Private
router.get('/my-requests', auth, async (req, res) => {
  try {
    const userId = req.user;
    const requests = await Connection.find({
      receiver: userId,
      status: 'pending',
    }).populate('sender', 'name email profilePicture headline');
    res.json(requests);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router; 