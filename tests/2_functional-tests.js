'use strict';
const chai = require('chai');
const chaiHttp = require('chai-http');
const { suite, test } = require('mocha');
const server = require('../server');

chai.use(chaiHttp);
const assert = chai.assert;

suite('Testes Funcionais da API', function() {
  this.timeout(5000);
  let testThreadId;
  let testReplyId;

  // Testes para threads
  suite('Operações com Threads', () => {
    test('Criar nova thread POST /api/threads/{board}', (done) => {
      chai.request(server)
        .post('/api/threads/test')
        .send({
          text: 'Thread de teste',
          delete_password: 'senha123'
        })
        .end((err, res) => {
          testThreadId = res.body._id;
          assert.equal(res.status, 200);
          assert.exists(res.body._id);
          done();
        });
    });

    test('Listar 10 threads recentes GET /api/threads/{board}', (done) => {
      chai.request(server)
        .get('/api/threads/test')
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isAtMost(res.body.length, 10);
          res.body.forEach(thread => {
            assert.isAtMost(thread.replies.length, 3);
          });
          done();
        });
    });

    test('Excluir thread com senha incorreta DELETE /api/threads/{board}', (done) => {
      chai.request(server)
        .delete('/api/threads/test')
        .send({
          thread_id: testThreadId,
          delete_password: 'senha_errada'
        })
        .end((err, res) => {
          assert.equal(res.text, 'incorrect password');
          done();
        });
    });

    test('Excluir thread com senha correta DELETE /api/threads/{board}', (done) => {
      chai.request(server)
        .delete('/api/threads/test')
        .send({
          thread_id: testThreadId,
          delete_password: 'senha123'
        })
        .end((err, res) => {
          assert.equal(res.text, 'success');
          done();
        });
    });

    test('Reportar thread PUT /api/threads/{board}', (done) => {
      chai.request(server)
        .put('/api/threads/test')
        .send({ thread_id: testThreadId })
        .end((err, res) => {
          assert.equal(res.text, 'reported');
          done();
        });
    });
  });

  // Testes para replies
  suite('Operações com Respostas', () => {
    test('Criar nova resposta POST /api/replies/{board}', (done) => {
      chai.request(server)
        .post('/api/replies/test')
        .send({
          thread_id: testThreadId,
          text: 'Resposta de teste',
          delete_password: 'resposta456'
        })
        .end((err, res) => {
          testReplyId = res.body._id;
          assert.equal(res.status, 200);
          assert.exists(res.body._id);
          done();
        });
    });

    test('Visualizar thread com respostas GET /api/replies/{board}', (done) => {
      chai.request(server)
        .get('/api/replies/test')
        .query({ thread_id: testThreadId })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isArray(res.body.replies);
          done();
        });
    });

    test('Excluir resposta com senha incorreta DELETE /api/replies/{board}', (done) => {
      chai.request(server)
        .delete('/api/replies/test')
        .send({
          reply_id: testReplyId,
          delete_password: 'senha_errada'
        })
        .end((err, res) => {
          assert.equal(res.text, 'incorrect password');
          done();
        });
    });

    test('Excluir resposta com senha correta DELETE /api/replies/{board}', (done) => {
      chai.request(server)
        .delete('/api/replies/test')
        .send({
          reply_id: testReplyId,
          delete_password: 'resposta456'
        })
        .end((err, res) => {
          assert.equal(res.text, 'success');
          done();
        });
    });

    test('Reportar resposta PUT /api/replies/{board}', (done) => {
      chai.request(server)
        .put('/api/replies/test')
        .send({ reply_id: testReplyId })
        .end((err, res) => {
          assert.equal(res.text, 'reported');
          done();
        });
    });
  });
});
