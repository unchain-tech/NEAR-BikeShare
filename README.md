# About The Project

This project deploys a bike-sharing service using self-issued ft as utility tokens.

- End users can use, inspect and return bikes
- To use a bike, End users need to spend ft.
- End-users can receive ft as a reward for inspecting bikes

Link of deployed project: [NEAR-bikesharing](https://near-bikeshare-dapp.netlify.app).   
※ A [Test NEAR wallet](https://wallet.testnet.near.org/) is required in advance.

The UI will look like this:

<img width="570" alt="0_1_1" src="https://user-images.githubusercontent.com/77039327/189507269-bfb5420e-869b-41e6-829d-33e3e8850a59.png">

# How to build

It is not enough to type a few commands to build this project because it is built on the assumption that:

- You have deployed contracts (especially ft-contracts) in your account
- You create a near-app specifying 3.1.0.  
  Not sure why, since cloning this project and `npm install` will not result in the same environment, execute `npx create-near-app@3.1.0` locally.

---
以下レポジトリの説明・まとめ

# Chain deployed to: NEAR

# Contract-1: ft contract

fungible token(以降 ft)を発行, 転送するコントラクト

## Stack description

- Rust
    
    Rustで記述したコードをwasm形式にコンパイルしてデプロイします.
    
- Library
    - near_sdk
        
        NEARのコントラクトを書く上で標準的な機能を提供します.
        
    - near_contract_standards::fungible_token
        
        ftとしての(転送などの)機能を提供します.
        
- cross contract call
    
    あるコントラクトが別のコントラクトのメソッドを呼び出すことを可能とする機能.
    near_sdkから利用できます.
    

## Directory structure

```bash
contract
├── Cargo.toml
└── src
    └── lib.rs
```

- `Cargo.toml`
    
    バージョン管理ファイル.
    
- `src/lib.rs`
    
    FTコントラクトの基本機能の実装と簡易的なテストをしています.
    (機能の実装はほとんどライブラリを使用しているのでコード量は少ないです)
    

## Code walk-through

フロントエンド側とコントラクトの接続は`frontend/assets/js/near/utils.js`(以降 `utils.js`)で行っているため, 
基本的にフロントからコントラクトのメソッド呼び出しは`utils.js`を使用します.

### ftの発行

トークン所有者のid, 供給総量, メタデータを引数に`new`メソッドの呼び出し.
フロントとは繋がず, コントラクトのデプロイ時に`new`メソッドの呼び出しまで済ませます.

### アカウントの登録とその確認

ftのコントラクトでは, ftのやり取りをするアカウントが増えるほど使用するストレージが増えるため, 
アカウントにストレージの使用量を支払うことを求める仕組みになっています.
これをアカウントの登録と呼ぶことにします.
フロント側でユーザーアカウントの登録を確認し, 登録が済んでいなければ登録を促します.
登録の確認にはフロントの`utils.js`を通してユーザアカウントが
ftコントラクトの`storage_balance_of`メソッドを呼び出し, 
登録には`storage_deposit`メソッドを呼び出します.

### ftの送信

フロントの`utils.js`を通してユーザアカウントが`ft_transfer`メソッドを呼び出します.

### ftの残高確認

フロントの`utils.js`を通してユーザアカウントが`ft_transfer`メソッドを呼び出します.

### ftの送信+他のコントラクトのメソッド呼び出し

本プロジェクトで作るアプリでは
ユーザがバイクを使用する際, 決まった量のftをバイク管理のコントラクト(がデプロイされているアカウント)へ支払う必要があります.
それには以下の一連の処理を同期的に行う必要があります.

- ユーザがftコントラクトのft転送メソッドを呼び出す
- ftコントラクトはバイク管理のコントラクトへftを転送
- ftを受信したバイク管理のコントラクトはユーザによるバイクの使用処理を進める

この処理はftコントラクトに`ft_transfer_call`, 
バイク管理のコントラクトに`ft_on_transfer`というメソッドを用意することで実現できます.
よってフロントの`utils.js`を通してユーザアカウントが`ft_transfer_call`を呼び出します.

# Contract-2: bike contract

バイクのシェアリングサービスを提供するためのバイク管理コントラクト

## Stack description

(各stackの説明は[Contract-1のセクション](https://www.notion.so/documentation-template-rakiyama-365e6fb11c534b3c9be345eb2dd0a98b)を参照)

- Rust
- near_sdk
- cross contract call

## Directory structure

```bash
contract
├── Cargo.toml
└── src
    └── lib.rs
```

- `Cargo.toml`
    
    バージョン管理ファイル.
    
- `src/lib.rs`
    
    バイクを管理するコントラクトの実装とユニットテストの実装をしています.
    

## Code walk-through

ftコントラクトと同じく,
フロントエンドからコントラクトのメソッド呼び出しはフロント側の`utils.js`を通して行われます.

### バイクの使用

[ftコントラクトのセクション](https://www.notion.so/documentation-template-rakiyama-365e6fb11c534b3c9be345eb2dd0a98b) で説明した`ft_on_transfer`メソッドを使用します.
フロントの`utils.js`を通してユーザアカウントがftコントラクトの`ft_transfer_call`を呼び出し, 
それがトリガーとなり`ft_on_transfer`を実行します.

### バイクの点検

フロントの`utils.js`を通してユーザアカウントが`inspect_bike`メソッドを呼び出します.

### バイクの返却

フロントの`utils.js`を通してユーザアカウントが`return_bike`メソッドを呼び出します.

- 点検からの返却時
    
    点検をしてくれたユーザアカウントには報酬としてftを送信するため, 内部で
    ftコントラクトの`ft_transfer`メソッドを呼び出しています([cross contract call](https://www.notion.so/documentation-template-rakiyama-365e6fb11c534b3c9be345eb2dd0a98b)).
    bikeコントラクトからユーザアカウントにftを転送します.
    
    また, ftの転送処理と返却処理を同期的に行うため, 
    転送処理の結果に応じて返却処理を行うコールバック関数を用意しています.
    

# Client-side

## Stack description

- javascript
- React
- near-api-js
    
    nearのコントラクトと連携するためのライブラリ
    

## Directory structure

```bash
frontend/
├── App.js
├── assets
│   ├── css
│   │   └── global.css
│   ├── img
│   │   ├── bike.png
│   │   ├── favicon.ico
│   │   ├── logo-black.svg
│   │   └── logo-white.svg
│   └── js
│       └── near
│           ├── config.js
│           └── utils.js
├── index.html
└── index.js
```

- `frontend/App.js`
    
    フロントエンドの表示部分を担当するファイルです.
    ユーザが触れる各ボタンとコントラクトのメソッドを呼び出す関数(`utils.js`内に定義)を繋げています.
    
- `frontend/App.js/assets/css/global.css`
    
    cssの設定をまとめています.
    
- `frontend/App.js/assets/img/`
    
    表示に必要な画像が入っています.
    
- `frontend/App.js/assets/js/near/utils.js`
    
    `near-api-js`を利用してコントラクトとの接続を行っています.
    
- `frontend/App.js/assets/js/near/config.js`
    
    `frontend/App.js/assets/js/near/utils.js`に必要な設定を定義しています.
    

## Code walk-through

### サインイン・サインアウト

`App.js`から`utils.js`に定義した`login`関数を呼び出すことで, 
ユーザアカウントにbikeコントラクトのメソッドを呼び出す権限を与えます.
これによりbikeのコントラクトの(tokenの移動を伴わない)メソッド呼び出しはサインなしで行うことができます.
またその情報をリセットすることでサインアウトします.

### アカウントの登録

[ftコントラクトのセクション](https://www.notion.so/documentation-template-rakiyama-365e6fb11c534b3c9be345eb2dd0a98b)で説明したアカウントの登録に関して処理します.

`App.js`の`newUserRegister`関数から`utils.js`に定義したftコントラクトのメソッドを呼び出します.

### 全てのバイクの情報を取得

まず, `App.js`から`utils.js`に定義したbikeコントラクトのメソッドを呼び出しバイクの総数を取得します.
次にバイクの数だけloop処理を行い, 各バイクのデータを取得(同じくbikeコントラクトのメソッド呼び出し).
取得したデータとログイン中のアカウントのidを照合して, 
ログイン中のユーザにとって各バイクが使用可能/点検可能/返却可能かのデータを
フロントエンド側で用意したデータ型`allBikeInfo`に格納します.

### バイクの情報を表示

前項で取得した全てのバイクの情報をloop処理でリストアップします.

### バイクの使用

`App.js`の関数から`utils.js`に定義したftコントラクトの`ft_transfer_call`メソッドを呼び出します.

### バイクの点検・返却

`App.js`の関数から`utils.js`に定義したbikeコントラクトのメソッドを呼び出します.

### ftの転送・残高確認

`App.js`の関数から`utils.js`に定義したftコントラクトのメソッドを呼び出します.

# Whole Directory structure

```bash
root
├── FT_contract/
└── NEAR_sharing_economy/
    ├── contract/
    ├── frontend/
    ├── integration-tests/
    └── package.json
```

ftコントラクトのディレクトリ(`FT_contract`)が独立したディレクトリ, 
bikeコントラクト(`NEAR_sharing_economy/contract/`)と
フロントエンド(`NEAR_sharing_economy/frontend/` )が同じディレクトリ内に属します.

ftコントラクトは独立した機能を持っているため別のディレクトリとして分離させました.

# 参考リンク

### フロント

- near-api-js
    
    [Using JavaScript API to interact with NEAR | NEAR Documentation](https://docs.near.org/tools/near-api-js/quick-reference)
    
- sighnInで付与している権限について
    
    [Access Keys | NEAR Documentation](https://docs.near.org/concepts/basics/accounts/access-keys#function-call-keys)
    

### FT

- ftコントラクトのコードの参考にしたもの(コードの内容は全て同じです)
    
    [GitHub - near-examples/FT: Example implementations of money-like tokens, where one token is the same as any other, using the NEP-141 spec (similar to ERC-20)](https://github.com/near-examples/FT)
    
- FTの規約
    
    [Fungible Token | NEAR Protocol Specification](https://nomicon.io/Standards/Tokens/FungibleToken/Core#reference-level-explanation)
    
- コントラクトに課せられるストレージステーキングの話
    
    [Storage Staking | NEAR Documentation](https://docs.near.org/concepts/storage/storage-staking)
    
- コントラクトがストレージの使用量をどのように管理するかの話
    
    [Storage Management | NEAR Protocol Specification](https://nomicon.io/Standards/StorageManagement)
    

### cross-contract call

- 書き方, 文法, ガス代の付け方など
    
    [Callbacks | NEAR SDK docs](https://www.near-sdk.io/cross-contract/callbacks)
    
- トランザクションとレシートのやり取りの流れ
    
    [Cross-Contract Call | NEAR Protocol Specification](https://nomicon.io/RuntimeSpec/Scenarios/CrossContractCall)
    
- `ft_transfer_call`の説明
    
    [Fungible Token | NEAR Protocol Specification](https://nomicon.io/Standards/Tokens/FungibleToken/Core)
    
- callback関数に使用する`#[private]` macroの意味
    
    [Adding cross-contract calls, access key shuffling, etc. | NEAR SDK docs](https://www.near-sdk.io/zero-to-hero/intermediate/cross-contract-calls#claim_reward)
    

### test

- unite test
    
    [Unit Tests | NEAR SDK docs](https://www.near-sdk.io/testing/unit-tests)
    
- integration test
    
    [Integration Tests | NEAR SDK docs](https://www.near-sdk.io/testing/integration-tests)
    
    - ライブラリ(m1 macでは新バージョンが対応していないことについても書いてある)
        
        [GitHub - near/workspaces-rs: Write tests once, run them both on NEAR TestNet and a controlled NEAR Sandbox local environment via Rust](https://github.com/near/workspaces-rs)
        

### deploy

- コンパイルに使用するparcelについて
    
    [Targets](https://parceljs.org/features/targets/#%24-parcel-%3Centries%3E)
    

### other

- コントラクト内のメソッドで, U128やPromiseという型をどう扱うかについて
    
    [Sending $NEAR | NEAR SDK docs](https://www.near-sdk.io/promises/token-tx)
    
- コントラクト内のメソッドにおいて, `#[near_bindgen]` macroやinit関数の説明
    
    [near_bindgen | NEAR SDK docs](https://www.near-sdk.io/contract-structure/near-bindgen)
    
- ガス代について
    
    [Gas | NEAR Documentation](https://docs.near.org/concepts/basics/transactions/gas)
