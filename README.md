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

More details will follow soon..
