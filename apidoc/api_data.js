define({ "api": [
  {
    "type": "post",
    "url": "/aws/file",
    "title": "Upload file to S3 bucket",
    "name": "CreateAwsFile",
    "group": "Aws",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "filename",
            "description": "<p>Name of file to be created</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "content",
            "description": "<p>Content of new file</p>"
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
            "field": "response",
            "description": "<p>Upload Successful.</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "401": [
          {
            "group": "401",
            "type": "String",
            "optional": false,
            "field": "response",
            "description": "<p>User must be logged in.</p>"
          }
        ],
        "412": [
          {
            "group": "412",
            "type": "String",
            "optional": false,
            "field": "response",
            "description": "<p>Bad body values.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/Routes/aws/index.ts",
    "groupTitle": "Aws"
  },
  {
    "type": "delete",
    "url": "/aws/file",
    "title": "Delete file from S3 bucket",
    "name": "DeleteAwsFile",
    "group": "Aws",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "filename",
            "description": "<p>Name of file to be deleted</p>"
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
            "field": "response",
            "description": "<p>File deleted.</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "401": [
          {
            "group": "401",
            "type": "String",
            "optional": false,
            "field": "response",
            "description": "<p>User must be logged in.</p>"
          }
        ],
        "404": [
          {
            "group": "404",
            "type": "String",
            "optional": false,
            "field": "response",
            "description": "<p>File does not exist.</p>"
          }
        ],
        "412": [
          {
            "group": "412",
            "type": "String",
            "optional": false,
            "field": "response",
            "description": "<p>Bad body values.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/Routes/aws/index.ts",
    "groupTitle": "Aws"
  },
  {
    "type": "get",
    "url": "/aws/file",
    "title": "Get file from S3 bucket",
    "name": "GetAwsFile",
    "group": "Aws",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "filename",
            "description": "<p>Name of file to be found</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 201": [
          {
            "group": "Success 201",
            "type": "Object",
            "optional": false,
            "field": "content",
            "description": "<p>List of files</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "401": [
          {
            "group": "401",
            "type": "String",
            "optional": false,
            "field": "response",
            "description": "<p>User must be logged in.</p>"
          }
        ],
        "404": [
          {
            "group": "404",
            "type": "String",
            "optional": false,
            "field": "response",
            "description": "<p>File does not exist.</p>"
          }
        ],
        "412": [
          {
            "group": "412",
            "type": "String",
            "optional": false,
            "field": "response",
            "description": "<p>Bad body values.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/Routes/aws/index.ts",
    "groupTitle": "Aws"
  },
  {
    "type": "get",
    "url": "/aws/file",
    "title": "Get list of files from S3 bucket",
    "name": "GetAwsFileList",
    "group": "Aws",
    "success": {
      "fields": {
        "Success 201": [
          {
            "group": "Success 201",
            "type": "Object",
            "optional": false,
            "field": "content",
            "description": "<p>List of files</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "401": [
          {
            "group": "401",
            "type": "String",
            "optional": false,
            "field": "response",
            "description": "<p>User must be logged in.</p>"
          }
        ],
        "404": [
          {
            "group": "404",
            "type": "String",
            "optional": false,
            "field": "response",
            "description": "<p>No files exist.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/Routes/aws/index.ts",
    "groupTitle": "Aws"
  },
  {
    "type": "put",
    "url": "/aws/file",
    "title": "Update file in S3 bucket",
    "name": "UpdateAwsFile",
    "group": "Aws",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "filename",
            "description": "<p>Name of file to be updated</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "content",
            "description": "<p>Content of new file</p>"
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
            "field": "response",
            "description": "<p>File successfully updated.</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "401": [
          {
            "group": "401",
            "type": "String",
            "optional": false,
            "field": "response",
            "description": "<p>User must be logged in.</p>"
          }
        ],
        "412": [
          {
            "group": "412",
            "type": "String",
            "optional": false,
            "field": "response",
            "description": "<p>Bad body values.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/Routes/aws/index.ts",
    "groupTitle": "Aws"
  },
  {
    "type": "post",
    "url": "/google/file",
    "title": "New google file",
    "name": "CreateGoogleFile",
    "group": "Google",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "filename",
            "description": "<p>The expected name of the new file.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "content",
            "description": "<p>The expected content of the new file</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 201": [
          {
            "group": "Success 201",
            "type": "Object",
            "optional": false,
            "field": "file",
            "description": "<p>Standard google file object</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "401": [
          {
            "group": "401",
            "type": "String",
            "optional": false,
            "field": "response",
            "description": "<p>Error description</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/Routes/google/index.ts",
    "groupTitle": "Google"
  },
  {
    "type": "delete",
    "url": "/google/file",
    "title": "Delete google file",
    "name": "DeleteGoogleFile",
    "group": "Google",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "fileId",
            "description": "<p>The id of the file to be deleted</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 201": [
          {
            "group": "Success 201",
            "type": "Object",
            "optional": false,
            "field": "response",
            "description": "<p>File deleted</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "401": [
          {
            "group": "401",
            "type": "String",
            "optional": false,
            "field": "response",
            "description": "<p>Error description</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/Routes/google/index.ts",
    "groupTitle": "Google"
  },
  {
    "type": "get",
    "url": "/google/files",
    "title": "Get List of files",
    "name": "ListGoogleFiles",
    "group": "Google",
    "success": {
      "fields": {
        "Success 201": [
          {
            "group": "Success 201",
            "type": "Object",
            "optional": false,
            "field": "content",
            "description": "<p>List of files from drive</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "401": [
          {
            "group": "401",
            "type": "String",
            "optional": false,
            "field": "response",
            "description": "<p>Error description</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/Routes/google/index.ts",
    "groupTitle": "Google"
  },
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
    "type": "get",
    "url": "/user/google/profile_pic",
    "title": "Gets an authorized users profile picture",
    "name": "GoogleProfilePicture",
    "group": "User",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "content",
            "description": "<p>Google's defined profile picture object</p>"
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
