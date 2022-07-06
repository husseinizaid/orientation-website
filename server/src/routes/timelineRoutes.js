const express = require('express');
const checkLoggedIn = require('../middlewares/checkLoggedIn');
const hasAuthScopes = require('../middlewares/hasAuthScopes');

const {
  getTimeline,
  updateTimelineElement,
  createTimelineElement,
  deleteTimelineElement,
} = require('../controllers/TimelineController');

const router = express.Router();

router.get('/', getTimeline);

router.put('/:id/edit', checkLoggedIn, hasAuthScopes(['Timeline:edit']), updateTimelineElement);

router.post('/create', checkLoggedIn, hasAuthScopes(['Timeline:create']), createTimelineElement);

router.delete(
  '/:id/delete',
  checkLoggedIn,
  hasAuthScopes(['Timeline:delete']),
  deleteTimelineElement,
);

module.exports = router;
