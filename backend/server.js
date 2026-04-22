const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/leaves', require('./routes/leave'));
app.use('/api/employees', require('./routes/employee'));
app.use('/api/feedback', require('./routes/feedback'));

app.get('/', (req, res) => res.send('HR Portal API Running'));

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected');
    app.listen(process.env.PORT || 8080, () =>
      console.log(`Server running on port ${process.env.PORT || 8080}`)
    );
  })
  .catch(err => console.error(err));