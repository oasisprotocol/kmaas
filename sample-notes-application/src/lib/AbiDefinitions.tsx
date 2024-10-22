export const LOGGING_ABI = [
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "bytes32",
          "name": "hash",
          "type": "bytes32"
        }
      ],
      "name": "NoteCreated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "bytes32",
          "name": "hash",
          "type": "bytes32"
        }
      ],
      "name": "NoteUpdated",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "hash",
          "type": "bytes32"
        }
      ],
      "name": "logNoteCreated",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "hash",
          "type": "bytes32"
        }
      ],
      "name": "logNoteUpdated",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
];

export const KMAAS_ABI = [
  {
    "inputs": [],
    "name": "DER_Split_Error",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "expmod_Error",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "k256Decompress_Invalid_Length_Error",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "k256DeriveY_Invalid_Prefix_Error",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "recoverV_Error",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "in_contract",
        "type": "address"
      },
      {
        "internalType": "bytes",
        "name": "in_data",
        "type": "bytes"
      }
    ],
    "name": "call",
    "outputs": [
      {
        "internalType": "bool",
        "name": "success",
        "type": "bool"
      },
      {
        "internalType": "bytes",
        "name": "out_data",
        "type": "bytes"
      }
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "grantee",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "expiry",
        "type": "uint256"
      }
    ],
    "name": "grantPermission",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "grantee",
        "type": "address"
      }
    ],
    "name": "hasPermission",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "starterOwner",
        "type": "address"
      }
    ],
    "name": "initialize",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "in_contract",
        "type": "address"
      },
      {
        "internalType": "bytes",
        "name": "in_data",
        "type": "bytes"
      }
    ],
    "name": "makeProxyTx",
    "outputs": [
      {
        "internalType": "bytes",
        "name": "output",
        "type": "bytes"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes",
        "name": "data",
        "type": "bytes"
      }
    ],
    "name": "proxy",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "publicKey",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "grantee",
        "type": "address"
      }
    ],
    "name": "revokePermission",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "digest",
        "type": "bytes32"
      }
    ],
    "name": "sign",
    "outputs": [
      {
        "components": [
          {
            "internalType": "bytes32",
            "name": "r",
            "type": "bytes32"
          },
          {
            "internalType": "bytes32",
            "name": "s",
            "type": "bytes32"
          },
          {
            "internalType": "uint256",
            "name": "v",
            "type": "uint256"
          }
        ],
        "internalType": "struct SignatureRSV",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "uint64",
            "name": "nonce",
            "type": "uint64"
          },
          {
            "internalType": "uint256",
            "name": "gasPrice",
            "type": "uint256"
          },
          {
            "internalType": "uint64",
            "name": "gasLimit",
            "type": "uint64"
          },
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          },
          {
            "internalType": "bytes",
            "name": "data",
            "type": "bytes"
          },
          {
            "internalType": "uint256",
            "name": "chainId",
            "type": "uint256"
          }
        ],
        "internalType": "struct EIP155Signer.EthTx",
        "name": "txToSign",
        "type": "tuple"
      }
    ],
    "name": "signEIP155",
    "outputs": [
      {
        "internalType": "bytes",
        "name": "",
        "type": "bytes"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "in_contract",
        "type": "address"
      },
      {
        "internalType": "bytes",
        "name": "in_data",
        "type": "bytes"
      }
    ],
    "name": "staticcall",
    "outputs": [
      {
        "internalType": "bool",
        "name": "success",
        "type": "bool"
      },
      {
        "internalType": "bytes",
        "name": "out_data",
        "type": "bytes"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_controller",
        "type": "address"
      }
    ],
    "name": "updateController",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

