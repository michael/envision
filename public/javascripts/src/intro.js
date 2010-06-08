/*jslint white: true, browser: true, rhino: true, onevar: true, undef: true, nomen: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, newcap: true, immed: true, strict: true, indent: 2 */
/*global $, pv*/
"use strict";

var nested_collection_fixture = {
  "items": {
    "metallica": {
      "name": "Metallica",
      "similar_artists": {
        "korn": {
          "name": "Korn",
          "score": 0.8
        },
        "acdc": {
          "name": "AC/DC",
          "score": 0.7
        },
        "gunsnroses": {
          "name": "Guns'n Rosos",
          "score": 0.3
        },
        "fatboy_slim": {
          "name": "Fatboy Slim",
          "score": 0.2
        }
      }
    },
    "korn": {
      "name": "Korn",
      "similar_artists": {
        "metallica": {
          "name": "Metallica",
          "score": 0.8
        },
        "nickelback": {
          "name": "Nickelback",
          "score": 0.7
        },
        "bush": {
          "name": "Bush",
          "score": 0.3
        }
      }
    }
  },
  "properties": {
    "name": {
      "name": "Artist Name",
      "type": "string",
      "unique": true
    },
    "similar_artists": {
      "name": "Similar Artists",
      "type": "collection",
      "unique": true,
      "properties": {
        "name": {
          "name": "Artist Name",
          "type": "string",
          "unique": true 
        },
        "score": {
          "name": "Similarity Score",
          "type": "number",
          "unique": true 
        }
      }
    }
  }
};