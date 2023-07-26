const Imap = require("imap"),
  inspect = require("util").inspect;

const Promise = require("bluebird");
// const { data } = require("cheerio/lib/api/attributes");
Promise.longStackTraces();
const MailParser = require("mailparser").MailParser;

require("dotenv").config();

exports.getMailData = (req, res, next) => {
  console.log("hii");
  var imap = new Imap({
    user: process.env.EMAIL,
    password: process.env.PASSWORD,
    host: process.env.HOST,
    port: 993,
    tls: true,
    authTimeout: 25000,
    connTimeout: 30000,
    tlsOptions: { rejectUnauthorized: false },
  });
  Promise.promisifyAll(imap);

  function openInbox(cb) {
    imap.openBox("INBOX", false, cb);
  }

  imap.once("ready", function () {
    openInbox(function (err, box) {
      if (err) {
        const err = new Error();
        err.statusCode = 422;
        console.log(err);
      }
      imap.search(["UNSEEN"], function (erro, result) {
        if (erro) {
          const err = new Error();
          err.statusCode = 422;
          console.log(err);
        }
        if (!result || !result.length) {
          console.log("No Unseen messages");
        }

        var f = imap.fetch(result, { bodies: "" });
        f.on("message", function (message, seqNo) {
          console.log("Processing msg #" + seqNo);
          var parser = new MailParser();
          parser.on("headers", function (headers) {
            console.log("Headers: " + JSON.stringify(headers));
          });

          parser.on("data", (data) => {
            if (data.type === "text") {
              console.log(seqNo);
              console.log(data.text);
            }
          });

          message.on("body", function (stream) {
            stream.on("data", function (chunk) {
              parser.write(chunk.toString("utf8"));
            });
          });

          message.once("end", function () {
            parser.end();
          });
        });

        f.once("error", function () {
          return Promise.reject(err);
        });
        f.once("end", function () {
          console.log("Done fetching all unseen messages");
          imap.end();
        });
      });
    });
  });
  imap.once("error", function (err) {
    console.log(err);
  });

  imap.once("end", function () {
    console.log("Connection ended");
  });

  imap.connect();
};
