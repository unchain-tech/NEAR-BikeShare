import { connect, Contract, keyStores, WalletConnection } from 'near-api-js';

import getConfig from './config';

const nearConfig = getConfig(process.env.NODE_ENV || 'development');

// Initialize contract & set global variables
export async function initContract() {
  // Initialize connection to the NEAR testnet
  const near = await connect(
    Object.assign(
      { deps: { keyStore: new keyStores.BrowserLocalStorageKeyStore() } },
      nearConfig,
    ),
  );

  // Initializing Wallet based Account. It can work with NEAR testnet wallet that
  // is hosted at https://wallet.testnet.near.org
  window.walletConnection = new WalletConnection(near);

  // Getting the Account ID. If still unauthorized, it's just empty string
  window.accountId = window.walletConnection.getAccountId();

  // Initializing our contract APIs by contract name and configuration
  window.contract = await new Contract(
    window.walletConnection.account(),
    nearConfig.contractName,
    {
      viewMethods: [
        'num_of_bikes',
        'is_available',
        'who_is_using',
        'who_is_inspecting',
        'amount_to_use_bike',
      ],
      changeMethods: ['inspect_bike', 'return_bike'],
    },
  );

  window.ftContract = await new Contract(
    window.walletConnection.account(),
    nearConfig.ftContractName,
    {
      viewMethods: ['ft_balance_of', 'storage_balance_of'],
      changeMethods: [
        'storage_deposit',
        'storage_unregister',
        'ft_transfer',
        'ft_transfer_call',
      ],
    },
  );
}

export function logout() {
  window.walletConnection.signOut();
  // reload page
  window.location.replace(window.location.origin + window.location.pathname);
}

export function login() {
  // Allow the current app to make calls to the specified contract on the
  // user's behalf.
  // This works by creating a new access key for the user's account and storing
  // the private key in localStorage.
  window.walletConnection.requestSignIn(nearConfig.contractName);
}

export async function num_of_bikes() {
  const n = await window.contract.num_of_bikes();
  return n;
}

export async function is_available(index) {
  const response = await window.contract.is_available({
    index: index,
  });
  return response;
}

export async function who_is_using(index) {
  const response = await window.contract.who_is_using({
    index: index,
  });
  return response;
}

export async function who_is_inspecting(index) {
  const response = await window.contract.who_is_inspecting({
    index: index,
  });
  return response;
}

export async function inspect_bike(index) {
  const response = await window.contract.inspect_bike({
    index: index,
  });
  return response;
}

export async function return_bike(index) {
  const response = await window.contract.return_bike({
    index: index,
  });
  return response;
}

/**
 * account_idのftの残高を取得します。
 */
export async function ft_balance_of(account_id) {
  const balance = await window.ftContract.ft_balance_of({
    account_id: account_id,
  });
  return balance;
}

/**
 * account_idのストレージの使用状況を表すデータ構造を取得します。
 * account_idが登録されていない場合はnullが返るので, 登録されているかどうかの判断にこの関数を使用します。
 */
export async function storage_balance_of(account_id) {
  const balance = await window.ftContract.storage_balance_of({
    account_id: account_id,
  });
  return balance;
}

/** ストレージ使用量を支払い登録を行います。 */
export async function storage_deposit() {
  const response = await window.ftContract.storage_deposit(
    {}, // 引数の省略 = このメソッドを呼び出しているアカウントを登録
    '300000000000000', // ガス量の制限(in gas units)
    '1250000000000000000000', // デポジット (in yoctoNEAR, 1 yoctoNEAR = 10^-24 NEAR)
  );
  return response;
}

/** アカウントの登録を解除します。 */
// 今回は簡単のため強制的に解除する方法を引数指定でとっています。
export async function storage_unregister() {
  const response = await window.ftContract.storage_unregister(
    { force: true }, // アカウントの情報に関わらず登録を解除する, 所持しているftはバーンされる
    '300000000000000',
    '1',
  );
  return response;
}

/** ftをreceiver_idへ転送します。 */
export async function ft_transfer(receiver_id, amount) {
  const response = await window.ftContract.ft_transfer(
    {
      receiver_id: receiver_id,
      amount: amount,
    },
    '300000000000000',
    '1', // セキュリティ上必要な 1 yoctoNEAR
  );
  return response;
}

export async function amount_to_use_bike() {
  const amount = await window.contract.amount_to_use_bike();
  return amount;
}

export async function ft_transfer_call(index, amount) {
  const response = await window.ftContract.ft_transfer_call(
    {
      receiver_id: nearConfig.contractName,
      amount: amount,
      msg: index.toString(),
    },
    '300000000000000',
    '1',
  );
  return response;
}
