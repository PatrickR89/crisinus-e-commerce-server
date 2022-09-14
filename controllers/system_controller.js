const fetch = require("node-fetch");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const mailchimp = require("@mailchimp/mailchimp_marketing");

const { clientLogger } = require("../utils/winstonLogger");
const { dbPoolPromise } = require("../databaseMiddleware/mySqlConnection");

mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_SERVER_PREFIX
});

module.exports.error = async (req, res) => {
  const err = req.body.err;
  clientLogger.error(err);
};
module.exports.info = async (req, res) => {
  const info = req.body.info;
  clientLogger.info(info);
};

module.exports.getCurrency = async (req, res) => {
  const resp = await fetch("https://api.hnb.hr/tecajn/v1?valuta=EUR");
  const data = await resp.json();
  const currency = data[0]["Srednji za devize"];
  const value = Number(currency.replace(/,/g, "."));
  const valueJson = JSON.stringify(value);

  res.send(valueJson);
};

module.exports.checkCookies = (req, res) => {
  res.cookie("cookies-modal", false, {
    maxAge: 1000 * 60 * 60 * 24,
    httpOnly: true
  });

  res.end();
};

module.exports.confirmCookies = (req, res) => {
  const tempCookie = JSON.parse(req.cookies["cookies-modal"]);

  if (typeof tempCookie == "boolean") {
    res.json({ cookiesModal: tempCookie });
  } else {
    res.json({ cookiesModal: true });
  }
};

module.exports.setClient = (req, res) => {
  const initialClient = req.headers["client-access-init"];

  if (initialClient == "crisinus-client-net") {
    const id = uuidv4();
    const client = `crisinus-client-${id}`;
    req.session.client = client;
    const clientToken = jwt.sign({ id }, process.env.JWT_CLIENT_SECRET, {
      expiresIn: 1000 * 60 * 60 * 24
    });

    res.cookie("client-access-token", clientToken, {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true
    });

    res.json({ clientReg: true, clientToken: clientToken, result: client });
  } else {
    res.send("API is for Crisinus client use only! xxx");
  }
};

module.exports.assignNewsletter = async (req, res) => {
  const email = req.body.email;

  const [checkEmail] = await dbPoolPromise.execute(
    "SELECT * FROM newsletter WHERE email = ?",
    [email]
  );

  if (checkEmail[0]) {
    res.send("You have already subscribed to our newsletter!");
  } else {
    const [saveEmail] = await dbPoolPromise.execute(
      "INSERT INTO newsletter (email) VALUES (?)",
      [email]
    );

    try {
      const response = await mailchimp.lists.addListMember(
        process.env.MAILCHIMP_AUDIENCE_ID,
        {
          email_address: email,
          status: "subscribed",
          email_type: "html"
        }
      );
      res.send(`Thank you for your subscription on ${email}, ${response}`);
    } catch (err) {
      console.log(err);
      logger.error(`Mailchimp response fail: ${err}`);
      res.status(400).send(err);
    }
  }
};