export const KMAAS_SYMKEY_ABI = [
    {
      "inputs": [],
      "name": "DER_Split_Error",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "expmod_Error",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "k256Decompress_Invalid_Length_Error",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "k256DeriveY_Invalid_Prefix_Error",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "recoverV_Error",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "in_contract",
          "type": "address"
        },
        {
          "internalType": "bytes",
          "name": "in_data",
          "type": "bytes"
        }
      ],
      "name": "call",
      "outputs": [
        {
          "internalType": "bool",
          "name": "success",
          "type": "bool"
        },
        {
          "internalType": "bytes",
          "name": "out_data",
          "type": "bytes"
        }
      ],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "internalType": "bytes",
          "name": "in_data",
          "type": "bytes"
        }
      ],
      "name": "decryptSymKey",
      "outputs": [
        {
          "internalType": "bytes",
          "name": "out_data",
          "type": "bytes"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "name",
          "type": "string"
        }
      ],
      "name": "deleteSymKey",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "internalType": "bytes",
          "name": "in_data",
          "type": "bytes"
        }
      ],
      "name": "encryptSymKey",
      "outputs": [
        {
          "internalType": "bytes",
          "name": "out_data",
          "type": "bytes"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "internalType": "bool",
          "name": "overwrite",
          "type": "bool"
        }
      ],
      "name": "generateSymKey",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "name",
          "type": "string"
        }
      ],
      "name": "getSymKey",
      "outputs": [
        {
          "internalType": "AccountWithSymKey.Key",
          "name": "key",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "grantee",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "expiry",
          "type": "uint256"
        }
      ],
      "name": "grantPermission",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "grantee",
          "type": "address"
        }
      ],
      "name": "hasPermission",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "starterOwner",
          "type": "address"
        }
      ],
      "name": "initialize",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "in_contract",
          "type": "address"
        },
        {
          "internalType": "bytes",
          "name": "in_data",
          "type": "bytes"
        }
      ],
      "name": "makeProxyTx",
      "outputs": [
        {
          "internalType": "bytes",
          "name": "output",
          "type": "bytes"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes",
          "name": "data",
          "type": "bytes"
        }
      ],
      "name": "proxy",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "publicKey",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "grantee",
          "type": "address"
        }
      ],
      "name": "revokePermission",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "digest",
          "type": "bytes32"
        }
      ],
      "name": "sign",
      "outputs": [
        {
          "components": [
            {
              "internalType": "bytes32",
              "name": "r",
              "type": "bytes32"
            },
            {
              "internalType": "bytes32",
              "name": "s",
              "type": "bytes32"
            },
            {
              "internalType": "uint256",
              "name": "v",
              "type": "uint256"
            }
          ],
          "internalType": "struct SignatureRSV",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "uint64",
              "name": "nonce",
              "type": "uint64"
            },
            {
              "internalType": "uint256",
              "name": "gasPrice",
              "type": "uint256"
            },
            {
              "internalType": "uint64",
              "name": "gasLimit",
              "type": "uint64"
            },
            {
              "internalType": "address",
              "name": "to",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "value",
              "type": "uint256"
            },
            {
              "internalType": "bytes",
              "name": "data",
              "type": "bytes"
            },
            {
              "internalType": "uint256",
              "name": "chainId",
              "type": "uint256"
            }
          ],
          "internalType": "struct EIP155Signer.EthTx",
          "name": "txToSign",
          "type": "tuple"
        }
      ],
      "name": "signEIP155",
      "outputs": [
        {
          "internalType": "bytes",
          "name": "",
          "type": "bytes"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "in_contract",
          "type": "address"
        },
        {
          "internalType": "bytes",
          "name": "in_data",
          "type": "bytes"
        }
      ],
      "name": "staticcall",
      "outputs": [
        {
          "internalType": "bool",
          "name": "success",
          "type": "bool"
        },
        {
          "internalType": "bytes",
          "name": "out_data",
          "type": "bytes"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_controller",
          "type": "address"
        }
      ],
      "name": "updateController",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]

