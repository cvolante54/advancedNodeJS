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

test('header has correct text', async () => {
  //get logo - > in chromin console (const $eval = el => innerHTML)
  const text = await page.getContentsOf('a.brand-logo');

  expect(text).toEqual("Blogster");
});

test('clicking login start oauth flow', async () => {
  await page.click(".right a");

  const url = page.url();

  expect(url).toMatch(/accounts\.google\.com/)
});

test('When signed in shows logout button', async () => {
  await page.login();

  //test logout inner text
  const text = await page.getContentsOf('a[href="/auth/logout"]');
  expect(text).toEqual('Logout');
});
