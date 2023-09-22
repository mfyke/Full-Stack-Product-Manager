const express = require('express');
const sequelize = require('./config/connection');
const path = require('path');

const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ? Use API routes
app.use(routes);

// ? Use the public folder for static assets
app.use(express.static('public'));

// ? Get homepage
app.get('/', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/index.html'))
);

// ? Get category page
app.get('/category', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/pages/category.html'))
);

// ? Get tag page
app.get('/tag', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/pages/tag.html'))
);

sequelize.sync({ force: false }).then(() => {
  app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}!`);
  });
});
