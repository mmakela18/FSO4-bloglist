# FSO4-bloglist
Bloglist exercise, Fullstackopen 2021

An application that should handle blog-listings with user-creation and -authentication.

Backend to exercise 5 of Fullstackopen.

# How to run:

Clone repository

Run "npm install" in its directory

Define ENVs PORT and MONGODB_URI (.env supportedl)

Run "npm start"

# Cataloque of bashing my head to the wall

## 10.11.2021

Problem: dotenv seemingly doesn't load .env

Attempted solution: do over 30 minutes of research on why dotenv doesn't load .env

Actual solution: put on glasses and see that MONDODB_URI =/= MONGODB_URI

Also learned that dotenv won't override local environment variables.
So defining PORT in ~/.bashrc in previous exercise was a rookie mistake.
