module.exports = function(app) {
  const express = require('express');
  const router = express.Router();
  const Thread = require('../models/Thread');
  const Reply = require('../models/Reply');

  router.put('/api/threads/:board', async (req, res) => {
    try {
      const thread = await Thread.findByIdAndUpdate(
        req.body.thread_id,
        { reported: true },
        { new: true }
      );
      thread ? res.send('reported') : res.status(404).send('Thread não encontrada');
    } catch (err) {
      res.status(500).send(err.message);
    }
  });

  router.delete('/api/threads/:board', async (req, res) => {
    try {
      const thread = await Thread.findById(req.body.thread_id);
      if (!thread) return res.status(404).send('Thread não encontrada');
      
      if (thread.delete_password === req.body.delete_password) {
        await Thread.findByIdAndDelete(req.body.thread_id);
        res.send('success');
      } else {
        res.send('incorrect password');
      }
    } catch (err) {
      res.status(500).send(err.message);
    }
  });

  // Rotas para threads
  router.post('/api/threads/:board', async (req, res) => {
    try {
      if (!req.body.text || !req.body.delete_password) {
        return res.status(400).send('Campos obrigatórios ausentes');
      }
      const newThread = new Thread({
        board: req.params.board,
        text: req.body.text,
        delete_password: req.body.delete_password,
        reported: false,
        replies: [],
        created_on: new Date(),
        bumped_on: new Date()
      });
      await newThread.save();
      res.json({ _id: newThread._id, text: newThread.text, created_on: newThread.created_on, bumped_on: newThread.bumped_on, replies: [], board: newThread.board });
    } catch (err) {
      res.status(500).send(err.message);
    }
  });

  router.get('/api/threads/:board', async (req, res) => {
    try {
      const threads = await Thread.find({ board: req.params.board })
        .sort('-bumped_on')
        .limit(10)
        .populate({
          path: 'replies',
          options: { limit: 3, sort: { created_on: -1 } },
          select: '-reported -delete_password -__v -thread'
        });
      const formattedThreads = threads.map(thread => ({
        _id: thread._id,
        text: thread.text,
        created_on: thread.created_on,
        bumped_on: thread.bumped_on,
        replies: thread.replies.map(reply => ({
          _id: reply._id,
          text: reply.text,
          created_on: reply.created_on
        })),
        replycount: thread.replies.length
      }));
      res.json(formattedThreads);
    } catch (err) {
      res.status(500).send(err.message);
    }
  });

  // Rotas para replies
  router.post('/api/replies/:board', async (req, res) => {
    try {
      if (!req.body.text || !req.body.delete_password || !req.body.thread_id) {
        return res.status(400).send('Campos obrigatórios ausentes');
      }
      const thread = await Thread.findById(req.body.thread_id);
      if (!thread) return res.status(404).send('Thread não encontrada');
      const newReply = new Reply({
        text: req.body.text,
        delete_password: req.body.delete_password,
        reported: false,
        thread: thread._id,
        created_on: new Date()
      });
      await newReply.save();
      thread.replies.push(newReply._id);
      thread.bumped_on = new Date();
      await thread.save();
      res.json({ _id: newReply._id, text: newReply.text, created_on: newReply.created_on, thread: thread._id });
    } catch (err) {
      res.status(500).send(err.message);
    }
  });

  router.get('/api/replies/:board', async (req, res) => {
    try {
      const thread = await Thread.findById(req.query.thread_id)
        .populate({
          path: 'replies',
          select: '-reported -delete_password -__v -thread',
          options: { sort: { created_on: -1 } }
        });
      if (!thread) return res.status(404).send('Thread não encontrada');
      res.json({
        _id: thread._id,
        text: thread.text,
        created_on: thread.created_on,
        bumped_on: thread.bumped_on,
        replies: thread.replies.map(reply => ({
          _id: reply._id,
          text: reply.text,
          created_on: reply.created_on
        }))
      });
    } catch (err) {
      res.status(500).send(err.message);
    }
  });

  router.put('/api/replies/:board', async (req, res) => {
    try {
      const reply = await Reply.findByIdAndUpdate(
        req.body.reply_id,
        { reported: true },
        { new: true }
      );
      reply ? res.send('reported') : res.status(404).send('Reply não encontrado');
    } catch (err) {
      res.status(500).send(err.message);
    }
  });

  router.delete('/api/replies/:board', async (req, res) => {
    try {
      const reply = await Reply.findById(req.body.reply_id);
      if (!reply) return res.status(404).send('Reply não encontrado');
      if (reply.delete_password === req.body.delete_password) {
        reply.text = '[deleted]';
        await reply.save();
        res.send('success');
      } else {
        res.send('incorrect password');
      }
    } catch (err) {
      res.status(500).send(err.message);
    }
  });

  app.use('/', router);
};
