const Page = require('./helpers/page');

let page;

beforeEach(async () => {
  //launches instance of a browser and page
  page = await Page.build();

  //go to website
  await page.goto('localhost:3000');
});

afterEach(async () => {
  await page.close();
});

//================ TESTS ==========================
test('When logged in, new blog form appears', async () => {
  await page.login();

  //click on add blog button
  await page.click("a.btn-floating");

  const label = await page.getContentsOf('form label');

  expect(label).toEqual('Blog Title');
});
