import http       from "http";
import express    from "express";
import bodyParser from "body-parser";
import Twilio     from "twilio";

export default class Server {
  constructor(pixel, creation) {

    this.pixel = pixel;
    this.creation = creation;

// const http = require('http');
// const express = require('express');
// const MessagingResponse = require('twilio').twiml.MessagingResponse;

    console.log("hi");

    const MessagingResponse = Twilio.twiml.MessagingResponse;
    const app = express();
    app.use(bodyParser.urlencoded({extended: false}));

    app.post("/sms", (req, res) => {
      const twiml = new MessagingResponse();

      this.creation.addString(req.body.Body);

      res.send("OK");
    });

    app.get("/", (req, res) => {
      res.send("hello");
    });

    http.createServer(app)
      .listen(1337, () => {
        console.log("Express server listening on port 1337");
      });
  }
}