const Queue = require('bull');
const UserServices = require('../services/UserServices');
const EmailServices = require('../services/EmailServices');

const pronouns = ['he/him', 'she/her', 'they/them', 'Prefer Not to Say', 'Other'];
const disciplines = [
  'Chemical',
  'Civil',
  'Electrical & Computer',
  'Engineering Science',
  'Industrial',
  'Mechanical',
  'Mineral',
  'Track One (Undeclared)',
];

const registrationDataSubsciption = new Queue('registrationData', {
  redis: { port: process.env.REDIS_PORT, host: 'redis', password: process.env.REDIS_PASSWORD },
});

registrationDataSubsciption.process(async (job, done) => {
  const emailAddresses = process.env.REGISTRATION_DATA_EMAIL_ADDRESSES.split(',');
  const defaultObject = {
    'he/him': 0,
    'she/her': 0,
    'they/them': 0,
    'Prefer Not to Say': 0,
    Other: 0,
    Chemical: 0,
    Civil: 0,
    'Electrical & Computer': 0,
    'Engineering Science': 0,
    Industrial: 0,
    Mechanical: 0,
    Mineral: 0,
    'Track One (Undeclared)': 0,
    bursaryRequested: 0,
    isRegistered: 0,
    isRetreat: 0,
    totalUsers: 0,
    scunt: 0,
  };
  const users = await UserServices.getAllUsers();
  const data = users.reduce((prev, curr) => {
    if (pronouns.includes(curr.pronouns)) {
      prev[curr.pronouns]++;
    }
    if (disciplines.includes(curr.discipline)) {
      prev[curr.discipline]++;
    }
    if (curr.bursaryRequested) {
      prev.bursaryRequested++;
    }
    if (curr.isRegistered) {
      prev.isRegistered++;
    }
    if (curr.scunt) {
      prev.scunt++;
    }
    if (curr.isRetreat) {
      prev.isRetreat++;
    }
    prev.totalUsers++;
    return prev;
  }, defaultObject);
  await EmailServices.sendSimpleEmail(
    emailAddresses,
    `<div><h1>Frosh Data</h1><ul>${Object.keys(data).reduce((prev, item) => {
      return prev + `<li>${item}: ${data[item]}</li>`;
    }, '')}</ul></div>`,
    `Frosh Data\n${Object.keys(data).reduce((prev, item) => {
      return prev + `\t- ${item}: ${data[item]}\n`;
    }, '')}`,
    'Daily Registration Report',
    'tech@orientation.skule.ca',
  );
  done();
});

module.exports = registrationDataSubsciption;
