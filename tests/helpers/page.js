const puppeteer = require('puppeteer');
const sessionFactory = require('../factories/sessionFactory');
const userFactory = require('../factories/userFactory');

class CustomPage {
  static async build() {
    const browser = await puppeteer.launch({
      headless: false
    });

    const page = await browser.newPage();
    const customPage = new CustomPage(page);

    return new Proxy(customPage, {
      get: function(target, property){
        return target[property] || browser[property] || page[property];
      }
    })
  }

  constructor(page){
    this.page = page;
  }

  async login() {
    //create cookies
    const user = await userFactory();
    const { session, sig } = sessionFactory(user);

    //set cookie
    await this.page.setCookie({ name: 'session', value:  session });
    await this.page.setCookie({ name: 'session.sig', value: sig });

    //refresh
    await this.page.goto('localhost:3000/blogs');

    //wait for html to render
    await this.page.waitFor('a[href="/auth/logout"]');
  }

  async getContentsOf(selector) {
    return this.page.$eval(selector, el => el.innerHTML);
  }
}

module.exports = CustomPage;