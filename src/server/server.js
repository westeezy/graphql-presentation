import koa from 'koa';
import Router from 'koa-router';
import qs from 'koa-qs';
import views from 'co-views';
import parseBody from 'co-body';
import mongoose from 'mongoose';
import {graphql} from 'graphql';
import Debug from 'debug';
import schema from './schema';

let debug = new Debug('http');
let render = views(__dirname + '/views', {
  map: { html: 'swig' }
});

let port = process.env.PORT || 3000;
let routes = new Router();
let app = koa();

// support nested query tring params
qs(app);

if (process.env.NODE_ENV !== 'test') {
  mongoose.connect('mongodb://localhost/graphql');
  mongoose.set('debug', true);
}

routes.get('/', function* () {
  this.body = yield render('query');
});

routes.get('/mutate', function* () {
  this.body = yield render('mutate');
});

routes.get('/data', function* () {
  let query = this.query.query;
  let params = this.query.params;

  let resp = yield graphql(schema, query, '', params);

  if (resp.errors) {
    this.status = 400;
    this.body = {
      errors: resp.errors
    };
    return;
  }

  this.body = resp;
});

routes.post('/data', function* () {
  let payload = yield parseBody(this);
  if(typeof payload.params === 'string') {
    try {
      payload.params = JSON.parse(payload.params);
    } catch(e) {
      debug(e);
    }
  }
  let resp = yield graphql(schema, payload.query, '', payload.params);

  if (resp.errors) {
    this.status = 400;
    this.body = {
      errors: resp.errors
    };
    return;
  }

  this.body = resp;
});

app.use(routes.middleware());

app.listen(port, () => {
  debug('app is listening on %s', port);
});

module.exports = app;