export const VALIDATOR_ABI = [
     {
       "inputs": [
         {
           "internalType": "address",
           "name": "account",
           "type": "address"
         },
         {
           "components": [
             {
               "internalType": "Validator.CredentialType",
               "name": "credType",
               "type": "uint32"
             },
             {
               "internalType": "bytes",
               "name": "credData",
               "type": "bytes"
             }
           ],
           "internalType": "struct Validator.Credential",
           "name": "credential",
           "type": "tuple"
         }
       ],
       "stateMutability": "nonpayable",
       "type": "constructor"
     },
     {
       "inputs": [],
       "name": "CUSTODIAN",
       "outputs": [
         {
           "internalType": "Validator.CredentialType",
           "name": "",
           "type": "uint32"
         }
       ],
       "stateMutability": "view",
       "type": "function"
     },
     {
       "inputs": [],
       "name": "PASSWORD",
       "outputs": [
         {
           "internalType": "Validator.CredentialType",
           "name": "",
           "type": "uint32"
         }
       ],
       "stateMutability": "view",
       "type": "function"
     },
     {
       "inputs": [
         {
           "internalType": "address",
           "name": "account",
           "type": "address"
         },
         {
           "internalType": "bytes",
           "name": "credential",
           "type": "bytes"
         },
         {
           "internalType": "bytes",
           "name": "in_data",
           "type": "bytes"
         }
       ],
       "name": "callAccount",
       "outputs": [
         {
           "internalType": "bool",
           "name": "success",
           "type": "bool"
         },
         {
           "internalType": "bytes",
           "name": "out_data",
           "type": "bytes"
         }
       ],
       "stateMutability": "view",
       "type": "function"
     },
     {
       "inputs": [
         {
           "internalType": "address",
           "name": "account",
           "type": "address"
         },
         {
           "internalType": "bytes",
           "name": "credential",
           "type": "bytes"
         },
         {
           "internalType": "bytes",
           "name": "in_data",
           "type": "bytes"
         }
       ],
       "name": "transactAccount",
       "outputs": [
         {
           "internalType": "bool",
           "name": "success",
           "type": "bool"
         },
         {
           "internalType": "bytes",
           "name": "out_data",
           "type": "bytes"
         }
       ],
       "stateMutability": "payable",
       "type": "function"
     },
     {
       "inputs": [
         {
           "internalType": "address",
           "name": "account",
           "type": "address"
         },
         {
           "internalType": "bytes",
           "name": "credData",
           "type": "bytes"
         },
         {
           "internalType": "Validator.CredentialType",
           "name": "newCredType",
           "type": "uint32"
         },
         {
           "internalType": "bytes",
           "name": "newCredData",
           "type": "bytes"
         }
       ],
       "name": "updateCredential",
       "outputs": [],
       "stateMutability": "nonpayable",
       "type": "function"
     },
     {
       "inputs": [
         {
           "internalType": "address",
           "name": "account",
           "type": "address"
         },
         {
           "internalType": "bytes",
           "name": "credData",
           "type": "bytes"
         }
       ],
       "name": "validate",
       "outputs": [
         {
           "internalType": "bool",
           "name": "",
           "type": "bool"
         }
       ],
       "stateMutability": "view",
       "type": "function"
     }
];

