const request = require("supertest");
const expect = require("chai").expect;
const app = require("./app");
const mocha = require("mocha");

let token;
let baseurl = 'http://localhost:3000'

describe("Test Registration", function(){
  this.timeout(5000); 
  it('Should register new user', async () => {
    const response = await request(baseurl)
      .post('/register')
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .send({ name:'newname', email: 'newemail@example.com', password: '123456' });
    expect(response.status).to.equal(200);
    console.log(response.text);
  });
})
describe("Test the authentication and CRUD functionality", () => {
  // Test authentication
  it('Should authenticate the user and get the token', async () => {
    const response = await request(baseurl)
      .post('/login')
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .send({ email: 'johndoe@example.com', password: '123456' });
    expect(response.status).to.equal(200);
    expect(response.body.token).to.not.be.an('undefined');
    token = response.body.token;
    console.log(response.body);
  });

  // Test create post functionality
  it('Should create a new post', async () => {
    const response = await request(baseurl)
      .post('/posts')
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .send({ title: 'New Post', content: 'This is a new post.' });
    expect(response.status).to.equal(200);
    console.log(response.text);
  });

  // Test get all posts functionality
  it('Should get all posts', async () => {
    const response = await request(baseurl)
      .get('/posts')
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json');
    expect(response.status).to.equal(200);
    expect(response.body.length).to.be.above(0);
    console.log(response.body);
  });

  // Test update post functionality
  it('Should update the latest post', async () => {
    // Get latest posts
    const latest = await request(baseurl)
      .get('/posts')
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json');
    let latest_id = latest.body.slice(0)[0].id;

    const response = await request(baseurl)
      .put(`/posts/${latest_id}`)
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .send({ title: 'Updated Post', content: 'This post has been updated.' });
    expect(response.status).to.equal(200);

    const posts = await request(baseurl)
      .get('/posts')
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json');

    console.log(posts.body);
  });

  // Test delete post functionality
  it('Should delete the newest post', async () => {
    // Get newest post
    const newest = await request(baseurl)
      .get('/posts')
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json');
    let newest_id = newest.body.slice(-1)[0].id;

    const response = await request(baseurl)
      .delete(`/posts/${newest_id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).to.equal(200);

    const posts = await request(baseurl)
      .get('/posts')
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json');

    console.log(posts.body);
  });
});