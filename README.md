# crunchbase-alerts-processing

# Purpose

🍫 This is a Google Apps Script project to **process email alerts sent by crunchbase** and put them in a GSheet. A lot of businesses, are very much interested in big events occuring in their target companies (_fund raisings_, _acquisitions_, you name it). They're usually a sign they'll need exterior help.

For instance, a recruitment agency might be interested in companies being acquired because that means they'll most certainly need extra staff to smooth out the mergere. That allows for a contextual approach and potentially new business:

> Hey Company X! Congrats on your new acquisition, it's a new milestone! We're here for you if you need staff to overhaul the mergere 😉

# Code organization

## Classes

There are three _classes files_: `MailService.js`, `HtmlParser.js` and `Signals.js`.

In each of these files, there is a single function that **acts like a class**. A few methods are attached to each of the classes. Methods attached to MailService, for instance, only deal with the user's mailbox (Gmail for the time being). This orginization allows for **better code segmentation and clarity**.

## Utilities

There's a single `utils.js` file that contains a few **utility functions** used throughout the project. They can be reused inside different classes, whereas methods cannot be used outside the scope of their classes - obviously.

## Variables files

There's a single variables files: `variables.js` which contains global variables required to run the project.

## Main file

This file contains a single "encapsulating" function. This is **the function to set a trigger for** in Google Apps Script. It's the only function the admin should worry about. It encompasses the whole project's logic.

# Installation

## Pre-Requisites

1. You have a Crunchbase Starter license.
2. You installed [@google/clasp](https://github.com/google/clasp/) and know how to use it in your CLI.
3. You're following [this tutorial](https://spiral-sturgeon-359.notion.site/Tutorial-69fba4bdc05b4b4ea769f779938023fe).

## Tutorial

1. Fork this repo on your github profile and clone it into your machine.

2. In `variables.js` change the spreadsheet id to the id of the spreadsheet you duplicated:

   ```js
   return Object.freeze({
       ...
       "SPREADSHEET": {
           "spreadsheetId": "👉 Spreadsheet Id Here 👈 ",
   });
   ```

   and the path to the email alerts in your mailbox:

   ```js
   return Object.freeze({
       "MAIL": {
           "label": "**Label/Sub Label/Crunchbase**"
       },
       ...
   });
   ```

3. Clasp push the code from your local repo _to the Google Apps Script project attached to the spreadsheet you just duplicated_.

# Ackowledgements

Coded with grit 💪 by [Bastien Velitchkine](https://www.linkedin.com/in/bastienvelitchkine/).
