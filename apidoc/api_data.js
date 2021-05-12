define({ "api": [
  {
    "type": "delete",
    "url": "/user/me/logout",
    "title": "Log the user out (Delete their session)",
    "name": "DeleteUserSession",
    "group": "User",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "body",
            "description": "<p>User logged out</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/Routes/user/index.ts",
    "groupTitle": "User"
  },
  {
    "type": "get",
    "url": "/user/google",
    "title": "Access via Google",
    "name": "GetGoogleEntry",
    "group": "User",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "type",
            "description": "<p>The type of entry request, must be connect or entry</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/Routes/user/index.ts",
    "groupTitle": "User"
  },
  {
    "type": "get",
    "url": "/user/me",
    "title": "Logged in user",
    "name": "GetUserMe",
    "group": "User",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "body",
            "description": "<p>The User object</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/Routes/user/index.ts",
    "groupTitle": "User"
  },
  {
    "type": "get",
    "url": "/user/me/google",
    "title": "Get associated google account",
    "name": "GetUserMeGoogle",
    "group": "User",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "body",
            "description": "<p>The Google User object</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/Routes/user/index.ts",
    "groupTitle": "User"
  },
  {
    "type": "get",
    "url": "/user/me/local",
    "title": "Get associated local account",
    "name": "GetUserMeLocal",
    "group": "User",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "body",
            "description": "<p>The Local User object</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/Routes/user/index.ts",
    "groupTitle": "User"
  },
  {
    "type": "get",
    "url": "/user/google/callback",
    "title": "Handles the result of the access request",
    "name": "GoogleAccessResponse",
    "group": "User",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "type",
            "description": "<p>The type of entry request, must be connect or entry</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "body",
            "description": "<p>The User object</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/Routes/user/index.ts",
    "groupTitle": "User"
  },
  {
    "type": "post",
    "url": "/user/local/login",
    "title": "Login Users",
    "name": "PostLogin",
    "group": "User",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>The users Email</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "password",
            "description": "<p>The users Password</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "body",
            "description": "<p>The User object</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/Routes/user/index.ts",
    "groupTitle": "User"
  },
  {
    "type": "post",
    "url": "/user/local",
    "title": "Register User",
    "name": "PostUser",
    "group": "User",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>The new users email, must be unique.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "password",
            "description": "<p>The users password</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 201": [
          {
            "group": "Success 201",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>Email of created user</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/Routes/user/index.ts",
    "groupTitle": "User"
  }
] });