export const VALIDATOR_SIWE_ABI = [
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "inDomain",
        "type": "string"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "AddressMismatch",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ChainIdMismatch",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "DomainMismatch",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "Expired",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidAddressLength",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidNonce",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "NotBeforeInFuture",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "RevokedBearer",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "WrongSigner",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "CUSTODIAN",
    "outputs": [
      {
        "internalType": "Validator.CredentialType",
        "name": "",
        "type": "uint32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "PASSWORD",
    "outputs": [
      {
        "internalType": "Validator.CredentialType",
        "name": "",
        "type": "uint32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "components": [
          {
            "internalType": "Validator.CredentialType",
            "name": "credType",
            "type": "uint32"
          },
          {
            "internalType": "bytes",
            "name": "credData",
            "type": "bytes"
          }
        ],
        "internalType": "struct Validator.Credential",
        "name": "credential",
        "type": "tuple"
      }
    ],
    "name": "addAccount",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "acc",
        "type": "address"
      },
      {
        "internalType": "bytes",
        "name": "bearer",
        "type": "bytes"
      }
    ],
    "name": "authMsgSender",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "internalType": "bytes",
        "name": "credential",
        "type": "bytes"
      },
      {
        "internalType": "bytes",
        "name": "in_data",
        "type": "bytes"
      }
    ],
    "name": "callAccount",
    "outputs": [
      {
        "internalType": "bool",
        "name": "success",
        "type": "bool"
      },
      {
        "internalType": "bytes",
        "name": "out_data",
        "type": "bytes"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "internalType": "bytes",
        "name": "credential",
        "type": "bytes"
      },
      {
        "internalType": "bool",
        "name": "token",
        "type": "bool"
      },
      {
        "internalType": "bytes",
        "name": "in_data",
        "type": "bytes"
      }
    ],
    "name": "callAccount",
    "outputs": [
      {
        "internalType": "bool",
        "name": "success",
        "type": "bool"
      },
      {
        "internalType": "bytes",
        "name": "out_data",
        "type": "bytes"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "domain",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "siweMsg",
        "type": "string"
      },
      {
        "components": [
          {
            "internalType": "bytes32",
            "name": "r",
            "type": "bytes32"
          },
          {
            "internalType": "bytes32",
            "name": "s",
            "type": "bytes32"
          },
          {
            "internalType": "uint256",
            "name": "v",
            "type": "uint256"
          }
        ],
        "internalType": "struct SignatureRSV",
        "name": "sig",
        "type": "tuple"
      }
    ],
    "name": "login",
    "outputs": [
      {
        "internalType": "bytes",
        "name": "",
        "type": "bytes"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "internalType": "bytes",
        "name": "credential",
        "type": "bytes"
      },
      {
        "internalType": "bytes",
        "name": "in_data",
        "type": "bytes"
      }
    ],
    "name": "transactAccount",
    "outputs": [
      {
        "internalType": "bool",
        "name": "success",
        "type": "bool"
      },
      {
        "internalType": "bytes",
        "name": "out_data",
        "type": "bytes"
      }
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "internalType": "bytes",
        "name": "credential",
        "type": "bytes"
      },
      {
        "internalType": "bool",
        "name": "token",
        "type": "bool"
      },
      {
        "internalType": "bytes",
        "name": "in_data",
        "type": "bytes"
      }
    ],
    "name": "transactAccount",
    "outputs": [
      {
        "internalType": "bool",
        "name": "success",
        "type": "bool"
      },
      {
        "internalType": "bytes",
        "name": "out_data",
        "type": "bytes"
      }
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "internalType": "bytes",
        "name": "credData",
        "type": "bytes"
      },
      {
        "internalType": "Validator.CredentialType",
        "name": "newCredType",
        "type": "uint32"
      },
      {
        "internalType": "bytes",
        "name": "newCredData",
        "type": "bytes"
      }
    ],
    "name": "updateCredential",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "internalType": "bytes",
        "name": "credData",
        "type": "bytes"
      }
    ],
    "name": "validate",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

export const ACCOUNT_FACTORY_ABI = [
   {
     "anonymous": false,
     "inputs": [
       {
         "indexed": false,
         "internalType": "address",
         "name": "contractAddress",
         "type": "address"
       }
     ],
     "name": "AccountCreated",
     "type": "event"
   },
   {
     "inputs": [
       {
         "internalType": "address",
         "name": "target",
         "type": "address"
       }
     ],
     "name": "clone",
     "outputs": [],
     "stateMutability": "nonpayable",
     "type": "function"
   }
 ];

export const NOTES_ABI = [
     {
       "anonymous": false,
       "inputs": [
         {
           "indexed": false,
           "internalType": "address",
           "name": "kmaasAddress",
           "type": "address"
         },
         {
           "indexed": false,
           "internalType": "address",
           "name": "publicKey",
           "type": "address"
         }
       ],
       "name": "UserCreated",
       "type": "event"
     },
     {
       "inputs": [
         {
           "internalType": "address",
           "name": "validatorAddress",
           "type": "address"
         },
         {
           "components": [
             {
               "internalType": "CredentialType",
               "name": "credType",
               "type": "uint32"
             },
             {
               "internalType": "bytes",
               "name": "credData",
               "type": "bytes"
             }
           ],
           "internalType": "struct Credential",
           "name": "cred",
           "type": "tuple"
         }
       ],
       "name": "createUser",
       "outputs": [
         {
           "internalType": "address",
           "name": "kmaasAddress",
           "type": "address"
         }
       ],
       "stateMutability": "nonpayable",
       "type": "function"
     },
     {
       "inputs": [
         {
           "internalType": "bytes",
           "name": "data",
           "type": "bytes"
         }
       ],
       "name": "proxy",
       "outputs": [],
       "stateMutability": "payable",
       "type": "function"
     }
   ];