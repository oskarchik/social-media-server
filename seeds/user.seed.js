require('dotenv').config();
const mongoose = require('mongoose');
const connect = require('../db');
const User = require('../models/User');

const users = [
  {
    firstName: 'Oscar',
    lastName: 'S',
    device: 'oscar@oscar.com',
    password: '$2b$10$HdXtoLagdwgtvbFqR57oU.vDwJDTA2/LIiPNfEzUHRqTlKGXl3OLS',
    dateOfBirth: 'Oct/14/2020',
    gender: 'male',
    avatar:
      'https://st3.depositphotos.com/15648834/17930/v/600/depositphotos_179308454-stock-illustration-unknown-person-silhouette-glasses-profile.jpg',
    coverPic: 'https://i.pinimg.com/originals/3c/71/cf/3c71cffe6b9af1b94c5ff713ed1298aa.jpg',
    followers: [],
    following: [],
    isAdmin: false,
  },
  {
    firstName: 'Pedro',
    lastName: 'Gomez',
    device: 'pedro@pedro.com',
    password: '$2b$10$DEqjjWVRlJbpaKsFkM.S8.nZd2C9jGeNRjqDcjupKn9m0vjCwV20C',
    dateOfBirth: 'Jun/2/1977',
    gender: 'male',
    avatar:
      'https://st.depositphotos.com/1269204/1219/i/600/depositphotos_12196477-stock-photo-smiling-men-isolated-on-the.jpg',
    coverPic:
      'https://images.squarespace-cdn.com/content/v1/52d2ebb3e4b06f22d60562c5/1542523881206-SLQ184LFY1WZMVSDAZPG/Adam+Jacobs+Landscape+Fine+Art+Photography+To+Buy-11.jpg',
    followers: [],
    following: [],
    isAdmin: false,
  },
  {
    firstName: 'Eva',
    lastName: 'Perez',
    device: 'eva@eva.com',
    password: '$2b$10$YyDJUl17dzpQ/en1IX1DLuBSFWBsYPDpXrvB76Wdz1XlYN7MgllFS',
    dateOfBirth: 'Dec/18/2000',
    gender: 'female',
    avatar:
      'https://img.freepik.com/free-photo/friendly-smiling-woman-looking-pleased-front_176420-20779.jpg?size=626&ext=jpg',
    coverPic:
      'https://images.squarespace-cdn.com/content/v1/5a5bded380bd5ec288fef955/1603224840667-TTF2KA7LFHTNGPOVLV81/granville+drone+%281+of+1%29.jpg',
    followers: [],
    following: [],
    isAdmin: false,
  },
  {
    firstName: 'Sandra',
    lastName: 'Ol',
    device: 'sandra@sandra.com',
    password: '$2b$10$Rxw5l79QOQLmwOKKQ.P.VO49G49yKwodQ2AZ8uH0XMNmHdB9lSoqC',
    dateOfBirth: 'Nov/19/1983',
    gender: 'female',
    avatar: 'https://cdn2.opendemocracy.net/media/images/19742852976_48bd70364d_o.max-760x504.jpg',
    coverPic:
      'https://images.squarespace-cdn.com/content/v1/52d2ebb3e4b06f22d60562c5/1542523882958-HGYXE6DO3CQ8YHJ4UCE0/Adam+Jacobs+Landscape+Fine+Art+Photography+To+Buy-12.jpg',
    followers: [],
    following: [],
    isAdmin: false,
  },
  {
    firstName: 'Toni',
    lastName: 'N',
    device: '666666666',
    password: '$2b$10$k1Ra5io9aJXWdCzXFV26.OCasD7v1o/MMa3BaM1XWaRiV421ugW9i',
    dateOfBirth: 'Jun/2/1965',
    gender: 'male',
    avatar:
      'https://images.squarespace-cdn.com/content/v1/52d2ebb3e4b06f22d60562c5/1434119600060-I0R7OID2AA8V0WXEVKBP/Adam+Jacobs+Photography_Men+In+Suites-8.jpg',
    coverPic: 'https://upload.wikimedia.org/wikipedia/commons/0/0c/Svalbard_landscape.jpg',
    followers: [],
    following: [],
    isAdmin: false,
  },
  {
    firstName: 'Mark',
    lastName: 'Smith',
    device: '555555555',
    password: '$2b$10$I7TVvAHnfB4hX.C9d7EzgerxR9VqQsxsFZo2SOS42KzulJeRChw9u',
    dateOfBirth: 'Oct/3/2000',
    gender: 'male',
    avatar:
      'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixid=MnwxMjA3fDB8MHxzZWFyY2h8OXx8bWFufGVufDB8fDB8fA%3D%3D&ixlib=rb-1.2.1&w=1000&q=80',
    coverPic: 'https://upload.wikimedia.org/wikipedia/commons/0/0c/Svalbard_landscape.jpg',
    followers: [],
    following: [],
    isAdmin: false,
  },
  {
    firstName: 'John',
    lastName: 'Doe',
    device: 'john@doe.com',
    password: '$2b$10$3W4427fg58k.hLbarKZBzerYr1HRnp3yIcRIQoRJPjhduAeNlzy16',
    dateOfBirth: 'Dec/12/1995',
    gender: 'male',
    avatar: 'https://media.revistagq.com/photos/5e6b67b8dd26150008f1f153/4:3/w_2664,h_1998,c_limit/spider-man-3.jpg',
    coverPic: 'http://www.sisorg.nl/download/wallpaper01/images/Landscape_jpg.jpg',
    followers: [],
    following: [],
    isAdmin: true,
  },
  {
    firstName: 'Toni',
    lastName: 'Montana',
    device: '2222',
    password: '$2b$10$fcwHMZ/9zEAsrE1dN7bjTu464/D6tN3HnHigYCkzWqtCU.lsllOd6',
    dateOfBirth: 'Jul/17/1982',
    gender: 'male',
    avatar:
      'https://st3.depositphotos.com/15648834/17930/v/600/depositphotos_179308454-stock-illustration-unknown-person-silhouette-glasses-profile.jpg',
    coverPic:
      'https://images.squarespace-cdn.com/content/v1/5a5bded380bd5ec288fef955/1603224840667-TTF2KA7LFHTNGPOVLV81/granville+drone+%281+of+1%29.jpg',
    followers: [],
    following: [],
    isAdmin: false,
  },
];

mongoose
  .connect(process.env.MONGO_URI_TEST, {
    useNewUrlParser: true,
  })
  .then(async () => {
    console.log('Deleting all users...');
    const allUsers = await User.find();

    if (allUsers.length) {
      await User.collection.drop();
    }
  })
  .catch((error) => console.log('Error deleting data...'))
  .then(async () => {
    await User.insertMany(users);
    console.log('Successfully inserted users into DB...');
  })
  .finally(() => mongoose.disconnect());
